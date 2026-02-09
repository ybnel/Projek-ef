import React, { useState, useEffect } from 'react';
import { MATCHING_GAME_DATA } from '../../data/dummyData';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';

// Simple shuffle function
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export default function MatchGame({ level = 'small_stars', stageConfig, onComplete, onBack }) {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState([]); // [id1, id2] - can be image or word
    const [matched, setMatched] = useState([]); // [id1, id2, ...]

    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
    const [gameOver, setGameOver] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [score, setScore] = useState(stageConfig?.score || 15);

    // Initialize game
    useEffect(() => {
        // Fallback to small_stars if level data missing, or empty array
        const data = MATCHING_GAME_DATA[level] || MATCHING_GAME_DATA['small_stars'];

        // Create pairs based on data structure
        // Shuffle all available data first, then take first N items based on config
        const pairCount = stageConfig?.pairs || 8;
        const selectedData = shuffle(data).slice(0, pairCount);

        const gameItems = [];
        selectedData.forEach(d => {
            // Determine content for first item
            let item1;
            if (d.image) {
                item1 = { id: d.id + '_1', type: 'image', content: d.image, matchId: d.id };
            } else if (d.text1) {
                item1 = { id: d.id + '_1', type: 'text', content: d.text1, matchId: d.id };
            }

            // Determine content for second item
            let item2;
            if (d.text2) {
                item2 = { id: d.id + '_2', type: 'text', content: d.text2, matchId: d.id };
            } else if (d.word) {
                item2 = { id: d.id + '_2', type: 'text', content: d.word, matchId: d.id };
            }

            if (item1 && item2) {
                gameItems.push(item1, item2);
            }
        });
        setItems(shuffle(gameItems));
        setTimeLeft(stageConfig?.time || 60); // Reset timer from config
        setGameOver(false);
        setMatched([]);
        setSelected([]);
        setScore(stageConfig?.score || 15);
        setMistakes(0);

        // Check initial fullscreen state
        if (document.fullscreenElement) {
            setIsFullscreen(true);
        }
    }, [level]);

    // Timer effect
    useEffect(() => {
        if (gameOver || matched.length === (items.length / 2)) return;

        if (timeLeft <= 0) {
            setGameOver(true);
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, gameOver, matched.length, items.length]);

    // Fullscreen handler
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleCardClick = (item) => {
        if (gameOver || matched.includes(item.matchId) || selected.find(s => s.uniqueId === item.id)) return;

        // Add unique identifier to distinguish between image and word of same matchId in selection
        const currentSelection = { ...item, uniqueId: item.id };

        if (selected.length === 0) {
            setSelected([currentSelection]);
        } else if (selected.length === 1) {
            const first = selected[0];
            setSelected([...selected, currentSelection]);

            if (first.matchId === item.matchId && first.id !== item.id) {
                // Match!
                const newMatched = [...matched, item.matchId];
                setMatched(newMatched);
                setSelected([]);

                // Check win condition
                if (newMatched.length === items.length / 2) {
                    // Calculate score? For now just trigger complete
                    // In real implementation we should track mistakes and reduce score
                    setTimeout(() => onComplete(score), 1500);
                }
            } else {
                // No match
                const newMistakes = mistakes + 1;
                setMistakes(newMistakes);
                if (newMistakes > 5) {
                    setScore(prev => Math.max(0, prev - 2));
                }
                setTimeout(() => setSelected([]), 1000);
            }
        }
    };

    if (gameOver) {
        return (
            <div className="w-full max-w-5xl backdrop-blur-sm bg-white/90 shadow-2xl rounded-3xl p-8 animate-fade-in-up flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-4xl">⏰</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">Time's Up!</h2>
                <p className="text-slate-600 mb-8">Don't give up, try again!</p>

                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
                    >
                        Back to Levels
                    </button>
                    <button
                        onClick={() => {
                            // Reset game based on current level
                            const data = MATCHING_GAME_DATA[level] || MATCHING_GAME_DATA['small_stars'];

                            // Shuffle all available data first, then take first 8 items
                            const selectedData = shuffle(data).slice(0, 8);

                            const gameItems = [];
                            selectedData.forEach(d => {
                                let item1;
                                if (d.image) {
                                    item1 = { id: d.id + '_1', type: 'image', content: d.image, matchId: d.id };
                                } else if (d.text1) {
                                    item1 = { id: d.id + '_1', type: 'text', content: d.text1, matchId: d.id };
                                }

                                let item2;
                                if (d.text2) {
                                    item2 = { id: d.id + '_2', type: 'text', content: d.text2, matchId: d.id };
                                } else if (d.word) {
                                    item2 = { id: d.id + '_2', type: 'text', content: d.word, matchId: d.id };
                                }
                                if (item1 && item2) gameItems.push(item1, item2);
                            });
                            setItems(shuffle(gameItems));
                            setTimeLeft(60);
                            setGameOver(false);
                            setMatched([]);
                            setSelected([]);
                        }}
                        className="btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl landscape:max-w-3xl backdrop-blur-sm bg-white/90 shadow-2xl rounded-3xl p-3 md:p-8 animate-fade-in-up transition-all duration-300">
            <div className="w-full flex justify-between items-center mb-4 md:mb-8 gap-2 md:gap-4">
                <button
                    onClick={onBack}
                    className="flex text-slate-500 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <div className="text-center flex-1">
                    <h2 className="text-lg md:text-3xl font-display font-bold text-slate-800 leading-tight">Match the Pairs!</h2>
                    <p className="text-xs md:text-base text-slate-500 capitalize">{level.replace('_', ' ')} Challenge</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 md:px-4 md:py-2 rounded-xl">
                        <span className="text-base md:text-xl">⏱️</span>
                        <span className={`text-base md:text-xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Grid adapted for mobile: 4 columns always (4x4), compact gap */}
            <div className="grid grid-cols-4 gap-2 md:gap-4 w-full">
                {items.map((item, idx) => {
                    const isSelected = selected.find(s => s.uniqueId === item.id);
                    const isMatched = matched.includes(item.matchId);
                    const isSelectedReal = selected.some(s => s.id === item.id);
                    const isWrong = selected.length === 2 && isSelectedReal; // If 2 items are selected, it's a mismatch waiting to clear

                    return (
                        <button
                            key={idx}
                            onClick={() => handleCardClick(item)}
                            disabled={isMatched || isSelectedReal}
                            className={`aspect-square rounded-lg md:rounded-2xl p-1 md:p-4 flex items-center justify-center transition-all transform duration-300 ${isMatched
                                ? 'bg-green-100 border-2 md:border-4 border-green-400 opacity-50 scale-95'
                                : isSelectedReal
                                    ? isWrong
                                        ? 'bg-red-100 border-2 md:border-4 border-red-500 scale-105 shadow-xl animate-shake'
                                        : 'bg-primary-100 border-2 md:border-4 border-primary-500 scale-105 shadow-xl'
                                    : 'bg-white border md:border-2 border-slate-200 hover:border-primary-300 hover:shadow-lg'
                                }`}
                        >
                            {item.type === 'image' ? (
                                <img src={item.content} alt="match" className="w-full h-full object-contain rounded-md" />
                            ) : (
                                <span className={`font-bold text-slate-700 break-words text-center leading-tight ${item.content.length > 5 ? 'text-xs md:text-xl' : 'text-sm md:text-2xl'}`}>
                                    {item.content}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
