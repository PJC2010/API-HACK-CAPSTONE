'use strict'

//Declaring variables for betterDoctor URL and API Key

const URL = `https://api.betterdoctor.com/2016-03-01/doctors`;
//?name=${name}&query=${illness}&location=${locationState}-${locationCity}&skip=0&limit=20&user_key=${apiKey}

const apiKey = 'b4ff4e39c659e41553ab2c63a3e67558';

//formatting parameters for api call 

function formatQueryParams(params){
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&')

};

//Google Maps Autocomplete API

function initAutocomplete(){
    var address = document.getElementById('location-city');
    var options = {
        componentRestrictions: {country:['us'], types: ['geocode'] }
    }

    var autocomplete = new google.maps.places.Autocomplete(address);

    autocomplete.addListener('place_changed', function(){
        var place = autocomplete.getPlace();
        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();
        document.getElementById('lat').value = latitude;
        document.getElementById('lng').value = longitude;
        


    })


}




function getDoctors(URL, condition, locationCity, apiKey){
    let lat = $('input[type=hidden][name=lat]').val();
    let lng = $('input[type=hidden][name=lng]').val()
    
    const params = {
        query: condition,
        location: lat + ',' + lng + ',' + '100',
        user_location: lat + ',' + lng,
        sort: 'distance-asc',
        skip: 0,
        limit: 20,
        user_key: apiKey
    };

    const queryString = formatQueryParams(params)
    //console.log(queryString)
    
    const searchURL = `${URL}?${queryString}`
    console.log(searchURL)
    fetch(searchURL)
    .then(response => {
        if(response.ok){
            $('.loading-screen').hide()
            return response.json()
        }
        throw new Error(response.statusText)
    })

    .then
    (responseJson => displayResults(responseJson))
    .catch(err => {
        
        $('#js-error-message').text(`Something went wrong: ${err.message}`)
    })
};




function displayResults(responseJson){
    
    //console.log(responseJson);
    if(responseJson.data.length > 0){
    
    for(let i = 0; i < responseJson.data.length; i++){
        const firstName = responseJson.data[i].profile.first_name;
        const lastName = responseJson.data[i].profile.last_name;
        const img =  responseJson.data[i].profile.image_url;
        const street = responseJson.data[i].practices[0].visit_address.street;
        const city = responseJson.data[i].practices[0].visit_address.city;
        const state = responseJson.data[i].practices[0].visit_address.state;
        const zipCode = responseJson.data[i].practices[0].visit_address.zip;
        const phone = responseJson.data[i].practices[0].phones[0].number;
        
        // let specialty = responseJson.data[i].specialties;
        let specialty = responseJson.data[i].specialties.map(s => s.name).join(' | ')
        if(responseJson.data[i].specialties.length  === 0){
            specialty = 'No specialty information available.'
        }else{
            specialty 
        };

        let website = responseJson.data[i].practices[0].website;

        if(!website || website.length === 0){
            website = 'No website available'
        };

        let newPatient = (responseJson.data[i].practices[0].accepts_new_patients? "Yes": "No");
        
       
        
        $('#results').append(
            `
            <div class="doc-results">
                <ul class="doc-list">
                        <li>
                        <div id="MD-card">
                            <div class="primary-info">
                                <div class="provider-image">
                                    <img src="${img}">
                                </div>
                                <p><span class="bold"><b>Dr.</b></span><b> ${firstName} ${lastName}</b></p>
                                <p><span class="bold">Address:</span> ${street}, ${city}, ${state} ${zipCode}</p>
                                <p><span class="bold">Accept new patients:</span> ${newPatient}</p>
                                <p><span class="bold">Phone number:</span> <a href="tel:${phone}">${phone}</a></p>
                                <p><span class="bold">Website:</span> <a href="${website}">${website}</a></p>
                                <p><span class="bold">Specialties:</span> ${specialty}</p>
                            </div>
                        </div>
                        </li>
                    </ul>
            </div>
            `
        )

        


    };

    }else {
        showFailScreen(responseJson)
    };
}; 

function showFailScreen(){
        $('#results').append(
            `<section class="fail-screen">
            <div class="fail-text">
            <p>No results found. Please try again.</p>
            </div>
            </section>`
        )
    
};


function watchForm(){  
   
    $('#js-form-submit').submit(event => {
        event.preventDefault();
        $('.instructions').hide()
        $('.loading-screen').show();
        

        $('#results').empty();
        
        const condition = $('#medical-issue').val();
        
        const locationCity = $('#location-city').val();

        $('#js-form-submit input[type="text"]').val('')

        console.log(locationCity);
        getDoctors(URL, condition, locationCity, apiKey)
    })
};
$(watchForm);