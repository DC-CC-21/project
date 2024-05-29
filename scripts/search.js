import { fetchParks, elById } from "./utils.js"

let searchOptions = {
  states: [], // .addresses.stateCode
  postalCode: [], // .addresses.postalCode
  activities: [], // .activities.name
  name: [], // .name
};
let filter = "all";
let parkData;

const results = elById("searchResults");
const searchString = elById("searchString");
const select = elById("filter");


function getSearchOptions(data) {
  data.forEach((value) => {
    value.addresses.forEach((x) => {
      // searchOptions["stateCode"].push(x.stateCode);
      searchOptions["postalCode"].push(x.postalCode);
    });
    value.activities.forEach((x) => searchOptions["activities"].push(x.name));
    searchOptions["states"].push(...value.states.split(","))
    searchOptions["name"].push(value.name);
  });
  Object.keys(searchOptions).forEach((option) => {
    searchOptions[option] = Array.from(new Set(searchOptions[option]));
  });
  updateSelectMenu();
}

function updateSelectMenu() {
  Object.keys(searchOptions).forEach((option) => {
    let optionElement = document.createElement("option");
    optionElement.innerHTML = option;
    optionElement.value = option;
    select.append(optionElement);
  });
}

function fillDatalist(key) {
  let datalist = elById("options");
  datalist.innerHTML = "";
  searchOptions[key].sort().forEach((optionValue) => {
    let option = document.createElement("option");
    option.innerHTML = optionValue;
    option.value = optionValue;
    datalist.append(option);
  });
}

async function parkSearch() {
  results.innerHTML = "";
  let searchResults = filterParkData(filter, searchString.value)
  searchResults.forEach(createCard);
}

function filterParkData(filter, searchString){
  return parkData.data.filter(x => {
    let dataValue = x[filter];
    if(typeof dataValue === 'string'){
      return dataValue.toLowerCase().includes(searchString.toLowerCase());
    } else if(Array.isArray(dataValue)){
      return dataValue.filter(y => y.name.toLowerCase().includes(searchString.toLowerCase())).length
    }
  })
}

function createCard(park) {
  fetch(park.images[0].url)
  .then(res => res.blob())
  .then(blob => {
    let a = document.createElement("a");
    a.classList.add("card");
    a.href = `details.html?parkCode=${park.parkCode}`;
    
    let p = document.createElement("p");
    p.innerHTML = park.fullName;
    
    
    let img = document.createElement("img");
    // img.src = park.images[0].url;
    img.src = URL.createObjectURL(blob)
    img.loading = "lazy";
    img.classList.add("unfinished")
    img.onload = function() {
      this.classList.remove("unfinished");
      console.log(this.width, this.height)
      if(this.width > this.height){
        console.log("wide", this)
        this.classList.add("wide")
      }
    }
    
    img.setAttribute("width", "100");
    img.setAttribute("height", "100");
    
    a.append(p, img);
    
    results.append(a);
  })
}


(async () => {
  parkData = await fetchParks("parks");
  getSearchOptions(parkData.data);
})();


// # Event Listeners
select.addEventListener("change", (event) => {
  // Listen for changes to the select element
  filter = event.target.value;
  searchString.value = ""
  searchString.focus()
  fillDatalist(filter);
});

elById("search").addEventListener("click", (e) => {
  parkSearch();
});

searchString.addEventListener("keyup", (e) => {
  if(e.code === "Enter" || e.code === "NumpadEnter"){
    parkSearch();
  }
})