// import React, { Component } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import MapMarker from './MapMarker';
// import '../style/Map.css';

// class Map extends Component {
//   constructor() {
//     super();
//     this.state = {
//       theMap: null,
//       center: {
//         lat: -3.745,
//         lng: -38.523
//       }
//     }
//   }

//   getPositionSuccess = (position) => {
//     this.setState({ center: { lat: position.coords.latitude, lng: position.coords.longitude } })
//   }

//   getPositionError = (error) => {
//     console.error("Error Code = " + error.code + " - " + error.message);
//   }

//   componentDidMount() {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         this.getPositionSuccess,
//         this.getPositionError
//       )
//     } else {
//       console.log("Geolocation not supported by the browser");
//     }
//   }

//   onLoad = (map) => {
//     this.setState({ theMap: map })
//   }

//   onIdle = () => {
//     console.log("OnIdle called");
//     const bounds = this.state.theMap.getBounds();
//     const filteredRestaurants = this.getRestaurantsToList(this.props.restaurants, bounds)
//     // const coordinates = {
//     //   lat: 52.551993,
//     //   lng: 13.419314
//     // }
//     // console.log(bounds);
//     // if (bounds.contains(coordinates)) {
//     //   console.log("It's in")
//     // } else {
//     //   console.log("It's out")
//     // }
//     console.log(filteredRestaurants);
//   }

//   getRestaurantsToList = (restaurants, bounds) => {
//     let filteredRestaurants = [];
//     for (let restaurant of restaurants) {
//       let retaurantLatLng = {
//         lat: restaurant.lat,
//         lng: restaurant.long
//       }
//       bounds.contains(retaurantLatLng) && filteredRestaurants.push(restaurant);
//     }
//     return filteredRestaurants
//   }

//   render() {
//     const restaurantsMapMakers = this.props.restaurants.map(
//       restaurant =>
//         <Marker
//           position={{ lat: restaurant.lat, lng: restaurant.long }}
//           label={restaurant.restaurantName}
//         />
//     )

//     return (
//       <div id="map-container">
//         <LoadScript
//           googleMapsApiKey="AIzaSyDkMT-2Qh4BO8Jj2eG_gyYFR6UgtSeKhM4"
//         >
//           <GoogleMap
//             mapContainerClassName="map"
//             center={this.state.center}
//             zoom={11}
//             onLoad={this.onLoad}
//             // onIdle={this.state.theMap ? this.props.onIdle(this.state.theMap.getBounds()) : console.log("Marche pas")}
//             onIdle={this.onIdle}
//           >
//             <Marker position={this.state.center} cursor="Test test" label="The label" title="The title" />
//             {restaurantsMapMakers}
//           </GoogleMap>
//         </LoadScript>
//         <p>{this.state.map}</p>
//       </div>
//     );
//   }
// }

// export default Map;