import { fetchParks, elById } from "./utils.js";

function slideshowTemplate(data, title) {
  return `
        <h3>${title}</h3>
        <div class="slideshow">
            <button class="slideshowBtn prev"><</button>
            <div>
            ${data
              .map((park) => {
                return `
                <a href="details.html?parkCode=${park.parkCode}">
                  <img
                    src="${park.images[0].url}"
                    alt="${park.images[0].altText}"
                    width="100"
                    height="100"
                    loading="lazy"
                    class="unfinished"
                    onload="(()=> {this.classList.remove('unfinished')})()"
                    onerror="(()=> {this.classList.remove('unfinished')})()"
                  >
                    <p>${park.fullName}</p>
                  </a href="details.html?id=${park.id}">
                    `;
              })
              .join("")}
            </div>
            <button class="slideshowBtn next">></button>
        </div>
    `;
}

let currentChild = 0;

(async () => {
  let data = await fetchParks("parks")
  let slideshowParks = [];
  for (let i = 0; i < 10; i++) {
    let idx = Math.floor(Math.random() * data.data.length);
    slideshowParks.push(data.data[idx]);
    data.data.splice(idx, 1);
  }
  console.log(slideshowParks);
  elById("slideshows").innerHTML = slideshowTemplate(
    slideshowParks,
    "Featured Parks"
  );
})();

document.addEventListener("click", (e) => {
  let targetClass = e.target.classList.value;
  if (targetClass.includes("slideshowBtn")) {
    let slideshowChildren;
    if (targetClass.includes("next")) {
      slideshowChildren = e.target.previousElementSibling.children
      if(++currentChild >= slideshowChildren.length){
        currentChild = 0
      }
    } else if (targetClass.includes("prev")) {
      slideshowChildren = e.target.nextElementSibling.children
      if(--currentChild < 0){
        currentChild = slideshowChildren.length-1
      }
    }
    slideshowChildren[currentChild].scrollIntoView();
  }
});
