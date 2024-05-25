import { fetchParks } from "./utils.js";

(async () => {
    console.log(await fetchParks("parks", "stateCode=CO"));

})()