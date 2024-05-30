import { elById, fetchParks } from "./utils.js";

let results = elById("searchResults");

function createCard(park) {
  fetch(park.images[0].url)
    .then((res) => res.blob())
    .then((blob) => {
      let a = document.createElement("a");
      a.classList.add("card");
      a.href = `details.html?parkCode=${park.parkCode}`;

      let p = document.createElement("p");
      p.innerHTML = park.fullName;

      let img = document.createElement("img");
      // img.src = park.images[0].url;
      img.src = URL.createObjectURL(blob);
      img.loading = "lazy";
      img.classList.add("unfinished");
      img.onload = function () {
        this.classList.remove("unfinished");
        console.log(this.width, this.height);
        if (this.width > this.height) {
          console.log("wide", this);
          this.classList.add("wide");
        }
      };

      img.setAttribute("width", "100");
      img.setAttribute("height", "100");

      a.append(p, img);

      results.append(a);
    });
}

let favorites = JSON.parse(localStorage.getItem("likedParks")) || [];

(async () => {
    if(!favorites.length) return
    let parkData = await fetchParks("parks", `&parkCode=${favorites}`);
    console.log(parkData)
    parkData.data.forEach(createCard);
})()