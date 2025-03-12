import { useState, useEffect } from 'react';
import GuessRow from './GuessRow';
import styles from './Game.module.css';

function Game() {
    const [secretWord, setSecretWord] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [inputWord, setInputWord] = useState('');
    const [initialWordList, setWordList] = useState([]);
    const [availableWords, setAvailableWords] = useState(initialWordList);
    const [presentLetters, setPresentLetters] = useState(new Set());
    const [absentLetters, setAbsentLetters] = useState(new Set());
    const [correctLetters, setCorrectLetters] = useState(Array(5).fill(null));
    const [guessCount, setGuessCount] = useState(0);
    const [victory, setVictory] = useState(false);
    const [lost, setLost] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [guessedWords, setGuessedWords] = useState(new Set());
    const MAX_GUESSES = 10;
    const [showStats, setShowStats] = useState(false);
    const [gameHistory, setGameHistory] = useState([]);

    useEffect(() => {
        async function loadWords() {
            try {
                const response = await fetch('/wordlist.txt');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                const words = text.split('\n').map(word => word.trim().toUpperCase()).filter(word => word.length > 0);
                setWordList(words);
            } catch (error) {
                console.error('Error loading word list:', error);
            }
        }

        loadWords();
    }, []);

        useEffect(() => {
            if (initialWordList.length > 0 && secretWord === '') {
                setSecretWord(initialWordList[Math.floor(Math.random() * initialWordList.length)]);
            }
        }, [initialWordList, secretWord]);

    const handleGuess = () => {
        const nextGuess = generateSmartGuess();
        if (!nextGuess) return; // Prevent setting null guess.
        setCurrentGuess(nextGuess);
        setGuesses([...guesses, nextGuess]);
        setGuessedWords(prev => new Set(prev).add(nextGuess));
        setGuessCount(guessCount + 1);
    };

    const handleFeedbackChange = (newFeedback) => {
        setFeedback(prevFeedback => {
            const updatedFeedback = [...prevFeedback];
            updatedFeedback[guesses.length - 1] = newFeedback;
            return updatedFeedback;
        });
    };

    const handleFeedbackSubmit = () => {
        const currentFeedback = feedback[guesses.length - 1];
        if (!currentFeedback) return;
        updateAvailableWords(currentGuess, currentFeedback);
        checkVictory(currentFeedback);
        if (!victory && guessCount >= MAX_GUESSES) {
            setLost(true);
            setGameOver(true);
            recordGameStats(false); // Record loss here
        }
    };

    const checkVictory = (feedbackArray) => {
        if (feedbackArray.every((f) => f === 1)) {
            setVictory(true);
            setGameOver(true);
            recordGameStats(true); // Record victory here
        }
    };

    const recordGameStats = (isVictory) => {
        setGameHistory(prev => [...prev, {
            guesses: guesses.length,
            victory: isVictory,
            secretWord: secretWord,
        }]);
    };

    const updateAvailableWords = (currentGuess, feedbackArray) => {
        const newPresentLetters = new Set(presentLetters);
        const newAbsentLetters = new Set(absentLetters);
        const newCorrectLetters = [...correctLetters];

        feedbackArray.forEach((f, i) => {
            const letter = currentGuess[i];
            if (f === 1) {
                newCorrectLetters[i] = letter;
            } else if (f === 2) {
                newPresentLetters.add(letter);
            } else if (f === 0) {
                if (!newCorrectLetters.includes(letter)) {
                    newAbsentLetters.add(letter);
                }
            }
        });

        setPresentLetters(newPresentLetters);
        setAbsentLetters(newAbsentLetters);
        setCorrectLetters(newCorrectLetters);

        const filteredWords = availableWords.filter((word) => {
            for (let i = 0; i < word.length; i++) {
                if (newCorrectLetters[i] && word[i] !== newCorrectLetters[i]) {
                    return false;
                }
                if (newAbsentLetters.has(word[i]) && !newPresentLetters.has(word[i]) && !newCorrectLetters.includes(word[i])) {
                    return false;
                }
            }
            for (const letter of newPresentLetters) {
                if (!word.includes(letter)) {
                    return false;
                }
            }
            for (let i = 0; i < currentGuess.length; i++) {
                if (feedbackArray[i] === 2 && currentGuess[i] === word[i]) {
                    return false;
                }
            }
            return true;
        });

        setAvailableWords(filteredWords);
        checkVictory(feedbackArray);

        if (!victory && !lost) {
            handleGuess();
        }
    };

    const generateSmartGuess = () => {
        if (availableWords.length > 0 && !gameOver) {
            const validGuesses = availableWords.filter(word => !guessedWords.has(word));
            if (validGuesses.length > 0) {
                return validGuesses[Math.floor(Math.random() * validGuesses.length)];
            } else {
                return '';
            }
        }
        return '';
    };

    const handleSetSecret = () => {
        setSecretWord(inputWord.toUpperCase());
        setAvailableWords(initialWordList);
        setPresentLetters(new Set());
        setAbsentLetters(new Set());
        setCorrectLetters(Array(5).fill(null));
        setGuessCount(0);
        setVictory(false);
        setLost(false);
        setGameOver(false);
        setGuesses([]);
        setFeedback([]);
        setGuessedWords(new Set());
        setShowStats(false);
    };

    const handlePlayAgain = () => {
        handleSetSecret();
        setSecretWord(initialWordList[Math.floor(Math.random() * initialWordList.length)]);
    }

    const handleShowStats = () => {
        setShowStats(true);
    };

    const handleCloseStats = () => {
        setShowStats(false);
    }

    return (
        <div className={styles.container}>
            <div className={styles.inputContainer}>
                <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                placeholder="Enter Secret Word"
                className={styles.input}
                />
                <button onClick={handleSetSecret} className={styles.button}>Set Secret Word</button>
            </div>
            <div>
                {guesses.map((guess, index) => (
                    <GuessRow
                        key={index}
                        guess={guess}
                        feedback={feedback[index]}
                        onFeedbackChange={handleFeedbackChange}
                        isCurrentGuess={index === guesses.length - 1}
                    />
                ))}
            </div>
            {guesses.length > 0 && !victory && !lost && (
                <button onClick={handleFeedbackSubmit} className={styles.button}>Submit Feedback</button>
            )}
            {gameOver && (
                <div className={styles.overlay}>
                    <div className={styles.gameOverScreen}>
                        {victory ? (
                            <>
                                <h2>Victory!</h2>
                                <p>The AI guessed the word in {guessCount - 1} guesses.</p>
                            </>
                        ) : (
                            <>
                                <h2>You win!</h2>
                                <p>The AI failed to guess the word in {MAX_GUESSES} guesses.</p>
                            </>
                        )}
                        <button onClick={handlePlayAgain} className={styles.button}>Play Again</button>
                        <button onClick={handleShowStats} className={styles.button}>View Stats</button>
                    </div>
                </div>
            )}
            {showStats && (
                <div className={styles.overlayStats}>
                    <div className={styles.statsScreen}>
                        <h2>Game Stats</h2>
                        <ul>
                            {gameHistory.map((game, index) => (
                                <li key={index}>
                                    {game.victory ? "Victory!" : "Loss"} - Guesses: {game.guesses}, Word: {game.secretWord}
                                </li>
                            ))}
                        </ul>
                        <button onClick={handleCloseStats} className={styles.button}>Close Stats</button>
                    </div>
                </div>
            )}
            {guesses.length === 0 && secretWord.length > 0 && !victory && !lost && (
                <button onClick={handleGuess} className={styles.button}>Start Game</button>
            )}
        </div>
    );
}

export default Game;