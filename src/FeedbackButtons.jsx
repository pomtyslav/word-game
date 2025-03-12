import PropTypes from 'prop-types'; // Import PropTypes
import styles from './FeedbackButtons.module.css'; // Import CSS module

function FeedbackButtons({ onFeedback, secretWord, currentGuess }) {
    const giveFeedback = (currentGuess, secretWord) => {
        let feedbackArray = [];
        for(let i = 0; i < secretWord.length; i++){
            if(currentGuess[i] === secretWord[i]){
                feedbackArray.push("correct");
            } else if (secretWord.includes(currentGuess[i])){
                feedbackArray.push("present");
            } else {
                feedbackArray.push("absent");
            }
        }
        onFeedback(feedbackArray);
    }
    return(
        <button className={styles.button} onClick={() => giveFeedback(currentGuess, secretWord)}>Submit Feedback</button>
    )
}

// Prop validation
FeedbackButtons.propTypes = {
  onFeedback: PropTypes.func.isRequired,
  secretWord: PropTypes.string.isRequired,
  currentGuess: PropTypes.string.isRequired,
};

export default FeedbackButtons;