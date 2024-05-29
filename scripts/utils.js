let key = "1ofdifXeMD7J1d4d3kN3pyRwTsA8UnxKB0tU8x0U";
let key2 = "f2e36b633016e8e4455cd9e98b32a633";
let baseURL = "https://developer.nps.gov/api/v1/";
let weatherURL = `https://api.openweathermap.org/data/2.5/{forecast}?lat={lat}&lon={lon}&appid=${key2}&units=imperial`;

export async function fetchParks(endpoint, query = "") {
  let url = `${baseURL}${endpoint}?api_key=${key}&limit=1000${query}`;
  console.log("GET:", url);
  let res = await fetch(url);
  let data = await res.json();
  return data;
}

export async function fetchWeather(weatherType, lat, lon) {
  let url = weatherURL
    .replace("{forecast}", weatherType)
    .replace("{lat}", lat)
    .replace("{lon}", lon);
  let res = await fetch(url);
  return await res.json();
}

export function elById(id) {
  return document.getElementById(id);
}

export function lazyImage(src, alt) {
  let img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.width = "100";
  img.height = "100";
  img.classList.add("unfinished");
  img.setAttribute(
    "onload",
    `(()=> {
    this.classList.remove('unfinished'); 
    if(this.width > this.height){
      this.classList.add('wide');
    }
  })()`
  );
  img.setAttribute("onerror", "(()=> {this.classList.remove('unfinished')})()");
  return img;
}

export function showLoadedContent(container, content) {
  container.innerHTML = "";
  if (Array.isArray(content)) {
    content.forEach((c) => container.append(c));
  } else {
    container.append(content);
  }
}

(async () => {
  async function loadTemplate(url, position, selector = "body") {
    let text = await fetch(url).then((response) => response.text());
    document.querySelector(selector).insertAdjacentHTML(position, text);
  }
  await loadTemplate("./partials/header.html", "afterbegin");
  await loadTemplate("./partials/nav.html", "beforeend", "header");
  await loadTemplate("./partials/footer.html", "beforeend");
})();
