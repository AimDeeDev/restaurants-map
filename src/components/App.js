import React, { Component } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import '../style/App.css';
import Restaurant from './Restaurant';
import Filters from './Filters'
import Form from './Form'
import restaurantsData from '../restaurants';

// API key
const apiKey = "AIzaSyDkMT-2Qh4BO8Jj2eG_gyYFR6UgtSeKhM4";
// Endpoint of the Place Search API
const placesSearchApiEndpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=1000&type=restaurant&keyword=restaurant&key=" + apiKey;
// const placesSearchApiEndpoint= "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&radius=10000&key=" + apiKey;
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
      restaurantsData: [],
      minRating: "1",
      maxRating: "5",
      zomm: 14,
      map: null,
      bounds: {},
      restaurantsList: [],
      showForm: false,
      clickedLocation: {
        lat: 0,
        lng: 0
      },
      center: {
        lat: -3.745,
        lng: -38.523
      },
      test: []
    }
    this.handleFiltersChange = this.handleFiltersChange.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
  }

  componentDidMount() {
    console.log("ComponentDidMount");
    this.getRestaurantsData(this.state.center.lat, this.state.center.lng)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.getPositionSuccess,
        this.getPositionError
      )
    } else {
      console.log("Geolocation not supported by the browser");
    }
  }

  getRestaurantsData = (lat, lng, zoom) => {
    // let radius = 0;
    // switch (zoom) {
    //   case 14, 13:
    //     radius = "1000";
    //     break;
    //   case 12, 11:
    //     radius = "10000";
    //     break;
    //   case 10, 9:
    //     radius = "20000";
    //     break;
    //   case 8, 7:
    //     radius = "20000";
    //     break;
    //   case 6, 5:
    //     radius = "30000";
    //     break;
    //   case 4, 3:
    //     radius = "40000";
    //     break;
    //   case 2, 1:
    //     radius = "50000";
    //     break;
    // }
    this.setState({ isLoading: true });
    let apiPlaceSearchUrl = placesSearchApiEndpoint + "&location=" + lat + "," + lng;
    let apiPlacesData = [];
    fetch(apiPlaceSearchUrl)
      .then(response => response.json())
      .then(data => {
        // Get all the place_id and store them in the placeIds array
        for (let result of data.results) {
          let apiPlaceDetailsUrl = placesDetailsApiEndpoint + result.place_id;
          fetch(apiPlaceDetailsUrl)
            .then(response => response.json())
            .then(data => {
              apiPlacesData.push(data);
              this.getRestaurantsList(this.state.minRating, this.state.maxRating, this.state.bounds, {});
            })
        }
      })
      .then(() => {
        if (apiPlacesData != null) {
          console.log("apiPlacesData", apiPlacesData);
          this.setState({
            restaurantsData: apiPlacesData,
            isLoading: false
          });
          // this.getRestaurantsList(this.state.minRating, this.state.maxRating, this.state.bounds, {});
        }
      });
  }

  getPositionSuccess = (position) => {
    this.getRestaurantsData(position.coords.latitude, position.coords.longitude)
    this.setState({ center: { lat: position.coords.latitude, lng: position.coords.longitude } })
  }

  getPositionError = (error) => {
    console.log("Error");
    console.error("Error Code = " + error.code + " - " + error.message);
  }

  /**
  * Set the state of "map" and "bounds" when the map load for the first time
  * 
  * @param {map} map
  */
  handleMapLoad = (map) => {
    let bounds = map.getBounds();
    this.setState({ map: map, bounds: bounds })
  }

  /**
  * Set the state of "bounds" and update the list of restaurants when the map gets 
  * in the idle state (after zoom or drag-n-drop)
  * 
  */
  handleMapIdle = () => {
    const bounds = this.state.map.getBounds();
    const center = this.state.map.getCenter();
    console.log("center", center);
    this.setState({ bounds: bounds });
    this.getRestaurantsData(center.lat(), center.lng())
    this.getRestaurantsList(this.state.minRating, this.state.maxRating, bounds, {});
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
  * Create a new restaurant object based on the data returned by the form,
  * set the state of "restaurantsData" and "showForm" and update the list 
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
        rating: parseInt(stars.value),
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
    console.log("newRestaurant", newRestaurant);
    let updatedRestaurantsData = this.state.restaurantsData;
    updatedRestaurantsData.push(newRestaurant);
    this.setState(prevState => {
      return {
        restaurantsData: updatedRestaurantsData,
        showForm: !prevState.showForm
      }
    });
    console.log("updatedRestaurantsData", updatedRestaurantsData);
    this.getRestaurantsList(this.state.minRating, this.state.maxRating, this.state.bounds, {});
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
    // const bounds = this.state.bounds;
    if (name === "minRating") {
      this.getRestaurantsList(value, this.state.maxRating, this.state.bounds, {});
    } else {
      this.getRestaurantsList(this.state.minRating, value, this.state.bounds, {});
    }
  }

  /**
  * Update the object of the restaurant of the marker that has been clicked on
  * 
  * @param {event} event
  */
  handleMarkerClick = (event) => {
    let location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }
    this.getRestaurantsList(this.state.minRating, this.state.maxRating, this.state.bounds, location)
  }

  /**
  * Create an array of objects based on:
  *   - restaurantsData
  *   - filtered minRating
  *   - filtered maxRating
  *   - current bounds
  *   - location of the clicked marker (if any)
  * 
  * The array includes the restaurants that should be displayed on the app.
  * A restaurant consists of an object including:
  *   - name: restaurant's name
  *   - address: restaurant's address
  *   - location: restaurant's latitude and longitude
  *   - reviews: arrays of restaurant's reviews
  *   - avgRatings: restaurant's average rating
  *   - img: restaurant's image's URL
  *   - isClicked: whether the marker of the restaurant is clicked or not
  * 
  * @param {integer} minRating
  * @param {integer} maxRating
  * @param {bounds} bounds
  * @param {object} clickedMarkerLocation
  */
  getRestaurantsList = (minRating, maxRating, bounds, clickedMarkerLocation) => {
    console.log("getRestaurantsList called");
    console.log("restaurantsData", this.state.restaurantsData);
    if (Array.isArray(this.state.restaurantsData) && this.state.restaurantsData.length === 0) {
      console.log("restaurantsData is an array and is empty");
    }
    let restaurantsList = [];
    for (let restaurant of this.state.restaurantsData) {
      let imgUrl = streetViewStaticApiEndpoint + "&location=" + restaurant.result.geometry.location.lat + "," + restaurant.result.geometry.location.lng;
      let imgMetadataUrl = streetViewStaticApiMetadataEndpoint + "&location=" + restaurant.result.geometry.location.lat + "," + restaurant.result.geometry.location.lng;
      let isClicked = false;
      if (clickedMarkerLocation.lat === restaurant.result.geometry.location.lat && clickedMarkerLocation.lng === restaurant.result.geometry.location.lng) {
        isClicked = true;
      }
      let newRestaurant = {
        name: restaurant.result.name,
        address: restaurant.result.formatted_address,
        location: restaurant.result.geometry.location,
        reviews: restaurant.result.reviews,
        avgRatings: restaurant.result.rating,
        img: {
          url: imgUrl,
          metadataUrl: imgMetadataUrl
        },
        isClicked: isClicked
      }
      bounds.contains(restaurant.result.geometry.location) && restaurant.result.rating >= minRating && restaurant.result.rating <= maxRating && restaurantsList.push(newRestaurant);
    }
    console.log("restaurantsList", restaurantsList);
    this.setState({ restaurantsList: restaurantsList })
  }

  render() {
    // Create a Marker component for each restaurants in the "restaurantsList" array
    const restaurantsMapMakers = this.state.restaurantsList.map(
      restaurant =>
        <Marker
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
        />
    )
    return (
      <div id="app" >

        {/* Show the Form only if "showForm" is true i.e if the user clicked on the map */}
        {
          this.state.showForm &&
          <div id="popup">
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
            >
              {/* Add a marker on the map at the user's position */}
              <Marker position={this.state.center} title="You're here" icon="https://maps.google.com/mapfiles/kml/paddle/grn-stars.png" />
              {/* Add markers on the map for each restaurants */}
              {restaurantsMapMakers}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* div block that contains the filters and the restaurants' list*/}
        {this.state.isLoading ?
          <div id="side-panel">
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