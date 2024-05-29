import { fetchParks, elById, lazyImage, showLoadedContent, fetchWeather } from "./utils.js";

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const searchParams = new URLSearchParams(window.location.search);
const alertsEl = elById("alerts");
const weatherEl = elById("weather");

function updateMainContent(parkData){
  // # Park Name
  elById("parkName").innerHTML = parkData.fullName;

  // # Park Description
  elById("parkDescription").innerHTML = parkData.description;

  // # Hero Image
  let heroImg = lazyImage(parkData.images[0].url, parkData.fullName);
  heroImg.id = "hero";
  showLoadedContent(elById("heroContainer"), heroImg);

  // # Alternate Views
  let alternateImages = parkData.images.map(image => {
    let div = document.createElement("div");
    let img = lazyImage(image.url, image.altText);
    img.classList.add("altImage");

    div.append(img);
    return div
  })
  showLoadedContent(elById("alternateViewsContainer"), alternateImages);

  // # Location
  let location = document.createElement("p");
  location.innerHTML = `${parkData.addresses[0].city}, ${parkData.addresses[0].stateCode} ${parkData.addresses[0].postalCode}`;

  let line = document.createElement("p")
  line.innerHTML = `${parkData.addresses[0].line1}`

  let latlon = document.createElement("p")
  latlon.innerHTML = parkData.latLong;
  showLoadedContent(elById("locationContainer"), [location, line, latlon]);

}
function updateHours(parkData){
  // # Park Hours
  let hours = parkData.operatingHours[0].standardHours;
  let day = new Date().toLocaleString("en-US", { weekday: "long" });
  
  let hoursElements = Object.keys(hours).map((key) => {
    let parkDay = key.capitalize();
    let p = document.createElement("p");
    p.innerHTML = `${parkDay}: ${hours[key]}`;
    if(day === parkDay){
      p.classList.add("today")
    }
    return p
  })
  showLoadedContent(elById("hoursContainer"), hoursElements)
}
function updateBlobs(parent, data, type){
  // # Related Activities & Topics
  let blobs = data.map((item) => {
    let a = document.createElement("a");
    a.classList.add("blob");
    a.href=`search.html?filter=${type}&search=${item.name}`;
    a.innerHTML = item.name;
    return a
  })
  showLoadedContent(parent, blobs)
}

function showAlerts(alerts) {
  alertsEl.innerHTML = "";
  alerts.data.forEach((alert) => {
    let div = document.createElement("div");
    let h4 = document.createElement("h4");
    h4.innerHTML = alert.title;

    let p = document.createElement("p");
    p.innerHTML = alert.description;

    div.append(h4, p);
    if (alert.url) {
      let a = document.createElement("a");
      a.href = alert.url;
      a.innerHTML = `Learn more about this alert`;
      a.ariaLabel = alert.title;
      div.append(a);
    }
    alertsEl.append(div);
  });
}


function currentWeather(weather){
  let img = document.createElement("img")
  img.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
  
  let p = document.createElement("p")
  p.innerHTML = `${weather.weather[0].description.capitalize()} ${weather.main.temp.toFixed(0)}°F`
  showLoadedContent(elById("currentWeather"), [img, p])
}
function forecastWeather(weather){
  console.log(weather)
  let weatherData = []
  for(let i = 0; i < weather.list.length; i += 8){
    let value = weather.list[i]
    weatherData.push(value)
  }
  weatherData = weatherData.slice(0, 4).map(value => {
    let div = document.createElement("div")
    div.classList.add("weatherTile")

    let h4 = document.createElement("h4")
    h4.innerHTML = new Date(value.dt_txt).toLocaleDateString("en-US", { weekday: "long" })
    
    let img = document.createElement("img")
    img.src = `https://openweathermap.org/img/wn/${value.weather[0].icon}.png`
    let p = document.createElement("p")
    p.innerHTML = `${value.weather[0].description.capitalize()} ${value.main.temp.toFixed(0)}°F`
    div.append(h4, img, p)
    return div
  })
  showLoadedContent(elById("forecastContainer"), weatherData)
}

async function displayWeather(parkData){
  let lat = parkData.latitude;
  let lon = parkData.longitude;
  currentWeather(await fetchWeather("weather", lat, lon))
  forecastWeather(await fetchWeather("forecast", lat, lon))
}

(async () => {
  let parkData = (await fetchParks(
    "parks",
    `&parkCode=${searchParams.get("parkCode")}`
  )).data[0];

  displayWeather(parkData)
  updateMainContent(parkData)
  updateHours(parkData)
  updateBlobs(elById("relatedActivities"), parkData.activities, "activities");
  updateBlobs(elById("relatedTopics"), parkData.topics, "topics");

  let alerts = await fetchParks(
    "alerts",
    `&parkCode=${searchParams.get("parkCode")}`
  );
  showAlerts(alerts);
})();

document.addEventListener("click", (e) => {
  if (e.target.classList.value.includes("altImage")) {
    elById("hero").src = e.target.src;
  }
});
