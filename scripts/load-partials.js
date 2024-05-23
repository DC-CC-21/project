(() => {
  async function fetchPartial(url, position, selector="body") {
    let text = await fetch(url).then((response) => response.text());
    document.querySelector(selector).insertAdjacentHTML(position, text);
  }
  fetchPartial("./partials/header.html", "afterbegin");
  fetchPartial("./partials/nav.html", "beforeend", "header");
  fetchPartial("./partials/footer.html", "beforeend");
})();

