"use strict";

const eventsContainer = document.querySelector(".events");
const locationContainer = document.querySelector(".location");
const date = new Date().toISOString().slice(0, 22);

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const renderEvent = function (date, name, image, cityEvent, url) {
  const html = `<div class="event">
    <a href="${url}" target="_blank"><img src=${image} alt="${name}" /></a>
    <div class="event--description">${date} in ${cityEvent}</div>
    <div class="event--name"><a href="${url}" target="_blank">${name}</a></div>
  </div>`;

  eventsContainer.insertAdjacentHTML("beforeend", html);
};

const getEvents = async function (cityERE = "New York") {
  try {
    // Get location
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    const position = await fetch(
      `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`
    );
    if (!position.ok) throw new Error(`Can't find the country`);
    const dataGeo = await position.json();

    const { country: country, county: city } = dataGeo.address;

    // Get data
    let eventsApi = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?latlong=${lat},${lng}&radius=140&classificationName=music&size=40&startDateTime=&{date}Z&sort=date,asc&apikey=LqGlQ9JQ1oSAuc3cAhEFkui8beOIj3lV`
    );
    if (!eventsApi.ok) throw new Error(`Problem with getting events api`);
    const dataEvents = await eventsApi.json();
    const eventsList = dataEvents._embedded.events;

    // Render events
    const insertEvents = eventsList.map(async (event) => {
      const imageInd = await event.images.findIndex(
        (types) => types.ratio === "4_3"
      );
      const image = await event.images[imageInd].url;
      const date = await event.dates.start.localDate;
      const name = await event.name;
      const url = await event.url;
      const cityEvent = await event._embedded.venues[0].city.name;
      return await renderEvent(date, name, image, cityEvent, url);
    });

    locationContainer.insertAdjacentText(
      "beforeend",
      `You are in ${city}, ${country}`
    );
  } catch (err) {
    console.error(`Ooooops some error 💩${err}💩`);
  }
};

getEvents();
