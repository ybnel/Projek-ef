import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X } from 'lucide-react';
import { SPELLING_GAME_DATA } from '../../data/dummyData';

// Utility to shuffle
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

// Helper to generate grid letters
const generateGrid = (word, gridSize = 9) => {
    const wordLetters = word.toUpperCase().split('').map((char, index) => ({
        char,
        id: `target-${index}`, // Unique ID for target letters
        isTarget: true,
        targetIndex: index
    }));

    // Filter alphabet to exclude letters ALREADY in the word
    // This solves the issue of duplicates (e.g. checking 'U' when another 'U' is the target)
    const existingChars = new Set(word.toUpperCase().split(''));
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const availableFillers = alphabet.split('').filter(c => !existingChars.has(c));

    const fillCount = Math.max(0, gridSize - wordLetters.length);
    const fillers = [];

    for (let i = 0; i < fillCount; i++) {
        fillers.push({
            char: availableFillers[Math.floor(Math.random() * availableFillers.length)],
            id: `filler-${i}`,
            isTarget: false
        });
    }

    // Combine and shuffle
    return shuffle([...wordLetters, ...fillers]);
};

export default function SpellingGame({ level = 'small_stars', stageConfig, onComplete, onBack }) {
    const [rounds, setRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [gridItems, setGridItems] = useState([]);
    const [foundIndices, setFoundIndices] = useState([]); // Array of correct targetIndex found so far [0, 1, 2...]

    // Game State
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time || 60);
    const [gameOver, setGameOver] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Initialize Game
    useEffect(() => {
        const pool = SPELLING_GAME_DATA[level] || SPELLING_GAME_DATA['small_stars'];
        if (!pool) return;

        // Pick random words for the number of rounds requested
        const count = stageConfig.count || 2;
        const selectedRounds = shuffle(pool).slice(0, count);
        setRounds(selectedRounds);
        setCurrentRoundIndex(0);
        setScore(0);
        setTimeLeft(stageConfig.time || 60);
    }, [level]);

    // Setup Current Round
    useEffect(() => {
        if (rounds.length > 0 && currentRoundIndex < rounds.length) {
            const currentWord = rounds[currentRoundIndex].word;
            setGridItems(generateGrid(currentWord));
            setFoundIndices([]);
        }
    }, [rounds, currentRoundIndex]);

    // Timer
    useEffect(() => {
        if (gameOver || showSuccessModal) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameOver, showSuccessModal]);

    const handleLetterClick = (item) => {
        if (gameOver || showSuccessModal) return;

        const currentWord = rounds[currentRoundIndex].word.toUpperCase();
        const nextExpectedIndex = foundIndices.length;

        // Check if item is the correct next letter
        if (item.isTarget && item.targetIndex === nextExpectedIndex) {
            // Correct!
            const newFound = [...foundIndices, item.targetIndex];
            setFoundIndices(newFound);

            // Check Round Completion
            if (newFound.length === currentWord.length) {
                handleRoundComplete();
            }
        } else {
            // Wrong! (Clicked distractor OR clicked target letter out of order)
            // Visual feedback handled by state? or simple shake?
            // For now, let's just penalty
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            if (newMistakes > 5) {
                // Cap score deduction? 
                // setScore(prev => Math.max(0, prev - 2)); 
            }

            // Optional: Shake logic could go here via a ref or temp state
        }
    };

    const handleRoundComplete = () => {
        // Calculate score for this round
        // Base score per round = (Total Stage Score / Rounds)
        // Adjust for remaining time? 
        // For simplicity: accumulative score

        const roundBaseScore = 15; // Arbitrary
        setScore(prev => prev + roundBaseScore);

        if (currentRoundIndex < rounds.length - 1) {
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                setCurrentRoundIndex(prev => prev + 1);
            }, 1500);
        } else {
            // All Rounds Done
            onComplete(score + roundBaseScore + timeLeft); // Bonus for time
        }
    };

    // Current Target Word Display
    const currentRound = rounds[currentRoundIndex];
    if (!currentRound) return <div>Loading...</div>;

    const wordLetters = currentRound.word.toUpperCase().split('');

    if (gameOver) {
        return (
            <div className="w-full max-w-4xl backdrop-blur-sm bg-white/90 shadow-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-fade-in-up">
                <h2 className="text-3xl font-display font-bold text-red-500 mb-4">Time's Up!</h2>
                <button onClick={() => onComplete(score)} className="btn-primary">Finish</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl backdrop-blur-sm bg-white/90 shadow-xl rounded-3xl p-4 md:p-8 animate-fade-in-up flex flex-col items-center min-h-[600px]">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-primary-600"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Spell the Word!</h2>
                        <p className="text-slate-500">Find the letters in order: <span className="font-bold text-primary-600">{currentRoundIndex + 1} / {rounds.length}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                    <span>⏱️</span>
                    <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                </div>
            </div>

            {/* Target Display and Image */}
            <div className="flex flex-col items-center gap-6 mb-8 w-full max-w-md">
                <div className="w-48 h-48 bg-slate-100 rounded-2xl p-4 flex items-center justify-center shadow-inner border-4 border-white">
                    <img src={currentRound.image} alt={currentRound.word} className="w-full h-full object-contain" />
                </div>

                {/* Word Placeholder Slots */}
                <div className="flex gap-2">
                    {wordLetters.map((char, index) => {
                        const isFound = foundIndices.includes(index);
                        return (
                            <div key={index} className={`w-12 h-16 md:w-16 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-4xl font-bold border-b-4 transition-all duration-300
                                ${isFound
                                    ? 'bg-green-100 border-green-500 text-green-600 scale-110 shadow-lg'
                                    : 'bg-slate-100 border-slate-300 text-slate-400'
                                }`}>
                                {isFound ? char : '_'}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Letter Grid */}
            <div className={`grid grid-cols-3 gap-3 md:gap-4 p-4 bg-slate-50/50 rounded-3xl border border-slate-100`}>
                <AnimatePresence mode="popLayout">
                    {gridItems.map((item) => {
                        // Check if this specific item ID has been successfully clicked (isTarget AND targetIndex is in foundIndices)
                        // A bit tricky: generateGrid gave unique IDs. But foundIndices tracks targetIndices (0,1,2).
                        // We need to know if *this specific tile* represents a found letter.
                        const isFound = item.isTarget && foundIndices.includes(item.targetIndex);
                        const isDisabled = isFound; // Disable checks for already found letters? Or keep them visible?
                        // Image shows "Checkmark" replacing the letter or over it.

                        return (
                            <motion.button
                                layout
                                key={item.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                onClick={() => handleLetterClick(item)}
                                disabled={isDisabled}
                                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-bold shadow-sm transition-all relative
                                    ${isFound
                                        ? 'bg-green-500 text-white shadow-green-200'
                                        : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-slate-200'
                                    }`}
                            >
                                {isFound ? <Check className="w-10 h-10 md:w-12 md:h-12" /> : item.char}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Celebration Overlay for Round */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col items-center"
                        >
                            <div className="text-6xl mb-4">🌟</div>
                            <h2 className="text-3xl font-bold text-primary-600">Great Job!</h2>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
