navigator.geolocation.getCurrentPosition((data) => {
  {
    const { longitude, latitude } = data.coords;
    const parsedData = JSON.parse(campground);
    // console.log([longitude, latitude]);
    let locationData;
    if (parsedData.geometry.coordinates.length === 2) {
      locationData = parsedData.geometry.coordinates;
    } else {
      locationData = [longitude, latitude];
    }
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/streets-v12", // style URL
      center: locationData, // starting position [lng, lat]
      zoom: 8, // starting zoom
    });
    new mapboxgl.Marker()
      .setLngLat(locationData)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${parsedData.title}</h3> <p>${parsedData.location}</p>`))
      .addTo(map);
  }
});
