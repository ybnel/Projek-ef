import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, HelpCircle } from 'lucide-react';
import { MATCHING_GAME_DATA } from '../../data/dummyData';

// Utility to shuffle
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export default function TextMemoryGame({ level = 'high_flyers', stageConfig, onComplete, onBack }) {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time || 60);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [mistakes, setMistakes] = useState(0);

    // Initialize Game
    useEffect(() => {
        // Get data based on level
        const rawData = MATCHING_GAME_DATA[level] || [];

        // Normalize IDs to ensure uniqueness if mixed
        const pool = rawData.map(item => ({ ...item, id: `${level}-${item.id}` }));

        // Select random pairs
        const pairCount = stageConfig.pairCount || 6;
        const selectedPairs = shuffle(pool).slice(0, pairCount);

        // Generate Cards
        const deck = [];
        selectedPairs.forEach(pair => {
            // Card 1
            deck.push({
                id: pair.id,
                content: pair.text1,
                type: 'text1',
                pairId: pair.id,
                uid: `${pair.id}-1`
            });
            // Card 2
            deck.push({
                id: pair.id,
                content: pair.text2,
                type: 'text2',
                pairId: pair.id,
                uid: `${pair.id}-2`
            });
        });

        setCards(shuffle(deck));
        setScore(0);
        setMatchedPairs([]);
        setFlippedIndices([]);
        setTimeLeft(stageConfig.time || 90);
    }, [level, stageConfig]);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver || matchedPairs.length === cards.length / 2) return;

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
    }, [gameStarted, gameOver, matchedPairs, cards.length]);

    const handleCardClick = (index) => {
        if (
            !gameStarted ||
            gameOver ||
            flippedIndices.length >= 2 ||
            flippedIndices.includes(index) ||
            matchedPairs.includes(cards[index].pairId)
        ) return;

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            const index1 = newFlipped[0];
            const index2 = newFlipped[1];
            const card1 = cards[index1];
            const card2 = cards[index2];

            if (card1.pairId === card2.pairId) {
                // Match!
                setMatchedPairs(prev => [...prev, card1.pairId]);
                setFlippedIndices([]);
                setScore(prev => prev + 10);

                // Check Win
                if (matchedPairs.length + 1 === cards.length / 2) {
                    setTimeout(() => onComplete(score + 10 + timeLeft), 1000);
                }
            } else {
                // No Match
                setMistakes(prev => prev + 1);
                setTimeout(() => {
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    const getInstructions = () => {
        if (level === 'high_flyers') {
            return {
                title: "Match Verbs!",
                desc: "Find the pair of Present (V1) and Past (V2) forms.",
                example: "e.g. Eat ↔ Ate"
            };
        }
        if (level === 'trailblazers') {
            return {
                title: "Match Opposites!",
                desc: "Find the pair of Antonyms.",
                example: "e.g. Hot ↔ Cold"
            };
        }
        return {
            title: "Match Pairs!",
            desc: "Find all the matching text pairs.",
            example: ""
        };
    };

    const instructions = getInstructions();

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
                        <h2 className="text-2xl font-bold text-slate-800">Match the Pairs!</h2>
                        <p className="text-slate-500">Find the opposites and verb forms</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                    <span>⏱️</span>
                    <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-2 md:gap-4 w-full max-w-3xl">
                {cards.map((card, index) => {
                    const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.pairId);

                    return (
                        <motion.div
                            key={card.uid}
                            layout
                            className="aspect-[4/3] perspective-1000"
                        >
                            <button
                                onClick={() => handleCardClick(index)}
                                className="w-full h-full relative preserve-3d transition-transform duration-500"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                {/* Front (Hidden) */}
                                <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-50 transition-colors flex items-center justify-center text-slate-400">
                                        ?
                                    </div>
                                </div>

                                {/* Back (Revealed Text) */}
                                <div
                                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl flex items-center justify-center shadow-lg transform rotate-y-180"
                                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                                >
                                    <span className="text-sm md:text-xl font-bold text-slate-700 text-center px-1 md:px-2 break-words leading-tight">
                                        {card.content}
                                    </span>
                                </div>
                            </button>
                        </motion.div>
                    );
                })}
            </div>
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
        </div>
    );
}
