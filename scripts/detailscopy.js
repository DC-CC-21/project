import { fetchParks, elById, lazyImage } from "./utils.js";

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

let parkData;
const searchParams = new URLSearchParams(window.location.search);
const alertsEl = elById("alerts");
const detailsEl = elById("details");
const weatherEl = elById("weather");

function parkDetailsTemplate(park) {
  let hours = park.operatingHours[0].standardHours;
  let day = new Date().toLocaleString("en-US", { weekday: "long" });
  return `
        <div id="mainContent">
          <div>
            <h2>${park.fullName}</h2>
            <p id="parkDescription">${park.description}</p>
            <div id="heroContainer">
                <img 
                    src="${park.images[0].url}"
                    alt="park image"
                    width="100"
                    height="100"
                    id="hero"
                    class="unfinished"
                    onload="(()=> {this.classList.remove('unfinished')})()"
                />
            </div>
            <div id="alternateViews">
              <div>
                ${park.images
                  .map((image) => {
                    let img = document.createElement("img");
                    img.src = image.url;
                    return `
                    <div>
                      <img
                        src="${image.url}"
                        alt="${image.altText}"
                        width="100"
                        height="100"
                        loading="lazy"
                        class="altImage unfinished ${
                          img.width > img.height ? "wide" : ""
                        }"
                        onload="(()=> {this.classList.remove('unfinished')})()"
                        onerror="(()=> {this.classList.remove('unfinished')})()"
                      >
                    </div>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          </div>
        </div>
        <div id="hours">
            <h3>Park Hours</h3>
            ${Object.keys(hours)
              .map((key) => {
                let parkDay = key.capitalize();
                console.log(parkDay, day);
                return `
                    <p ${day === parkDay ? "class='today'" : ""}>
                      ${parkDay}: ${hours[key]}
                    </p>
                `;
              })
              .join("")}
        </div>

        <div id="activities">
            <h3>Activities</h3>
            <div class="blobContainer">
            ${park.activities
              .map(
                (activity) =>
                  `
                    <a class="blob" href="search.html?filter=activity&search=${activity.name}>${activity.name}</a>
                `
              )
              .join("")}
            </div>
        </div>
        <div id="topics">
            <h3>Topics</h3>
            <div class="blobContainer">
            ${park.topics
              .map(
                (topic) =>
                  `
                    <a class="blob" href="search.html?filter=topic&search=${topic.name}>${topic.name}</a>
                `
              )
              .join("")}
            </div>
        </div>
    `;
}

class ParkDetails {
  constructor(parkData) {
    this.park = parkData.data[0];
    this.mainContentDiv = elById("mainContent");
    this.mainContentDiv.innerHTML = "";
    this.contentDiv = document.createElement("div");
    this.mainContentDiv.appendChild(this.contentDiv);
  }
  init() {
    this.parkHero();
    this.alternateViews();
    this.hours();
    this.activities();
    this.topics()
    this.location()
  }
  parkHero() {
    this.contentDiv.innerHTML = `
      <h2>${this.park.fullName}</h2>
      <p id="parkDescription">${this.park.description}</p>
      <div id="heroContainer">
          <img 
              src="${this.park.images[0].url}"
              alt="park image"
              width="100"
              height="100"
              id="hero"
              class="unfinished"
              onload="(()=> {this.classList.remove('unfinished')})()"
          />
      </div>
`;
  }
  alternateViews() {
    this.contentDiv.innerHTML += `
      <div id="alternateViews">
        <div>
          ${this.park.images
            .map((image) => {
              let img = document.createElement("img");
              img.src = image.url;
              return `
                <div>
                  <img
                    src="${image.url}"
                    alt="${image.altText}"
                    width="100"
                    height="100"
                    loading="lazy"
                    class="altImage unfinished ${
                      img.width > img.height ? "wide" : ""
                    }"
                    onload="(()=> {this.classList.remove('unfinished')})()"
                    onerror="(()=> {this.classList.remove('unfinished')})()"
                  >
                </div>
              `;
          })
          .join("")}
        </div>
      </div>
      `;
  }
  hours() {
    let hours = this.park.operatingHours[0].standardHours;
    let day = new Date().toLocaleString("en-US", { weekday: "long" });
    elById("hours").innerHTML = `
        <h3>Park Hours</h3>
        ${Object.keys(hours)
          .map((key) => {
            let parkDay = key.capitalize();
            return `
            <p ${day === parkDay ? "class='today'" : ""}>
            ${parkDay}: ${hours[key]}
            </p>
            `;
          })
          .join("")}
    `;
  }
  activities() {
    let activitiesHTML = `
        <h3>Activities</h3>
        <div class="blobContainer">
          ${this.park.activities
            .map((activity) => {
              return `
                <a class="blob" href="search.html?filter=activity&search=${activity.name}">${activity.name}</a>
                `;
            })
            .join("")}
        </div>
      `;
      elById("activities").innerHTML = activitiesHTML;
  }
  topics() {
    elById("topics").innerHTML =
    `
              <h3>Topics</h3>
              <div class="blobContainer">
              ${this.park.topics
                .map(
                  (topic) =>
                    `
                      <a class="blob" href="search.html?filter=topic&search=${topic.name}">${topic.name}</a>
                  `
                )
                .join("")}
              </div>
     
      `;
  }
  location () {
    this.contentDiv.innerHTML += `
      <div>
        <h3>Location</h3>
        <p>
          ${this.park.addresses[0].city}, ${this.park.addresses[0].postalCode}
        </p>
        <p>
          ${this.park.addresses[0].line1}
        <p>
      </div>
    `
  }
}

function fillParkDetails(park) {
  //# Append hero image
  let heroImg = lazyImage(park.images[0].url, park.fullName);
  heroImg.id = "hero";
  elById("heroContainer").innerHTML = heroImg.outerHTML;

  // # append alternate images
  let alternateViews = elById("alternateViews");
  alternateViews.innerHTML = "<div></div>";
  park.images.forEach((image) => {
    let div = document.createElement("div");

    let img = lazyImage(image.url, image.altText);
    img.classList.add("altImage");

    if (img.width > img.height) {
      img.classList.add("wide");
    }

    div.append(img);
    alternateViews.querySelector("div").append(div);
  });

  let hours = elById("hours");
  hours.innerHTML = "";

  let h3 = document.createElement("h3");
  h3.innerHTML = "Park Hours";

  hours.append(h3);
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

(async () => {
  // ! TEMP DATA
  parkData = {
    total: "1",
    limit: "1000",
    start: "0",
    data: [
      {
        id: "6DA17C86-088E-4B4D-B862-7C1BD5CF236B",
        url: "https://www.nps.gov/acad/index.htm",
        fullName: "Acadia National Park",
        parkCode: "acad",
        description:
          "Acadia National Park protects the natural beauty of the highest rocky headlands along the Atlantic coastline of the United States, an abundance of habitats, and a rich cultural heritage. At 4 million visits a year, it's one of the top 10 most-visited national parks in the United States. Visitors enjoy 27 miles of historic motor roads, 158 miles of hiking trails, and 45 miles of carriage roads.",
        latitude: "44.409286",
        longitude: "-68.247501",
        latLong: "lat:44.409286, long:-68.247501",
        activities: [
          {
            id: "09DF0950-D319-4557-A57E-04CD2F63FF42",
            name: "Arts and Culture",
          },
          {
            id: "FAED7F97-3474-4C21-AB42-FB0768A2F826",
            name: "Cultural Demonstrations",
          },
          {
            id: "13A57703-BB1A-41A2-94B8-53B692EB7238",
            name: "Astronomy",
          },
          {
            id: "D37A0003-8317-4F04-8FB0-4CF0A272E195",
            name: "Stargazing",
          },
          {
            id: "7CE6E935-F839-4FEC-A63E-052B1DEF39D2",
            name: "Biking",
          },
          {
            id: "071BA73C-1D3C-46D4-A53C-00D5602F7F0E",
            name: "Boating",
          },
          {
            id: "A59947B7-3376-49B4-AD02-C0423E08C5F7",
            name: "Camping",
          },
          {
            id: "7CFF5F03-5ECC-4F5A-8572-75D1F0976C0C",
            name: "Group Camping",
          },
          {
            id: "B12FAAB9-713F-4B38-83E4-A273F5A43C77",
            name: "Climbing",
          },
          {
            id: "87D3B1CD-3903-4561-ABB1-2DD870C43F2F",
            name: "Rock Climbing",
          },
          {
            id: "C11D3746-5063-4BD0-B245-7178D1AD866C",
            name: "Compass and GPS",
          },
          {
            id: "CA3641A0-FADC-497F-B036-3FE426D0DDCC",
            name: "Geocaching",
          },
          {
            id: "AE42B46C-E4B7-4889-A122-08FE180371AE",
            name: "Fishing",
          },
          {
            id: "25FB188F-5AAD-459A-9092-28A9801709FF",
            name: "Freshwater Fishing",
          },
          {
            id: "9BC03FAF-28F1-4609-BF6F-643F58071AED",
            name: "Fly Fishing",
          },
          {
            id: "17411C8D-5769-4D0F-ABD1-52ED03840C18",
            name: "Saltwater Fishing",
          },
          {
            id: "1DFACD97-1B9C-4F5A-80F2-05593604799E",
            name: "Food",
          },
          {
            id: "C6D3230A-2CEA-4AFE-BFF3-DC1E2C2C4BB4",
            name: "Picnicking",
          },
          {
            id: "B33DC9B6-0B7D-4322-BAD7-A13A34C584A3",
            name: "Guided Tours",
          },
          {
            id: "3DE599E2-22ED-40BF-B383-EDA073563C1E",
            name: "Bus/Shuttle Guided Tour",
          },
          {
            id: "5A241412-0CFB-497A-9B5F-0AB8C03CDE72",
            name: "Boat Tour",
          },
          {
            id: "42FD78B9-2B90-4AA9-BC43-F10E9FEA8B5A",
            name: "Hands-On",
          },
          {
            id: "31F88DA6-696F-441F-89CF-D7B1415C4CB9",
            name: "Citizen Science",
          },
          {
            id: "BFF8C027-7C8F-480B-A5F8-CD8CE490BFBA",
            name: "Hiking",
          },
          {
            id: "45261C0A-00D8-4C27-A1F8-029F933A0D34",
            name: "Front-Country Hiking",
          },
          {
            id: "0307955A-B65C-4CE4-A780-EB36BAAADF0B",
            name: "Horse Trekking",
          },
          {
            id: "1886DA47-0AEC-4568-B9C2-8E9BC316AAAC",
            name: "Horseback Riding",
          },
          {
            id: "5FF5B286-E9C3-430E-B612-3380D8138600",
            name: "Ice Skating",
          },
          {
            id: "4D224BCA-C127-408B-AC75-A51563C42411",
            name: "Paddling",
          },
          {
            id: "21DB3AFC-8AAC-4665-BC1F-7198C0685983",
            name: "Canoeing",
          },
          {
            id: "F353A9ED-4A08-456E-8DEC-E61974D0FEB6",
            name: "Kayaking",
          },
          {
            id: "B3EF12AF-D951-419E-BD3C-6B36CBCC1E16",
            name: "Stand Up Paddleboarding",
          },
          {
            id: "DF4A35E0-7983-4A3E-BC47-F37B872B0F25",
            name: "Junior Ranger Program",
          },
          {
            id: "F9B1D433-6B86-4804-AED7-B50A519A3B7C",
            name: "Skiing",
          },
          {
            id: "EAB1EBDE-5B72-493F-8F8F-0EE5B1724436",
            name: "Cross-Country Skiing",
          },
          {
            id: "C38B3C62-1BBF-4EA1-A1A2-35DE21B74C17",
            name: "Snow Play",
          },
          {
            id: "7C912B83-1B1B-4807-9B66-97C12211E48E",
            name: "Snowmobiling",
          },
          {
            id: "01D717BC-18BB-4FE4-95BA-6B13AD702038",
            name: "Snowshoeing",
          },
          {
            id: "587BB2D3-EC35-41B2-B3F7-A39E2B088AEE",
            name: "Swimming",
          },
          {
            id: "82C3230F-6F87-452C-A01B-F8458867B26A",
            name: "Freshwater Swimming",
          },
          {
            id: "C2801992-F34D-4974-A0F2-80FF04309EE4",
            name: "Saltwater Swimming",
          },
          {
            id: "0B685688-3405-4E2A-ABBA-E3069492EC50",
            name: "Wildlife Watching",
          },
          {
            id: "5A2C91D1-50EC-4B24-8BED-A2E11A1892DF",
            name: "Birdwatching",
          },
          {
            id: "0C0D142F-06B5-4BE1-8B44-491B90F93DEB",
            name: "Park Film",
          },
          {
            id: "24380E3F-AD9D-4E38-BF13-C8EEB21893E7",
            name: "Shopping",
          },
          {
            id: "467DC8B8-0B7D-436D-A026-80A22358F615",
            name: "Bookstore and Park Store",
          },
        ],
        topics: [
          {
            id: "00F3C3F9-2D67-4802-81AE-CCEA5D3BA370",
            name: "Arts",
          },
          {
            id: "05B7868A-3F3C-433D-876E-A886C4BE7A12",
            name: "Painting",
          },
          {
            id: "9BD60DC0-C82B-42BA-A170-456B7423429D",
            name: "Photography",
          },
          {
            id: "156AD9B6-B377-418C-BC9A-F6E682D4BAF7",
            name: "Poetry and Literature",
          },
          {
            id: "0DE2D6B3-46DE-44B1-BB5F-E9E8874630D5",
            name: "Sculpture",
          },
          {
            id: "7F12224B-217A-4B07-A4A2-636B1CE7F221",
            name: "Colonization and Settlement",
          },
          {
            id: "4C9D4777-A9DA-47D1-A0B9-F4A3C98BC1B3",
            name: "Maritime",
          },
          {
            id: "263BAC6E-4DEC-47E4-909D-DA8AD351E06E",
            name: "Lighthouses",
          },
          {
            id: "BEB7E470-13B2-4E00-84B2-0402D98DAF69",
            name: "Monuments and Memorials",
          },
          {
            id: "3CDB67A9-1EAC-408D-88EC-F26FA35E90AF",
            name: "Schools and Education",
          },
          {
            id: "FE2C2613-B41E-4531-BC43-03EB6E45CBCF",
            name: "Transportation",
          },
          {
            id: "1015393C-D7B0-47F3-86FB-786F30368CA2",
            name: "Bridges",
          },
          {
            id: "0BBD4A42-2B3D-4E82-B5C4-1A3874C8682E",
            name: "Roads, Routes and Highways",
          },
          {
            id: "A160B3D9-1603-4D89-B82F-21FCAF9EEE3B",
            name: "Tragic Events",
          },
          {
            id: "C373F02B-7335-4F8A-A3ED-3E2E37CD4085",
            name: "Catastrophic Fires",
          },
          {
            id: "7DA81DAB-5045-4953-9C20-36590AD9FA95",
            name: "Women's History",
          },
          {
            id: "0D00073E-18C3-46E5-8727-2F87B112DDC6",
            name: "Animals",
          },
          {
            id: "957EF2BD-AC6C-4B7B-BD9A-87593ADC6691",
            name: "Birds",
          },
          {
            id: "1608649A-E7D7-4529-BD83-074C90F9FB68",
            name: "Fish",
          },
          {
            id: "4DC11D06-00F1-4A01-81D0-89CCCCE4FF50",
            name: "Climate Change",
          },
          {
            id: "04A39AB8-DD02-432F-AE5F-BA1267D41A0D",
            name: "Fire",
          },
          {
            id: "41B1A0A3-11FF-4F55-9CB9-034A7E28B087",
            name: "Forests and Woodlands",
          },
          {
            id: "F0F97E32-2F29-41B4-AF98-9FBE8DAB36B1",
            name: "Geology",
          },
          {
            id: "1CF1F6BB-A037-445B-8CF2-81428E50CE52",
            name: "Lakes",
          },
          {
            id: "101F4D51-F99D-45A6-BBB6-CD481E5FACED",
            name: "Mountains",
          },
          {
            id: "A7359FC4-DAD8-45F5-AF15-7FF62F816ED3",
            name: "Night Sky",
          },
          {
            id: "E06F3C94-AC8A-4B1C-A247-8EBA8910D5EE",
            name: "Astronomy",
          },
          {
            id: "0E6D8503-CB65-467F-BCD6-C6D9E28A4E0B",
            name: "Oceans",
          },
          {
            id: "4244F489-6813-4B7A-9D0C-20CE098C8FFF",
            name: "Rock Landscapes and Features",
          },
          {
            id: "5BE55D7F-BDB6-4E3D-AC35-2D8EBB974417",
            name: "Trails",
          },
          {
            id: "1365C347-952C-475A-B755-731DD523C195",
            name: "Wetlands",
          },
        ],
        states: "ME",
        contacts: {
          phoneNumbers: [
            {
              phoneNumber: "2072883338",
              description: "",
              extension: "",
              type: "Voice",
            },
            {
              phoneNumber: "2072888813",
              description: "",
              extension: "",
              type: "Fax",
            },
            {
              phoneNumber: "2072888800",
              description: "",
              extension: "",
              type: "TTY",
            },
          ],
          emailAddresses: [
            {
              description: "",
              emailAddress: "acadia_information@nps.gov",
            },
          ],
        },
        entranceFees: [
          {
            cost: "6.00",
            description:
              "Vehicle reservations are not required for any other areas of the park, or for visitors who enter the area by foot, bike, or taxi. Vehicle reservations provide a timed entry, but do not require a departure time until 9 pm, when the road closes to vehicles. Reservations do not permit re-entry. Reservations are per vehicle, not per person. Reservations do not assign a specific parking space. Parking is prohibited outside of designated spaces. Cadillac is not served by the Island Explorer bus system.",
            title: "Timed Entry Reservation - Location",
          },
          {
            cost: "35.00",
            description:
              "Valid for seven days. Admits private, non-commercial vehicle (15 passenger capacity or less) and all occupants. This includes rental cars, RVs, and vans with fewer than 16 passengers. If the vehicle pass is purchased, no other pass is necessary.",
            title: "Entrance - Private Vehicle",
          },
          {
            cost: "30.00",
            description:
              "Valid for seven days. Admits one or two passengers on a private, non-commercial motorcycle.",
            title: "Entrance - Motorcycle",
          },
          {
            cost: "20.00",
            description:
              "Valid for seven days. Admits one individual with no car (bicyclist, hiker, pedestrian). Youth 15 and under are admitted free of charge.",
            title: "Entrance - Per Person",
          },
          {
            cost: "0.00",
            description:
              "School groups and other academic institutions may qualify for an Educational Fee Waiver. If not qualified, please check fees for large or commercial groups.",
            title: "Entrance - Education/Academic Groups",
          },
          {
            cost: "0.00",
            description:
              "Groups entering Acadia by bus, van, or other high-capacity vehicles (16 people or more) must pay an organized group entrance fee.\n\nAdults (16 years old and over): $20/per person\nYouth (15 years old and under): Free",
            title: "Entrance - Non-commercial Groups",
          },
          {
            cost: "0.00",
            description:
              'Are you operating a business that provides leisure or recreational services while in the park? If so, it is considered a commercial group and you are required to have a Commercial Use Authorization.\n\nA commercial group is defined as consisting of one or more persons traveling on an itinerary that has been packaged, priced, or sold for leisure or recreational purposes by an organization that realizes financial gain through the provisions of the service. Learn more on our "Do Business With Us" page.',
            title: "Commercial Entrance - Per Person",
          },
        ],
        entrancePasses: [
          {
            cost: "70.00",
            description:
              "The Acadia Annual Pass is valid only at Acadia and may be purchased online or in person. You do not need an additional entrance pass if you already have a federal lands pass. It is valid for 12 months from purchase month. This pass admits the pass holder and passengers in a non-commercial vehicle.\n\nIn addition to park visitor centers and campgrounds, the Acadia Annual Pass is available at the Acadia Regional Chamber at Thompson Island, and at Bar Harbor, Ellsworth and Southwest Harbor chambers of commerce.",
            title: "Annual Entrance - Park",
          },
        ],
        fees: [],
        directionsInfo:
          "From Boston take I-95 north to Augusta, Maine, then Route 3 east to Ellsworth, and on to Mount Desert Island. For an alternate route, continue on I-95 north to Bangor, Maine, then take I-395 to U.S. Route 1A east to Ellsworth. In Ellsworth, take Route 3 to Mount Desert Island.",
        directionsUrl: "http://www.nps.gov/acad/planyourvisit/directions.htm",
        operatingHours: [
          {
            exceptions: [],
            description:
              "Acadia National Park is open year-round. Check our website for park facilities operating hours, such as Hulls Cove Visitor Center.",
            standardHours: {
              wednesday: "All Day",
              monday: "All Day",
              thursday: "All Day",
              sunday: "All Day",
              tuesday: "All Day",
              friday: "All Day",
              saturday: "All Day",
            },
            name: "Acadia National Park",
          },
        ],
        addresses: [
          {
            postalCode: "04609",
            city: "Bar Harbor",
            stateCode: "ME",
            countryCode: "US",
            provinceTerritoryCode: "",
            line1: "25 Visitor Center Road",
            type: "Physical",
            line3: "",
            line2: "Hulls Cove Visitor Center",
          },
          {
            postalCode: "04609",
            city: "Bar Harbor",
            stateCode: "ME",
            countryCode: "US",
            provinceTerritoryCode: "",
            line1: "PO Box 177",
            type: "Mailing",
            line3: "",
            line2: "",
          },
        ],
        images: [
          {
            credit: "NPS / Kristi Rugg",
            title: "Acadia's rocky coastline",
            altText:
              "Large puffy clouds dot a brilliant blue sky as wave crash against the rocky coastline of Acadia.",
            caption:
              "Millions of people come to Acadia for our distinctive rocky coastline.",
            url: "https://www.nps.gov/common/uploads/structured_data/3C7B45AE-1DD8-B71B-0B7EE131C7DFC2F5.jpg",
          },
          {
            credit: "NPS / Kristi Rugg",
            title: "Heavy snow-laden trees",
            altText:
              "Hiking tracks carved through three feet of snow wind through a heavy snow-laden forest.",
            caption:
              "During the colder months snows transform our landscape into a winter wonderland.",
            url: "https://www.nps.gov/common/uploads/structured_data/3C7B4BEC-1DD8-B71B-0B2CF833F93140FF.jpg",
          },
          {
            credit: "NPS / Kristi Rugg",
            title: "Sunset atop Cadillac Mountain",
            altText:
              "A brilliant sunset filled with hues of blue, red, orange, magenta, and purple highlight the sky.",
            caption:
              "As the tallest point on the eastern seaboard Cadillac Mountain provides fantastic viewpoints.",
            url: "https://www.nps.gov/common/uploads/structured_data/3C7B477B-1DD8-B71B-0BCB48E009241BAA.jpg",
          },
          {
            credit: "NPS / Kristi Rugg",
            title: "Climbing The Precipice",
            altText:
              "Two hikers ascend a sheer cliff trail by way of historic iron rung ladders.",
            caption:
              "Whether it's a stroll along Ocean Path or a difficult ascent up The Precipice, there are hiking trails for everyone!",
            url: "https://www.nps.gov/common/uploads/structured_data/3C7B48F9-1DD8-B71B-0BD3B413E58978F8.jpg",
          },
        ],
        weatherInfo:
          "Located on Mount Desert Island in Maine, Acadia experiences all four seasons. Summer temperatures range from 45-90F (7-30C). Fall temperatures range from 30-70F (-1-21C). Typically the first frost is in mid-October and first snowfall begins in November and can continue through April with an average accumulation of 73 inches (185 cm). Winter temperatures range from 14-35F (-10 - 2C). Spring temperatures range from 30-70F (-1-21C).",
        name: "Acadia",
        designation: "National Park",
        multimedia: [
          {
            title: "Acadia Always: The Story of Acadia National Park",
            id: "690AB3A2-21E3-4CFB-9AED-6745C9183D2C",
            type: "multimedia/video",
            url: "https://www.nps.gov/media/video/view.htm?id=690AB3A2-21E3-4CFB-9AED-6745C9183D2C",
          },
          {
            title: "Acadia's Transportation Plan",
            id: "8CF8FF8C-6DBE-4889-810C-A62CA62B2DF5",
            type: "multimedia/video",
            url: "https://www.nps.gov/media/video/view.htm?id=8CF8FF8C-6DBE-4889-810C-A62CA62B2DF5",
          },
          {
            title: "Cultural Connections in the Park",
            id: "06284273-F99C-4988-96CE-3020FB6AF731",
            type: "multimedia/video",
            url: "https://www.nps.gov/media/video/view.htm?id=06284273-F99C-4988-96CE-3020FB6AF731",
          },
          {
            title: "Entrance Passes & Vehicle Reservations",
            id: "99BFEF04-87E0-4159-B47D-91DEF18A0606",
            type: "multimedia/video",
            url: "https://www.nps.gov/media/video/view.htm?id=99BFEF04-87E0-4159-B47D-91DEF18A0606",
          },
          {
            title: "Friends of Acadia",
            id: "F0F81D4C-4CFF-4E94-9A47-765430230EFE",
            type: "multimedia/video",
            url: "https://www.nps.gov/media/video/view.htm?id=F0F81D4C-4CFF-4E94-9A47-765430230EFE",
          },
          {
            title: "Protect Your Pet Privileges",
            id: "7372D443-8951-49CE-993D-8C199200B53E",
            type: "multimedia/video",
            url: "https://www.nps.gov/media/video/view.htm?id=7372D443-8951-49CE-993D-8C199200B53E",
          },
          {
            title: "Acadia Passport Stamps",
            id: "22D2D858-9676-4C40-8E35-27460AF8B5FC",
            type: "multimedia/galleries",
            url: "https://www.nps.gov/media/photo/gallery.htm?id=22D2D858-9676-4C40-8E35-27460AF8B5FC",
          },
          {
            title: "George B. Dorr & Oldfarm",
            id: "70D39A40-5B31-470B-A7DC-0E8CAA7C3DF8",
            type: "multimedia/galleries",
            url: "https://www.nps.gov/media/photo/gallery.htm?id=70D39A40-5B31-470B-A7DC-0E8CAA7C3DF8",
          },
          {
            title: "Interpretive Waysides in Acadia",
            id: "EAAF0FD3-D4FA-4AEB-AECB-8741DEE471AA",
            type: "multimedia/galleries",
            url: "https://www.nps.gov/media/photo/gallery.htm?id=EAAF0FD3-D4FA-4AEB-AECB-8741DEE471AA",
          },
          {
            title: "Winter Storms January 2024",
            id: "E397CD9B-71BC-49D2-8FD4-4FA082DA521B",
            type: "multimedia/galleries",
            url: "https://www.nps.gov/media/photo/gallery.htm?id=E397CD9B-71BC-49D2-8FD4-4FA082DA521B",
          },
        ],
        relevanceScore: 1,
      },
    ],
  };

  parkData = await fetchParks(
    "parks",
    `&parkCode=${searchParams.get("parkCode")}`
  );
  // fillParkDetails(parkData.data[0]);
  let parkDetails = new ParkDetails(parkData);
  parkDetails.init();

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
