import React from 'react'
import '../style/Filters.css'

function Filters(props) {
    return (
        <div id="filters">
            <form>
                <div id="minimum-filter">
                    <label>Minimum</label>
                    {/* Calls the "handleFiltersChange" method of the App component when value is changed */}
                    <select name="minRating" value={props.minRating} onChange={props.onChange}>
                        {
                            props.maxRating >= 1 &&
                            <option value="1">&#9733;</option>
                        }
                        {
                            props.maxRating >= 2 &&
                            <option value="2">&#9733; &#9733;</option>
                        }
                        {
                            props.maxRating >= 3 &&
                            <option value="3">&#9733; &#9733; &#9733;</option>
                        }
                        {
                            props.maxRating >= 4 &&
                            <option value="4">&#9733; &#9733; &#9733; &#9733;</option>
                        }
                        {
                            props.maxRating >= 5 &&
                            <option value="5">&#9733; &#9733; &#9733; &#9733; &#9733;</option>
                        }
                    </select>
                </div>

                <div id="maximum-filter">
                    <label>Maximum</label>
                    {/* Calls the "handleFiltersChange" method of the App component when value is changed */}
                    <select name="maxRating" value={props.maxRating} onChange={props.onChange}>
                        {
                            props.minRating <= 1 &&
                            <option value="1">&#9733;</option>
                        }
                        {
                            props.minRating <= 2 &&
                            <option value="2">&#9733; &#9733;</option>
                        }
                        {
                            props.minRating <= 3 &&
                            <option value="3">&#9733; &#9733; &#9733;</option>
                        }
                        {
                            props.minRating <= 4 &&
                            <option value="4">&#9733; &#9733; &#9733; &#9733;</option>
                        }
                        {
                            props.minRating <= 5 &&
                            <option value="5">&#9733; &#9733; &#9733; &#9733; &#9733;</option>
                        }
                    </select>
                </div>

            </form>
        </div>
    )
}

export default Filters