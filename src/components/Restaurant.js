import React, { Component } from 'react';
import Review from './Review'
import '../style/Restaurant.css'

class Restaurant extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showReviews: false,
            addReview: false,
            imgUrl: "",
            addedReview: "",
            addedRating: "1",
            reviews: props.restaurant.reviews,
            avgRatings: props.restaurant.avgRatings,
        }
        this.handleMoreInfoClick = this.handleMoreInfoClick.bind(this);
        this.handleAddReviewClick = this.handleAddReviewClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
    * Check the status returned by the image's metadata URL and
    * set the state "imgUrl" to this URL when the component has
    * just mounted 
    * 
    */
    componentDidMount() {
        fetch(this.props.restaurant.img.metadataUrl)
            .then(response => response.json())
            .then(data => {
                data.status === "OK" && this.setState({ imgUrl: this.props.restaurant.img.url })
            });
    }

    /**
    * Set the state of "showReviews" to its opposite previous
    * state when the "More info" button is clicked
    * 
    */
    handleMoreInfoClick = () => {
        this.setState(prevState => {
            return {
                showReviews: !prevState.showReviews,
                addReview: false
            }
        })
    }

    /**
    * Set the state of "addReview" to its opposite previous
    * state when the "Add review" button is clicked
    * 
    */
    handleAddReviewClick = () => {
        this.setState(prevState => {
            return {
                addReview: !prevState.addReview
            }
        })
    }

    /**
    * Set the state of "addedReview" or "addedRating" when the
    * values are changed by the input of the user
    * 
    * @param {event} event
    */
    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    /**
    * Create an object with the new review (comment and rating) 
    * of the user and set the state of "reviews", "avgRatings" 
    * and "addReview" accordingly
    * 
    * @param {event} event
    */
    handleSubmit = (event) => {
        event.preventDefault();
        let newReview = {
            rating: parseInt(this.state.addedRating),
            text: this.state.addedReview
        };
        let updatedReviews = this.state.reviews;
        updatedReviews.push(newReview);
        this.setState(prevState => {
            return {
                reviews: updatedReviews,
                addReview: !prevState
            }
        });
    }

    render() {
        // Create a Review component for each review in the "reviews" array
        const reviews = this.state.reviews.map(
            review =>
                <Review
                    key={review.time}
                    comment={review.text}
                    rating={review.rating}
                />
        );
        return (
            <div className="restaurant">
                <div className="restaurant-display">
                    <div className="restaurant-img">
                        <img src={this.state.imgUrl} alt="Restaurant's street view" />
                    </div>
                    <div className="restaurant-info">
                        <div>
                            <h3>{this.props.restaurant.name}</h3>
                            <p>&#9733; {this.state.avgRatings}</p>
                        </div>
                        <button onClick={this.handleMoreInfoClick}>More info</button>
                    </div>
                </div>

                {
                    // Show the reviews only if "showReviews" is true i.e if the user clicked on the "More info" button
                    this.state.showReviews &&
                    <div className="restaurant-reviews">
                        <h4>Address:</h4>
                        <p>{this.props.restaurant.address}</p>
                        <h4>Reviews:</h4>
                        {reviews}
                        <button onClick={this.handleAddReviewClick}>Add review</button>
                        {/* Show the form to add a review only if "addReview" is true i.e if the user clicked on the "Add review" button */}
                        {this.state.addReview &&
                            <form onSubmit={this.handleSubmit}>
                                <label for="addedReview">Your review:</label>
                                <textarea name="addedReview" cols="50" rows="5" value={this.state.addedReview} onChange={this.handleChange}></textarea>
                                <label for="addedRating">Your rating:</label>
                                <select name="addedRating" value={this.state.addedRating} onChange={this.handleChange}>
                                    <option value="1">&#9733;</option>
                                    <option value="2">&#9733; &#9733;</option>
                                    <option value="3">&#9733; &#9733; &#9733;</option>
                                    <option value="4">&#9733; &#9733; &#9733; &#9733;</option>
                                    <option value="5">&#9733; &#9733; &#9733; &#9733; &#9733;</option>
                                </select>
                                <button type="submit">Submit</button>
                            </form>
                        }
                    </div>
                }
            </div>
        )
    }

}

export default Restaurant;