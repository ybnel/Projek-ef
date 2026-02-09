import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { SENTENCE_BUILDER_DATA } from '../../data/dummyData';

// Images mapping (using existing puzzle images for context)
import bedroomImg from '../../assets/puzzle_bedroom.png';
import restaurantImg from '../../assets/puzzle_restaurant.png';
import playroomImg from '../../assets/puzzle_playroom.png';
import girlSkirtImg from '../../assets/girl_saw_pink_skirt.png';
import greyShoesImg from '../../assets/he_wear_shoes.png';
import brownHatImg from '../../assets/boy_with_brown_hat.png';

const SCENE_IMAGES = {
    bedroom: bedroomImg,
    restaurant: restaurantImg,
    playroom: playroomImg,
    girl_skirt: girlSkirtImg,
    grey_shoes: greyShoesImg,
    brown_hat: brownHatImg
};

export default function SentenceBuilderGame({ level = 'high_flyers', stageConfig, onComplete, onBack }) {
    const [scenarios, setScenarios] = useState([]);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [currentScenario, setCurrentScenario] = useState(null);

    // Game State
    const [wordBank, setWordBank] = useState([]);
    const [builtSentence, setBuiltSentence] = useState([]); // Array of word objects { id, text }
    const [isCorrect, setIsCorrect] = useState(null); // null, true, false
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time || 120);
    const [gameOver, setGameOver] = useState(false);

    // Initialize Data
    useEffect(() => {
        const data = SENTENCE_BUILDER_DATA[level] || [];
        // Shuffle scenarios or take random 2
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 2);
        setScenarios(shuffled);
        setCurrentScenarioIndex(0);
        setScore(0);
    }, [level]);

    // Setup Current Scenario
    useEffect(() => {
        if (scenarios.length > 0 && currentScenarioIndex < scenarios.length) {
            const scenario = scenarios[currentScenarioIndex];
            setCurrentScenario(scenario);

            // Prepare words: Tokenize sentence and shuffle
            const words = scenario.sentence.split(' ').map((text, idx) => ({
                id: `${scenario.id}-${idx}-${text}`,
                text: text
            }));

            setWordBank([...words].sort(() => Math.random() - 0.5));
            setBuiltSentence([]);
            setIsCorrect(null);
        } else if (scenarios.length > 0 && currentScenarioIndex >= scenarios.length) {
            // All stages done
            onComplete(score);
        }
    }, [scenarios, currentScenarioIndex]);

    // Timer
    useEffect(() => {
        if (gameOver || !currentScenario) return;
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
    }, [gameOver, currentScenario]);

    const handleWordClick = (word, fromBank) => {
        if (isCorrect === true) return; // Locked if correct

        setIsCorrect(null); // Reset feedback on change

        if (fromBank) {
            // Move from Bank to Sentence
            setWordBank(prev => prev.filter(w => w.id !== word.id));
            setBuiltSentence(prev => [...prev, word]);
        } else {
            // Move from Sentence to Bank
            setBuiltSentence(prev => prev.filter(w => w.id !== word.id));
            setWordBank(prev => [...prev, word]);
        }
    };

    const checkSentence = () => {
        if (!currentScenario) return;

        const currentText = builtSentence.map(w => w.text).join(' ');
        // Simple case-insensitive check, or exact match?
        // Let's do exact match but trim
        if (currentText === currentScenario.sentence) {
            setIsCorrect(true);
            const stagePoints = 20 + Math.min(timeLeft, 10);
            setScore(prev => prev + stagePoints);

            setTimeout(() => {
                setCurrentScenarioIndex(prev => prev + 1);
            }, 1500); // Wait 1.5s before next
        } else {
            setIsCorrect(false);
            // Shake effect handled by UI class
            setTimeout(() => setIsCorrect(null), 1000);
        }
    };

    const handleReset = () => {
        // Reset current sentence only
        if (!currentScenario) return;
        const words = currentScenario.sentence.split(' ').map((text, idx) => ({
            id: `${currentScenario.id}-${idx}-${text}`,
            text: text
        }));
        setWordBank([...words].sort(() => Math.random() - 0.5));
        setBuiltSentence([]);
        setIsCorrect(null);
    };

    if (!currentScenario) return <div className="p-10 text-center">Loading...</div>;

    if (gameOver) {
        return (
            <div className="w-full max-w-4xl backdrop-blur-sm bg-white/90 shadow-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-fade-in-up">
                <h2 className="text-3xl font-display font-bold text-red-500 mb-4">Time's Up!</h2>
                <button onClick={() => onComplete(score)} className="btn-primary">Finish</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl backdrop-blur-sm bg-white/90 shadow-xl rounded-3xl p-4 md:p-8 animate-fade-in-up flex flex-col items-center min-h-[600px]">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Secret Sentegit nce Builder</h2>
                        <p className="text-slate-500">Arrange the words to describe the picture!</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                    <span>⏱️</span>
                    <span className={`font-mono font-bold ${timeLeft < 20 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 w-full h-full">

                {/* Image Section */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-slate-50 rounded-2xl border-4 border-white shadow-sm">
                    <img
                        src={scenarios.length > 0 && SCENE_IMAGES[currentScenario.imageId] ? SCENE_IMAGES[currentScenario.imageId] : currentScenario.image}
                        alt="Scenario"
                        className="max-h-[300px] lg:max-h-[400px] w-auto object-contain rounded-lg shadow-md"
                    />
                </div>

                {/* Interaction Section */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6">

                    {/* Sentence Drop Zone */}
                    <div className="flex-1 flex flex-col gap-2">
                        <label className="text-slate-500 font-bold uppercase text-sm tracking-wider">Your Sentence:</label>
                        <div
                            className={`min-h-[100px] bg-slate-100 rounded-2xl border-2 p-4 flex flex-wrap gap-2 content-start transition-all duration-300
                                ${isCorrect === true ? 'border-green-400 bg-green-50' :
                                    isCorrect === false ? 'border-red-400 bg-red-50 animate-shake' : 'border-slate-300'}
                            `}
                        >
                            <AnimatePresence>
                                {builtSentence.length === 0 && (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
                                        Tap words below to build the sentence...
                                    </div>
                                )}
                                {builtSentence.map((word) => (
                                    <motion.button
                                        key={word.id}
                                        layoutId={word.id}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        onClick={() => handleWordClick(word, false)}
                                        className="bg-white border text-slate-800 px-4 py-2 rounded-xl shadow-sm hover:bg-red-50 hover:border-red-200 font-semibold text-lg"
                                    >
                                        {word.text}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={handleReset}
                            className="p-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-colors"
                            title="Reset Words"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={checkSentence}
                            disabled={builtSentence.length === 0 || isCorrect === true}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white transition-all transform active:scale-95
                                ${builtSentence.length === 0 ? 'bg-slate-300 cursor-not-allowed' :
                                    isCorrect === true ? 'bg-green-500' : 'bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl'}
                            `}
                        >
                            {isCorrect === true ? 'Correct!' : 'Check Sentence'}
                            {isCorrect === true && <Check className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Word Bank */}
                    <div className="flex-1 flex flex-col gap-2">
                        <label className="text-slate-500 font-bold uppercase text-sm tracking-wider">Word Bank:</label>
                        <div className="bg-slate-50 rounded-2xl p-4 flex flex-wrap gap-2 justify-center min-h-[120px]">
                            <AnimatePresence>
                                {wordBank.map((word) => (
                                    <motion.button
                                        key={word.id}
                                        layoutId={word.id}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        onClick={() => handleWordClick(word, true)}
                                        className="bg-white border-b-4 border-blue-200 active:border-b-0 active:translate-y-1 text-slate-700 px-4 py-2 rounded-xl font-bold text-lg shadow-sm hover:bg-blue-50 transition-all"
                                    >
                                        {word.text}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
