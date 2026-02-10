import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Play, HelpCircle } from 'lucide-react';
import { SPELLING_GAME_DATA, COLOR_SPELLING_DATA } from '../../data/dummyData';
import { shuffle } from '../../utils/gameUtils';



// Helper to generate grid letters
const generateGrid = (word, gridSize = 9) => {
    const wordLetters = word.toUpperCase().split('').map((char, index) => ({
        char,
        id: `target-${index}`, // Unique ID for target letters
        isTarget: true,
        targetIndex: index
    }));

    // Filter alphabet to exclude letters ALREADY in the word
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
    const [foundIndices, setFoundIndices] = useState([]); // Array of correct word indices found so far [0, 1, 2...]
    const [usedGridItemIds, setUsedGridItemIds] = useState([]); // Track specifically which grid buttons are used

    // Game State
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time || 60);
    const [gameOver, setGameOver] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Initialize Game
    useEffect(() => {
        let pool;
        if (stageConfig.subType === 'color') {
            pool = COLOR_SPELLING_DATA[level] || COLOR_SPELLING_DATA['small_stars'];
        } else {
            pool = SPELLING_GAME_DATA[level] || SPELLING_GAME_DATA['small_stars'];
        }

        if (!pool) return;

        // Pick random words for the number of rounds requested
        const count = stageConfig.count || 2;
        const selectedRounds = shuffle(pool).slice(0, count);
        setRounds(selectedRounds);
        setCurrentRoundIndex(0);
        setScore(0);
        setTimeLeft(stageConfig.time || 60);
    }, [level, stageConfig]);

    // Setup Current Round
    useEffect(() => {
        if (rounds.length > 0 && currentRoundIndex < rounds.length) {
            const currentWord = rounds[currentRoundIndex].word;
            const newGrid = generateGrid(currentWord);
            setGridItems(newGrid);

            // Scaffolding: If Color Spelling, pre-fill first letter
            if (stageConfig.subType === 'color') {
                setFoundIndices([0]);
                // Find the specific grid item that corresponds to the first letter (targetIndex 0)
                const startItem = newGrid.find(i => i.targetIndex === 0);
                setUsedGridItemIds(startItem ? [startItem.id] : []);
            } else {
                setFoundIndices([]);
                setUsedGridItemIds([]);
            }
        }
    }, [rounds, currentRoundIndex, stageConfig.subType]);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver || showSuccessModal) return;

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
        if (!gameStarted || gameOver || showSuccessModal) return;

        const currentWord = rounds[currentRoundIndex].word.toUpperCase();
        const nextExpectedIndex = foundIndices.length;

        // Check if item matches the expected letter
        if (item.char === currentWord[nextExpectedIndex]) {
            // Correct!
            const newFound = [...foundIndices, nextExpectedIndex];
            setFoundIndices(newFound);
            setUsedGridItemIds(prev => [...prev, item.id]);

            // Check Round Completion
            if (newFound.length === currentWord.length) {
                handleRoundComplete();
            }
        } else {
            // Wrong!
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
        }
    };

    const handleRoundComplete = () => {
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

    const getInstructions = () => {
        if (stageConfig.subType === 'color') {
            return {
                title: "Guess the Colour!",
                desc: "Spell the colour of the object shown.",
                example: "e.g. R-E-D"
            };
        }
        return {
            title: "Guess the Animal!",
            desc: "Spell the name of the animal shown.",
            example: "e.g. C-A-T"
        };
    };

    const instructions = getInstructions();

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
        <div className="w-full max-w-4xl backdrop-blur-sm bg-white/90 shadow-xl rounded-3xl p-4 md:p-8 animate-fade-in-up flex flex-col items-center min-h-[500px]">
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

            {/* Main Content Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center justify-items-center">

                {/* Left Column: Visuals */}
                <div className="flex flex-col items-center gap-6 w-full max-w-md order-1 md:order-1">
                    {currentRound.sentence && (
                        <h3 className="text-xl md:text-3xl font-display font-bold text-slate-700 text-center animate-fade-in">
                            {currentRound.sentence}
                        </h3>
                    )}

                    <div className="w-64 h-64 md:w-72 md:h-72 bg-slate-100 rounded-3xl p-6 flex items-center justify-center shadow-inner border-4 border-white transition-all hover:scale-105 duration-500">
                        <img src={currentRound.image} alt={currentRound.word} className="w-full h-full object-contain filter drop-shadow-lg" />
                    </div>
                </div>

                {/* Right Column: Interaction */}
                <div className="flex flex-col items-center gap-8 w-full max-w-md order-2 md:order-2">

                    {/* Word Placeholder Slots */}
                    <div className="flex gap-2 justify-center">
                        {wordLetters.map((char, index) => {
                            const isFound = foundIndices.includes(index);
                            const isComplete = foundIndices.length === wordLetters.length;
                            const wordColor = isComplete && stageConfig.subType === 'color' ? currentRound.word : null;

                            return (
                                <div key={index}
                                    style={{
                                        color: wordColor,
                                        borderColor: wordColor,
                                        backgroundColor: wordColor ? '#FFF' : undefined
                                    }}
                                    className={`w-12 h-16 md:w-14 md:h-18 rounded-2xl flex items-center justify-center text-3xl md:text-3xl font-bold border-b-4 transition-all duration-300
                                    ${isFound
                                            ? wordColor
                                                ? 'scale-110 shadow-lg'
                                                : 'bg-green-100 border-green-500 text-green-600 scale-110 shadow-lg'
                                            : 'bg-slate-100 border-slate-300 text-slate-400'
                                        }`}>
                                    {isFound ? char : '_'}
                                </div>
                            );
                        })}
                    </div>

                    {/* Letter Grid */}
                    <div className={`grid grid-cols-3 gap-3 md:gap-4 p-5 bg-slate-50/80 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-md`}>
                        <AnimatePresence mode="popLayout">
                            {gridItems.map((item) => {
                                const isFound = usedGridItemIds.includes(item.id);
                                const isDisabled = isFound;

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
                                        className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-bold shadow-sm transition-all relative
                                            ${isFound
                                                ? 'bg-green-500 text-white shadow-green-200 opacity-50'
                                                : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1'
                                            }`}
                                    >
                                        {isFound ? <Check className="w-10 h-10 md:w-12 md:h-12" /> : item.char}
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
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

            {/* Start Game Modal */}
            <AnimatePresence>
                {!gameStarted && !gameOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md text-center border-4 border-primary-100"
                        >
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600">
                                <HelpCircle size={32} />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">
                                {instructions.title}
                            </h2>
                            <p className="text-slate-600 mb-1 text-lg">
                                {instructions.desc}
                            </p>
                            <p className="text-slate-500 italic mb-8">
                                {instructions.example}
                            </p>

                            <button
                                onClick={() => setGameStarted(true)}
                                className="group relative px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold text-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all flex items-center gap-3"
                            >
                                <Play className="fill-current" />
                                I'm Ready!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
