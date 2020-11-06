import React, { Component } from 'react';
import '../style/Form.css';

class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            address: "",
            comment: "",
            stars: ""
        }
        this.handleChange = this.handleChange.bind(this);
    }

    /**
    * Set the state of name, address, comment and stars
    * based on the input value by the user
    * 
    * @param {event} event
    */
    handleChange = (event) => {
        const { name, value } = event.target
        this.setState({
            [name]: value
        })
    }

    render() {
        return (
            <div id="form">
                {/* Calls the "handleFormSubmit" method of the App component when the form is submitted */}
                <form onSubmit={this.props.onSubmit}>
                    <button onClick={this.props.onClick} id="close-form">&#10006;</button>
                    <label for="name">Restaurant's name</label>
                    <input
                        name="name"
                        id="name"
                        value={this.state.name}
                        onChange={this.handleChange}
                        placeholder="Name"
                    />
                    <label for="address">Restaurant's address</label>
                    <input
                        name="address"
                        id="address"
                        value={this.state.address}
                        onChange={this.handleChange}
                        placeholder="Address"
                    />
                    <label for="comment">Your comment:</label>
                    <textarea name="comment" id="comment" rows="5" value={this.state.comment} onChange={this.handleChange}></textarea>
                    <label for="stars">Your rating</label>
                        <select name="stars" id="stars" value={this.state.stars} onChange={this.handleChange}>
                            <option value="1">&#9733;</option>
                            <option value="2">&#9733; &#9733;</option>
                            <option value="3">&#9733; &#9733; &#9733;</option>
                            <option value="4">&#9733; &#9733; &#9733; &#9733;</option>
                            <option value="5">&#9733; &#9733; &#9733; &#9733; &#9733;</option>
                        </select>
                    <button type="submit">Submit</button>
                    <button onClick={this.props.onClick}>Cancel</button>
                </form>
            </div>
        )
    }
}

export default Form