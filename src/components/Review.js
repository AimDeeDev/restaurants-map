import React from 'react';
import '../style/Review.css';

function Review(props) {
    let nbStars = "";
    for(let i = 1; i <= props.rating; i++){
        nbStars = nbStars + '\u2605 '
    }

    return (
        <div className="review">
            <p>{nbStars}</p>
            <p>{props.comment}</p>
            <hr />
        </div>
    )
}

export default Review