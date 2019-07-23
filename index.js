'use strict'

const URL = `https://api.betterdoctor.com/2016-03-01/doctors`;
//?name=${name}&query=${illness}&location=${locationState}-${locationCity}&skip=0&limit=20&user_key=${apiKey}

const apiKey = 'b4ff4e39c659e41553ab2c63a3e67558';


function formatQueryParams(params){
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&')

};




function getDoctors(URL, condition, locationCity, locationState, apiKey){
    
    const params = {
        query: condition,
        location: `${locationState}-${locationCity.toLowerCase().replace(/ /g, "-")}`,
        skip: 0,
        limit: 20,
        user_key: apiKey
    };

    const queryString = formatQueryParams(params)
    console.log(queryString)
    
    const searchURL = `${URL}?${queryString}`
    console.log(searchURL)
    fetch(searchURL)
    .then(response => {
        if(response.ok){
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
    console.log(responseJson);
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
        if(responseJson.data[i].specialties.length === 0){
            specialty = 'No specialty information available.'
        }else{
            specialty 
        };

        let website = responseJson.data[i].practices.map(s => s.website).join(' ');

        if(!website){
            website = 'No website available'
        };

        let newPatient = (responseJson.data[i].practices[0].accepts_new_patients? "Yes": "No");

        

        

 

        
       
        
        $('#results').append(
            `<section class="provider-list">
                
                    <div id="MD-card">
                        <div class="primary-info">
                            <div class="provider-image">
                                <img src="${img}">
                            </div>
                            <p><span class="bold">Dr.</span> ${firstName} ${lastName}</p>
                            <p><span class="bold">Address:</span> ${street}, ${city}, ${state} ${zipCode}</p>
                            <p><span class="bold">Accept new patients:</span> ${newPatient}</p>
                            <p><span class="bold">Phone number:</span> ${phone}</p>
                            <p><span class="bold">Website:</span> ${website}</p>
                            <p><span class="bold">Specialty:</span> ${specialty}</p>
                        </div>
                    </div>
            </section>`
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

$("#submit-button").click(function() {
    $('html, body').animate({
        scrollTop: $("#results").offset().top
    }, 4000);
});






function watchForm(){
    
   
    $('#js-form-submit').submit(event => {
        event.preventDefault();

        $('#results').empty();

        const condition = $('#medical-issue').val();
        const locationState = $('#location-state').val();
        const locationCity = $('#location-city').val();

        console.log(locationState, locationCity);
        getDoctors(URL, condition, locationCity, locationState, apiKey)
    })
};
$(watchForm);