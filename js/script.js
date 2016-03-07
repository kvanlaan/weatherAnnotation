///test logging to the console
console.log('hello weather')

//Router function//controls everything on page//Is activated by the Hashchange event//
var router = function() {  // Will read the hash and invoke the proper function
	///route is url after the hash, tells us location within app
	var route = window.location.hash.substr(1), //obtain current route// substr deletes"#" sign
		routeParts = route.split('/'), ///split the string into an array using "/" as separator
		viewType = routeParts[0], //viewType is obtained as it comprises the first part of route, therefore index 0
		lat = routeParts[1], //latitude is obtained as it comprises the 2nd part of route, therefore index 1
		lng = routeParts[2]//longitude is obtained as it comprises the 2nd part of route, therefore index 2
//Create a series of if statements to set up different views// 
	if (route === "") { 
		handleDefault() //if there is no current route, we will create a new route, where the view is currentView
		 // and where lat and long are populated by navigator.geolocator.getCurrentPosition(). the resulting hashchange
		 // will trigger the controller to run again.
		 // i.e., handleDefault doesn't really do anything. it just writes a new route, which will case the router to run again. 
		 // that new route will always be "#current/<currentLat>/<currentLong>"
	}

	if (viewType === "current") {
		handleCurrentView(lat,lng)//invokes function which obtains jsonData for current weather based on latitude and longitude extracted from route and renders that data to the container 
	}
	if (viewType === "daily") {
		handleDailyView(lat,lng)//invokes function which obtains jsonData for daily weather based on latitude and longitude extracted from route and renders that data to the container
	}
	if (viewType === "hourly") {//invokes function which obtains jsonData for hourly weather based on latitude and longitude extracted from route and renders that data to the container
		handleHourlyView(lat,lng)
	}
}


///Changes the `view` segment of the route in accordance with the button clicked
var changeView = function(clickEvent) { //Function takes a clickEvent as input, as changeView will be set up as the event handler for
	// click events inside the buttons' container 
	var route = window.location.hash.substr(1), ////obtain current route, since we need to know what the old
		// lat and lng were before we rewrite the hash.
		routeParts = route.split('/'),///split to get variables for later use// 
		lat = routeParts[1],
		lng = routeParts[2]

	var buttonEl = clickEvent.target, //Which of our three buttons was clicked? the event's target denotes the DOM node where the event took place.
		newView = buttonEl.value//Each button has a "value" attribute which mirrors the name of the intended view (see HTML)
	location.hash = newView + "/" + lat + "/" + lng//Reset location.hash to reflect newView, triggering//
	// a hashevent which will invoke the Router function//
}

//executing the promises
var handleCurrentView = function(lat,lng) {
	var promise = makeWeatherPromise(lat,lng)//obtain and set-up promise from makeWeatherPromise(function which returns a promise)//
	promise.then(renderCurrentWeather)//puts our rendering function into position. it won't be run until the data has been retrieved.
}

var handleDailyView = function(lat,lng) {
	var promise = makeWeatherPromise(lat,lng)//obtain and set-up promise from makeWeatherPromise(function which returns a promise)//
	promise.then(renderDailyWeather)//puts our rendering function into position. it won't be run until the data has been retrieved.
}

//Activates geolocation
//handleDefault will run when the page is initially loaded because the route will === ""/// see line 13
var handleDefault = function() {
// successCallback function will run if the user accepts the browser's prompt for location access//
	var successCallback = function(positionObject) {
		var lat = positionObject.coords.latitude //Create latitude variable from position input//
		var lng = positionObject.coords.longitude //Create longitude variable from position input//
		location.hash = "current/" + lat + "/" + lng //change the hash to trigger the router function//we're starting with Current Weather as our default//
	}
	//errorCallback will run if no location provided///
	var errorCallback = function(error) {
		console.log(error)
	}
	window.navigator.geolocation.getCurrentPosition(successCallback,errorCallback) //make a request for geolocation data. 
	// our successCallback will be queued up for invocation once that request receives data.
}

///executing HourlyView promise
var handleHourlyView = function(lat,lng) {
	var promise = makeWeatherPromise(lat,lng)//creates promise based on obtained lat and lng variables
	promise.then(renderHourlyWeather)//puts our rendering function into position. it won't be run until the data has been retrieved.	
}

//creating Promise based on correctly formatted url structure
var makeWeatherPromise = function(lat,lng) {
	//create the url for promise with newly procured latitude and longitude variables
	var url = baseUrl + "/" + apiKey + "/" + lat + "," + lng + "?callback=?" //"?callback=?" is hack cross-origin requests to work in chrome. (e.g. github.io is a different origin than forecast.io)
	var promise = $.getJSON(url)
	return promise 
}

//Create Html Strings and to append to innerHtml
var renderCurrentWeather = function(jsonData) { //Create html string with data obtained from jsonData object//
	container.innerHTML = '<p class="temp">' + jsonData.currently.temperature.toPrecision(2) + '&deg;</p>' //create html string with data obtained from Json object//
}

var renderDailyWeather = function(jsonData) { //create html string with data obtained from jsonData object//
	var htmlString = ''
	var daysArray = jsonData.daily.data
	for (var i = 0; i < daysArray.length; i ++) { //Create for loop to obtain multiple days of weather//
		var dayObject = daysArray[i] 
		htmlString += '<div class="day">' //create a div to house your data
		htmlString += '<p class="max">' + dayObject.temperatureMax.toPrecision(2) + '&deg;</p>' ///append the the tempatureMax attribute to the html string//
		htmlString += '<p class="min">' + dayObject.temperatureMin.toPrecision(2) + '&deg;</p>'///append the the tempatureMin attribute to the html string//
		htmlString += '</div>' //close div//
	}
	container.innerHTML = htmlString //change innerHtml of container div to the new string//
}

//Create Html Strings and to append to innerHtml
var renderHourlyWeather = function(jsonData) { //create html string with data obtained from jsonData object//
	var htmlString = ''
	var hoursArray = jsonData.hourly.data
	for (var i = 0; i < 24; i ++) {  //create for loop to obtain multiple hours of weather//
		var hourObject = hoursArray[i]
		htmlString += '<div class="hour">' //create a div to house your data
		htmlString += '<p class="hourTemp">' + hourObject.temperature.toPrecision(2) + '&deg;</p>' ///create Html String displaying with the temperature attribute//
		htmlString += '</div>' //close div//
	}
	container.innerHTML = htmlString //change innerHtml of container div//
}

//url note// https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE// Reminder of API format for url
//~~~~~global variables///
var apiKey = "976151b2336a5cba8b9ad9404c7cc25e" //you know what an apiKey is...//
var baseUrl = "https://api.forecast.io/forecast"

//~~~~~~Query Selectors//
var container = document.querySelector("#container") //Query select container which we will append our htmlString to//
var buttonsContainer = document.querySelector("#buttons")//Query select buttons which will determine our view changes//

//~~~~~~~Event Listeners///
window.addEventListener('hashchange',router) 
/// Add hashchange event so that the router function will be invoked whenever the hash changes//
//Hashchange events are what give the router(or controller functions in general) so much power//
buttonsContainer.addEventListener('click',changeView)

//~~~~~~Kick it off!//Ensures the router function is invoked initially/ Important since it controls everything!//
router()
// navigator.geolocation.getCurrentPosition(successCallback,errorCallback)