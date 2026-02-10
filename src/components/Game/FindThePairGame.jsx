import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { MATCHING_GAME_DATA } from '../../data/dummyData';
import { shuffle } from '../../utils/gameUtils';



export default function FindThePairGame({ level = 'small_stars', stageConfig, onComplete, onBack }) {
    const [items, setItems] = useState([]);
    const [phase, setPhase] = useState('instruction'); // 'instruction' (View Target) -> 'memorize' (View All) -> 'shuffling' -> 'search'
    const [targetItem, setTargetItem] = useState(null); // The item user needs to find
    const [selected, setSelected] = useState([]);
    const [matched, setMatched] = useState([]);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time || 30);
    const [mistakes, setMistakes] = useState(0);
    const [score, setScore] = useState(stageConfig.score);
    const [gameOver, setGameOver] = useState(false);

    // Initialize Game
    useEffect(() => {
        const pool = MATCHING_GAME_DATA[level] || MATCHING_GAME_DATA['small_stars'];
        // Select random items from pool
        const is3x3 = stageConfig?.gridSize === 9;
        const pairCount = is3x3 ? 4 : (stageConfig?.pairCount || 4);

        let selectedOriginals = shuffle(pool);
        const pairsToUse = selectedOriginals.slice(0, pairCount);

        // Create pairs (Image A - Image A)
        const gameItems = [];
        pairsToUse.forEach(item => {
            gameItems.push({ ...item, uid: item.id + '_1' });
            gameItems.push({ ...item, uid: item.id + '_2' });
        });

        const shuffledItems = shuffle(gameItems);
        setItems(shuffledItems);

        // Select Target IMMEDIATELY
        const randomTarget = shuffledItems[Math.floor(Math.random() * shuffledItems.length)];
        setTargetItem(randomTarget);
        setPhase('instruction');

    }, [level, stageConfig]);

    // Timer Logic - ONLY runs during Search
    useEffect(() => {
        if (gameOver || phase !== 'search') return;

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
    }, [phase, gameOver]);

    // Phase transitions handled by user interaction or timeouts


    // Auto-transition from Shuffling to Search
    useEffect(() => {
        if (phase === 'shuffling') {
            const shuffleInterval = setInterval(() => {
                setItems(prev => shuffle(prev));
            }, 500);

            const stopShuffle = setTimeout(() => {
                clearInterval(shuffleInterval);
                setPhase('search');
            }, 2500);

            return () => {
                clearInterval(shuffleInterval);
                clearTimeout(stopShuffle);
            };
        }
    }, [phase]);

    const handleCardClick = (item) => {
        // Prevent clicking if game over, already matched, already selected, modal open, OR 2 cards already open (processing)
        if (phase !== 'search' || gameOver || matched.includes(item.id) || selected.find(s => s.uid === item.uid) || phase === 'instruction' || selected.length >= 2) return;

        // 1. Reveal the card
        const newSelected = [...selected, item];
        setSelected(newSelected);

        // 2. If 2 cards are selected, check for match
        if (newSelected.length === 2) {
            const first = newSelected[0];
            const second = newSelected[1];

            // Check if they are the SAME item (Pair found)
            if (first.id === second.id) {
                // Check if they are the TARGET item
                if (first.id === targetItem.id) {
                    // Success!
                    setMatched(prev => [...prev, first.id]);
                    setSelected([]);
                    setTimeout(() => onComplete(Math.max(0, score)), 1000);
                } else {
                    // Correct Pair, but WRONG Target -> Mistake + Flip Back
                    // "kalo misal tidak sesuai dengan hewan yang diminta ntar dibalik lagi"
                    setTimeout(() => {
                        setSelected([]);
                        handleMistake();
                    }, 1000);
                }
            } else {
                // Not a pair -> Mistake + Flip Back
                setTimeout(() => {
                    setSelected([]);
                    handleMistake();
                }, 1000);
            }
        }
    };

    const handleMistake = () => {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);

        // Penalty Rule: Deduct points only after 5 wrong attempts
        if (newMistakes > 5) {
            setScore(prev => Math.max(0, prev - 2));
        }
    };

    if (gameOver) {
        return (
            <div className="w-full max-w-4xl backdrop-blur-sm bg-white/90 shadow-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-fade-in-up">
                <h2 className="text-3xl font-display font-bold text-red-500 mb-4">Time's Up!</h2>
                <button onClick={() => onComplete(0)} className="btn-primary">View Score</button>
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
                        <h2 className="text-2xl font-bold text-slate-800">
                            {phase === 'instruction' ? 'Check your Target!' :
                                phase === 'shuffling' ? 'Shuffling...' :
                                    `Find the ${targetItem?.word}!`}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                    <span>⏱️</span>
                    <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                </div>
            </div>

            {/* Target Hint (Only in Search Phase) */}
            {/* Target Popup Modal - Shows during INSTRUCTION phase */}
            <AnimatePresence>
                {phase === 'instruction' && targetItem && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-3xl backdrop-blur-sm"
                    >
                        <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce-in max-w-sm w-full mx-4">
                            <h3 className="text-xl font-bold text-slate-500 mb-2">Find This Pair:</h3>
                            <h2 className="text-5xl font-display font-bold text-primary-600 mb-8 border-b-4 border-primary-200 px-6 pb-2">
                                {targetItem.word}
                            </h2>
                            <button
                                onClick={() => setPhase('shuffling')}
                                className="btn-primary w-full text-lg py-3 shadow-xl shadow-primary-500/30"
                            >
                                I'm Ready!
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid */}
            <div className={`grid grid-cols-4 gap-4 w-full max-w-2xl relative z-0`}>
                {items.map((item) => {
                    // Logic for showing card face
                    // Shuffling: ALL CLOSED
                    // Search: CLOSED unless selected/matched
                    const isOpen = selected.find(s => s.uid === item.uid) || matched.includes(item.id);

                    return (
                        <motion.div
                            layout
                            key={item.uid}
                            transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 25 }}
                            className="aspect-square relative z-10"
                        >
                            <button
                                onClick={() => handleCardClick(item)}
                                disabled={phase !== 'search' || isOpen}
                                className="w-full h-full rounded-2xl relative perspective-1000 cursor-pointer focus:outline-none"
                                style={{ perspective: '1000px' }}
                            >
                                <motion.div
                                    className="w-full h-full relative preserve-3d"
                                    style={{ transformStyle: 'preserve-3d' }}
                                    animate={{ rotateY: isOpen ? 0 : 180 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {/* Front Face (Image) - visible when 0deg */}
                                    <div
                                        className="absolute inset-0 w-full h-full bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg backface-hidden"
                                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
                                    >
                                        <img src={item.image} alt="content" className="w-full h-full object-contain rounded-xl" />
                                    </div>

                                    {/* Back Face (?) - visible when 180deg */}
                                    <div
                                        className="absolute inset-0 w-full h-full bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg backface-hidden"
                                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                    >
                                        <div className="text-white opacity-50 text-4xl">?</div>
                                    </div>
                                </motion.div>
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
