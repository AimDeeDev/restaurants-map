import React, { Component } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import '../style/App.css';
import Restaurant from './Restaurant';
import Filters from './Filters'
import Form from './Form'
import Review from './Review'

// API key
const apiKey = "AIzaSyAxque6IU_OvMQ_IRfTkq3oscFYg5mxlu8";
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
      restaurantsData: [],
      minRating: "1",
      maxRating: "5",
      zoom: 14,
      radius: "2000",
      map: null,
      bounds: {},
      restaurantsList: [],
      showForm: false,
      clickedLocation: {
        lat: 0,
        lng: 0
      },
      infoMarkerClicked: "",
      isMarkerClicked: false,
      reviewsMarkerClicked: [],
      center: {
        lat: -3.745,
        lng: -38.523
      },
    };
    this.handleFiltersChange = this.handleFiltersChange.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
  }

  componentDidMount() {
    this.getRestaurantsData(this.state.center.lat, this.state.center.lng, this.state.radius);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.getPositionSuccess,
        this.getPositionError
      )
    } else {
      console.log("Geolocation not supported by the browser");
    }
  }

  getRestaurantsData = (lat, lng, radius) => {
    this.setState({ isLoading: true });
    let apiPlaceSearchUrl = placesSearchApiEndpoint + "&location=" + lat + "," + lng + "&radius=" + radius;
    let apiPlacesData = [];
    fetch(apiPlaceSearchUrl)
      .then(response => response.ok ? response.json() : console.log("Fetch Place Search API data failed"))
      .then(data => {
        for (let result of data.results) {
          let apiPlaceDetailsUrl = placesDetailsApiEndpoint + result.place_id;
          fetch(apiPlaceDetailsUrl)
            .then(response => response.ok ? response.json() : console.log("Fetch Place Details API data failed"))
            .then(data => {
              apiPlacesData.push(data);
              this.getRestaurantsList(this.state.minRating, this.state.maxRating, this.state.bounds);
            })
            .catch(err => console.log("Error when fetching Place Details API", err))
        }
      })
      .then(() => {
        if (apiPlacesData != null) {
          this.setState({
            restaurantsData: apiPlacesData,
            isLoading: false
          });
        }
      })
      .catch(err => console.log("Error when fetching Place Search API", err));
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
  * Set the state of "map" and "bounds" when the map loads for the first time
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
    // const center = this.state.map.getCenter();
    this.setState({ bounds: bounds });
    // this.getRestaurantsData(center.lat(), center.lng())
    this.getRestaurantsList(this.state.minRating, this.state.maxRating, bounds);
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
        infoMarkerClicked: !prevState.infoMarkerClicked,
        clickedLocation: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
      }
    })
  }

  handleMapZoom = () => {
    if (this.state.map != null) {
      let currentZoom = this.state.map.getZoom();
      switch (currentZoom) {
        case 22:
        case 21:
        case 19:
        case 18:
        case 17:
        case 16:
        case 15:
        case 14:
        case 13:
        case 12:
        case 11:
        case 10:
          this.setState({ radius: "2000" });
          this.getRestaurantsData(this.state.center.lat, this.state.center.lng, this.state.radius);
          break;
        case 9:
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
          this.getRestaurantsData(this.state.center.lat, this.state.center.lng, this.state.radius);
          break;
      }
      console.log("Radius", this.state.radius);
    }
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
    let updatedRestaurantsData = this.state.restaurantsData;
    updatedRestaurantsData.push(newRestaurant);
    this.setState(prevState => {
      return {
        restaurantsData: updatedRestaurantsData,
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
  * Set the state of "isMarkerClicked" and "infoMarkerClicked" based
  * on the marker that has been clicked
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
    // this.getRestaurantsList(this.state.minRating, this.state.maxRating, this.state.bounds)
  }

  handleInfoWindowCloseClick = () => {
    this.setState({
      isMarkerClicked: false
    });
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
  * 
  * @param {integer} minRating
  * @param {integer} maxRating
  * @param {bounds} bounds
  */
  getRestaurantsList = (minRating, maxRating, bounds) => {
    let restaurantsList = [];
    for (let restaurant of this.state.restaurantsData) {
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
        },
      }
      bounds.contains(restaurant.result.geometry.location) && restaurant.result.rating >= minRating && restaurant.result.rating <= maxRating && restaurantsList.push(newRestaurant);
    }
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
    // const reviewsMarkerClicked = [];
    // if(this.state.isMarkerClicked){
    //   reviewsMarkerClicked = this.state.infoMarkerClicked.reviews.map(
    //     review =>
    //       <Review
    //         key={review.time}
    //         comment={review.text}
    //         rating={review.rating}
    //       />
    //   );
    // }
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