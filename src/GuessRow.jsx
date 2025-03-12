import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './GuessRow.module.css';

function GuessRow({ guess, feedback, onFeedbackChange, isCurrentGuess }) {
    const letters = guess.split('');
    const [localFeedback, setLocalFeedback] = useState(feedback || Array(5).fill(null));
    const squareRefs = useRef([]);

    useEffect(() => {
        squareRefs.current = squareRefs.current.slice(0, letters.length);
        letters.forEach((_, index) => {
            if (squareRefs.current[index]) {
                setTimeout(() => {
                    squareRefs.current[index].classList.add(styles.revealed);
                }, 10);
            }
        });
    }, [letters]);

    const handleSquareClick = (index) => {
        if (!isCurrentGuess) return;

        let nextFeedback;
        if (localFeedback[index] === null) {
            nextFeedback = 0;
        } else if (localFeedback[index] === 0) {
            nextFeedback = 2;
        } else if (localFeedback[index] === 2) {
            nextFeedback = 1;
        } else {
            nextFeedback = null;
        }

        const newFeedback = [...localFeedback];
        newFeedback[index] = nextFeedback;
        setLocalFeedback(newFeedback);
        onFeedbackChange(newFeedback);
    };

    return (
        <div className={styles.guessRow}>
            {letters.map((letter, index) => (
                <div
                    key={index}
                    ref={el => (squareRefs.current[index] = el)}
                    className={`${styles.guessSquare} ${
                        feedback && feedback[index] === 1 ? styles.correct : ''
                    } ${feedback && feedback[index] === 2 ? styles.present : ''} ${
                        feedback && feedback[index] === 0 ? styles.absent : ''
                    }`}
                    onClick={() => handleSquareClick(index)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    {letter}
                </div>
            ))}
        </div>
    );
}

GuessRow.propTypes = {
    guess: PropTypes.string.isRequired,
    feedback: PropTypes.arrayOf(PropTypes.number),
    onFeedbackChange: PropTypes.func.isRequired,
    isCurrentGuess: PropTypes.bool.isRequired,
};

export default GuessRow;