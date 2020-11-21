import React, { Component } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import '../style/App.css';
import Restaurant from './Restaurant';
import Filters from './Filters'
import Form from './Form'
import Review from './Review'

// API key
const apiKey = "";

// Endpoint of the Place Search API
const placesSearchApiEndpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?type=restaurant&keyword=restaurant&key=" + apiKey;
// Endpoint of the Place Details API
const placesDetailsApiEndpoint = "https://maps.googleapis.com/maps/api/place/details/json?fields=name,rating,formatted_address,review,geometry/location&key=" + apiKey + "&place_id=";
// Endpoint of the Street View Static API
const streetViewStaticApiEndpoint = "https://maps.googleapis.com/maps/api/streetview?size=600x400&key=" + apiKey;
// Endpoint of the Street View Static Metadata API
const streetViewStaticApiMetadataEndpoint = "https://maps.googleapis.com/maps/api/streetview/metadata?size=120x100&key=" + apiKey;

class App extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      showForm: false,
      isMarkerClicked: false,
      minRating: "1",
      maxRating: "5",
      radius: "1500",
      zoom: 14,
      map: null,
      infoMarkerClicked: "",
      apiData: [],
      restaurantsList: [],
      addedRestaurantsByUser: [],
      reviewsMarkerClicked: [],
      bounds: {},
      center: {
        lat: -3.745,
        lng: -38.523
      },
      clickedLocation: {
        lat: 0,
        lng: 0
      }
    };
    this.handleFiltersChange = this.handleFiltersChange.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
  }

  /**
  * Ask for user's geolocation via the javascript 
  * interface "navigator "when the component is mounted
  * 
  */
  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.getPositionSuccess,
        this.getPositionError
      )
    } else {
      console.log("Geolocation not supported by the browser");
    }
  }

  /**
  * Fetch API's data based on the current position of the user geolocated
  * through the javascript geolocation function. 
  * Set the new state of "center"
  * 
  * @param {object} position
  */
  getPositionSuccess = (position) => {
    this.setState({ center: { lat: position.coords.latitude, lng: position.coords.longitude } });
  }

  /**
  * Log error message if geolocation failed
  * 
  * @param {object} error
  */
  getPositionError = (error) => {
    console.log("Error");
    console.error("Error Code = " + error.code + " - " + error.message);
  }

  /**
  * Get the data from the APIs based on the position and the radius.
  * Two APIs are fetched:
  *   1. one call to the Places Search API to get place_id of all restaurants
  *   2. as many calls as there are restaurants from 1. to the Places Details API
  * 
  * This function is called once the map is idle
  * 
  * @param {integer} lat
  * @param {integer} lng
  * @param {integer} radius
  */
  getApiData = (lat, lng, radius) => {
    // Reset state of "isLoading", "apiData" and "restaurantsList" to avoid duplicated components
    this.setState({
      isLoading: true,
      apiData: [],
      restaurantsList: []
    });
    let apiPlaceSearchUrl = placesSearchApiEndpoint + "&location=" + lat + "," + lng + "&radius=" + radius;
    let apiPlacesData = [];
    // Fetch data from Places Search API
    fetch(apiPlaceSearchUrl)
      .then(response => response.ok ? response.json() : console.log("Fetch Place Search API data failed"))
      .then(data => {
        for (let result of data.results) {
          let apiPlaceDetailsUrl = placesDetailsApiEndpoint + result.place_id;
          // Fetch data from Places Details API
          fetch(apiPlaceDetailsUrl)
            .then(response => response.ok ? response.json() : console.log("Fetch Place Details API data failed"))
            .then(data => {
              // Add restaurant's data to an array and update the "restaurantsList"
              apiPlacesData.push(data);
              this.getRestaurantsList(this.state.minRating, this.state.maxRating, this.state.bounds);
            })
            .catch(err => console.log("Error when fetching Place Details API", err))
        }
      })
      .then(() => {
        // Once all data is fetched, set state of "apiData" and "isLoading"
        if (apiPlacesData != null) {
          this.setState({
            apiData: apiPlacesData,
            isLoading: false
          });
        }
      })
      .catch(err => console.log("Error when fetching Place Search API", err));
  }

  /**
  * Set the state of "map" and "bounds" when the map loads for the first time
  * 
  * @param {map} map
  */
  handleMapLoad = (map) => {
    let bounds = map.getBounds();
    this.setState({
      map: map,
      bounds: bounds
    });
  }

  /**
  * Set the state of "bounds" and update the list of restaurants when the map gets 
  * in the idle state (after zoom or drag-n-drop)
  * 
  */
  handleMapIdle = () => {
    const bounds = this.state.map.getBounds();
    const center = this.state.map.getCenter();
    this.setState({ bounds: bounds });
    !this.state.isMarkerClicked && this.getApiData(center.lat(), center.lng(), this.state.radius);
  }

  /**
  * Set the state of "showForm" and "clickedLocation" when clicking on the map
  * 
  * @param {event} event
  */
  handleMapClick = (event) => {
    this.setState(prevState => {
      return {
        showForm: !prevState.showForm,
        clickedLocation: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
      }
    })
  }

  /**
  * Set the state of "radius" when zooming in/out on the map
  * 
  * @param {event} event
  */
  handleMapZoom = () => {
    if (this.state.map != null) {
      let currentZoom = this.state.map.getZoom();
      switch (currentZoom) {
        case 22:
        case 21:
        case 20:
          this.setState({ radius: "250" });
          break;
        case 19:
        case 18:
          this.setState({ radius: "500" });
          break;
        case 17:
        case 16:
          this.setState({ radius: "1000" });
          break;
        case 15:
        case 14:
          this.setState({ radius: "1500" });
          break;
        case 13:
          this.setState({ radius: "2000" });
          break;
        case 12:
          this.setState({ radius: "3000" });
          break;
        case 11:
          this.setState({ radius: "7000" });
          break;
        case 10:
          this.setState({ radius: "20000" });
          break;
        case 9:
          this.setState({ radius: "40000" });
          break;
        case 8:
        case 7:
        case 6:
        case 5:
        case 4:
        case 3:
        case 2:
        case 1:
        case 0:
          this.setState({ radius: "50000" });
          break;
        default:
          this.setState({ radius: "2000" });
      }
    }
  }

  /**
  * Create a new restaurant object based on the data returned by the form,
  * set the state of "apiData" and "showForm" and update the list 
  * of restaurants accordingly when the form is submitted
  * 
  * @param {event} event
  */
  handleFormSubmit = (event) => {
    event.preventDefault();
    const [, name, address, comment, stars] = event.target;
    let newRestaurant = {
      result: {
        name: name.value,
        formatted_address: address.value,
        rating: parseInt(stars.value), // parseInt() parses the value and returns an integer
        geometry: {
          location: {
            lat: this.state.clickedLocation.lat,
            lng: this.state.clickedLocation.lng
          }
        },
        reviews: [
          {
            rating: parseInt(stars.value),
            text: comment.value
          }
        ]
      }
    }
    let updatedRestaurantsByUser = this.state.addedRestaurantsByUser;
    updatedRestaurantsByUser.push(newRestaurant);
    this.setState(prevState => {
      return {
        addedRestaurantsByUser: updatedRestaurantsByUser,
        showForm: !prevState.showForm
      }
    });
    this.getRestaurantsList(this.state.minRating, this.state.maxRating, this.state.bounds);
  }

  /**
  * Set the state of "showForm" and "clickedLocation" when clicking on the 
  * form's cancel button
  * 
  */
  handleFormClick = () => {
    this.setState(prevState => {
      return {
        showForm: !prevState.showForm,
        clickedLocation: {
          lat: 0,
          lng: 0
        }
      }
    })
  }

  /**
  * Set the state of "maxRating" or "minRating" and update the list 
  * of restaurants accordingly when the filters are changed
  * 
  * @param {event} event
  */
  handleFiltersChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value });
    if (name === "minRating") {
      this.getRestaurantsList(value, this.state.maxRating, this.state.bounds);
    } else {
      this.getRestaurantsList(this.state.minRating, value, this.state.bounds);
    }
  }

  /**
  * Set the state of "isMarkerClicked", "infoMarkerClicked" and
  * "reviewsMarkerClicked" based on the marker that has been clicked
  * 
  * @param {event} event
  */
  handleMarkerClick = (event) => {
    let infoMarkerClicked = {};
    for (let restaurant of this.state.restaurantsList) {
      if (restaurant.location.lat === event.latLng.lat() && restaurant.location.lng === event.latLng.lng())
        infoMarkerClicked = restaurant;
    }
    let reviewsMarkerClicked = infoMarkerClicked.reviews.map(
      review =>
        <Review
          key={review.time}
          comment={review.text}
          rating={review.rating}
        />
    );
    this.setState({
      isMarkerClicked: true,
      infoMarkerClicked: infoMarkerClicked,
      reviewsMarkerClicked: reviewsMarkerClicked
    });
  }

  /**
  * Reset the state of "isMarkerClicked", "infoMarkerClicked" and
  * "reviewsMarkerClicked" when the info window is closed
  * 
  */
  handleInfoWindowCloseClick = () => {
    this.setState({
      isMarkerClicked: false,
      infoMarkerClicked: "",
      reviewsMarkerClicked: []
    });
  }

  /**
  * Create an array of objects based on:
  *   - apiData
  *   - filtered minRating
  *   - filtered maxRating
  *   - current bounds
  * 
  * The array includes the restaurants that should be displayed on the app.
  * A restaurant consists of an object including:
  *   - name: restaurant's name
  *   - address: restaurant's address
  *   - location: restaurant's latitude and longitude
  *   - reviews: arrays of restaurant's reviews
  *   - avgRatings: restaurant's average rating
  *   - img: restaurant's images' URL
  * 
  * @param {integer} minRating
  * @param {integer} maxRating
  * @param {bounds} bounds
  */
  getRestaurantsList = (minRating, maxRating, bounds) => {
    let restaurantsList = [];
    const checkDataset = (arrInput, arrOutput) => {
      for (let restaurant of arrInput) {
        let imgUrl = streetViewStaticApiEndpoint + "&location=" + restaurant.result.geometry.location.lat + "," + restaurant.result.geometry.location.lng;
        let imgMetadataUrl = streetViewStaticApiMetadataEndpoint + "&location=" + restaurant.result.geometry.location.lat + "," + restaurant.result.geometry.location.lng;
        let newRestaurant = {
          name: restaurant.result.name,
          address: restaurant.result.formatted_address,
          location: restaurant.result.geometry.location,
          reviews: restaurant.result.reviews,
          avgRatings: restaurant.result.rating,
          img: {
            url: imgUrl,
            metadataUrl: imgMetadataUrl
          }
        }
        // Add the restaurant object to the array if it's within the map and the filters' values
        bounds.contains(restaurant.result.geometry.location) && restaurant.result.rating >= minRating && restaurant.result.rating <= maxRating && arrOutput.push(newRestaurant);
      }
    }
    checkDataset(this.state.apiData, restaurantsList);
    this.state.addedRestaurantsByUser.length && checkDataset(this.state.addedRestaurantsByUser, restaurantsList);
    this.setState({ restaurantsList: restaurantsList })
  }

  render() {
    // Create a Marker component for each restaurants in the "restaurantsList" array
    const restaurantsMapMakers = this.state.restaurantsList.map(
      restaurant =>
        <Marker
          key={restaurant.address}
          position={{ lat: restaurant.location.lat, lng: restaurant.location.lng }}
          title={restaurant.name}
          onClick={this.handleMarkerClick}
        />
    )
    // Create a Restaurant component for each restaurants in the "restaurantsList" array
    const restaurants = this.state.restaurantsList.map(
      restaurant =>
        <Restaurant
          key={restaurant.address}
          restaurant={restaurant}
          minRating={this.state.minRating}
          maxRating={this.state.maxRating}
          infoMarkerClicked={this.state.infoMarkerClicked}
        />
    )
    return (
      <div id="app" >
        {/* Show the Form only if "showForm" is true i.e if the user clicked on the map */}
        {
          this.state.showForm &&
          <div className="popup">
            <Form
              onSubmit={this.handleFormSubmit}
              onClick={this.handleFormClick}
            />
          </div>
        }

        {/* div block that contains the map*/}
        <div id="map-container">
          <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
              mapContainerClassName="map"
              center={this.state.center}
              zoom={14}
              onLoad={this.handleMapLoad}
              onIdle={this.handleMapIdle}
              onClick={this.handleMapClick}
              onZoomChanged={this.handleMapZoom}
            >
              {/* Add a marker on the map at the user's position */}
              <Marker position={this.state.center} title="You're here" icon="https://maps.google.com/mapfiles/kml/paddle/grn-stars.png" />
              {/* Add markers on the map for each restaurants */}
              {restaurantsMapMakers}
              {this.state.isMarkerClicked &&
                <InfoWindow
                  position={this.state.infoMarkerClicked.location}
                  onCloseClick={this.handleInfoWindowCloseClick}
                >
                  <div className="info-window">
                    <h3>{this.state.infoMarkerClicked.name}</h3>
                    <p>&#9733; {this.state.infoMarkerClicked.avgRatings}</p>
                    <hr />
                    {this.state.reviewsMarkerClicked}
                    <p></p>
                  </div>
                </InfoWindow>
              }
            </GoogleMap>
          </LoadScript>
        </div>

        {/* div block that contains the filters and the restaurants' list*/}
        {this.state.isLoading ?
          <div className="popup">
            <div className="loading">
              <div className="spinner">
                <div>
                </div>
              </div>
            </div>
            <h1>Loading data...</h1>
          </div> :
          <div id="side-panel">
            <Filters
              onChange={this.handleFiltersChange}
              minRating={this.state.minRating}
              maxRating={this.state.maxRating}
            />
            <div id="restaurants-list">
              {restaurants}
            </div>
          </div>
        }
      </div>
    );
  }
}

export default App;