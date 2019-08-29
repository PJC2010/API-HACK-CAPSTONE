"use strict";

//Declaring variables for betterDoctor URL and API Key

const URL = `https://api.betterdoctor.com/2016-03-01/doctors`;
//?name=${name}&query=${illness}&location=${locationState}-${locationCity}&skip=0&limit=20&user_key=${apiKey}

const apiKey = "b4ff4e39c659e41553ab2c63a3e67558";

//formatting parameters for api call

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

//Google Maps Autocomplete API

function initAutocomplete() {
  var address = document.getElementById("location-city");
  var options = {
    componentRestrictions: { country: ["us"], types: ["geocode"] }
  };

  var autocomplete = new google.maps.places.Autocomplete(address);

  autocomplete.addListener("place_changed", function() {
    var place = autocomplete.getPlace();
    var latitude = place.geometry.location.lat();
    var longitude = place.geometry.location.lng();
    document.getElementById("lat").value = latitude;
    document.getElementById("lng").value = longitude;
  });
}

function getDoctors(URL, condition, locationCity, apiKey) {
  let lat = $("input[type=hidden][name=lat]").val();
  let lng = $("input[type=hidden][name=lng]").val();

  const params = {
    query: condition,
    location: lat + "," + lng + "," + "100",
    user_location: lat + "," + lng,
    sort: "distance-asc",
    skip: 0,
    limit: 10,
    user_key: apiKey
  };

  const queryString = formatQueryParams(params);

  const searchURL = `${URL}?${queryString}`;

  fetch(searchURL)
    .then(response => {
      if (response.ok) {
        $(".loading-screen").hide();
        return response.json();
      }
      throw new Error(response.statusText);
    })

    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $(".loading-screen").hide();
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
  console.log(searchURL);
}

function displayResults(responseJson) {
  if (responseJson.data.length > 0) {
    for (let i = 0; i < responseJson.data.length; i++) {
      const firstName = responseJson.data[i].profile.first_name;
      const lastName = responseJson.data[i].profile.last_name;
      const img = responseJson.data[i].profile.image_url;
      const practicesString = responseJson.data[i].practices
        .filter(p => p.within_search_area)
        .map(
          p =>
            `${p.visit_address.street}, ${p.visit_address.city}, ${p.visit_address.state} ${p.visit_address.zip}`
        );
      const phone = responseJson.data[i].practices[0].phones[0].number;
      const distanceFromInput = responseJson.data[i].practices
        .filter(d => d.within_search_area)
        .map(d => `${d.distance.toFixed(2)}`);

      let specialty = responseJson.data[i].specialties
        .map(s => s.name)
        .join(" | ");
      if (responseJson.data[i].specialties.length === 0) {
        specialty = "No specialty information available.";
      } else {
        specialty;
      }

      let website = responseJson.data[i].practices[0].website;

      if (!website || website.length === 0) {
        website = " ";
      }

      let newPatient = responseJson.data[i].practices[0].accepts_new_patients
        ? "Accepts New Patients"
        : "Not Accepting New Patients";

      $("#results").append(
        `<div class="doc-results">
          <ul class="doc-list">
            <li>
              <div class="doc-image">
                <img class="doc-image" src="${img}" alt="Dr. ${firstName} ${lastName}">
              </div>
              <div class="doc-content">
                <span class="doc-name"><h3>Dr. ${firstName} ${lastName}</h3></span>
                
                <span class="specialty-type">${specialty}</span>
                <br>
                <span class="distance">${distanceFromInput[0]} Miles away</span>
                <br>
                <span class="office-location">${practicesString[0]}</span>
                <br>
                <span id="new-patient">${newPatient}</span>
                <br>
                <span>Phone:<a href="tel:${phone}"> ${phone}</a></span>
                <br>
                <span>Website: <a href="${website}"> ${website}</a></span>
              </div>
            </li>
          </ul>
        </div>`
      );
    }
  } else {
    showFailScreen(responseJson);
  }
  console.log(responseJson);
}

function showFailScreen() {
  $("#results").append(
    `<section class="fail-screen" aria-live>
            <div class="fail-text">
            <p>No results found. Please try again.</p>
            </div>
            </section>`
  );
}

function watchForm() {
  $("#js-form-submit").submit(event => {
    event.preventDefault();
    $(".instructions").hide();
    $(".loading-screen").show();

    $("#results").empty();

    const condition = $("#medical-issue").val();

    const locationCity = $("#location-city").val();

    $('#js-form-submit input[type="text"]').val("");

    getDoctors(URL, condition, locationCity, apiKey);
  });
}
$(watchForm);
