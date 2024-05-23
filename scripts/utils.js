let key = "1ofdifXeMD7J1d4d3kN3pyRwTsA8UnxKB0tU8x0U";
let baseURL = "https://developer.nps.gov/api/v1/";

export async function fetchParks(endpoint, query = "") {
  let url = `${baseURL}${endpoint}?api_key=${key}&limit=1000${query}`;
  console.log("GET:", url);
  let res = await fetch(url);
  let data = await res.json();
  return data;
}

export function elById(id){
  return document.getElementById(id)
}

(async () => {
    async function loadTemplate(url, position, selector="body") {
      let text = await fetch(url).then((response) => response.text());
      document.querySelector(selector).insertAdjacentHTML(position, text);
    }
    await loadTemplate("./partials/header.html", "afterbegin");
    await loadTemplate("./partials/nav.html", "beforeend", "header");
    await loadTemplate("./partials/footer.html", "beforeend");
  })();
  
  