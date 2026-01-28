import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PUZZLE_GAME_DATA } from '../../data/dummyData';
import bedroomImg from '../../assets/puzzle_bedroom.png';
import restaurantImg from '../../assets/puzzle_restaurant.png';
import playroomImg from '../../assets/puzzle_playroom.png';

const SCENE_IMAGES = {
    bedroom: bedroomImg,
    restaurant: restaurantImg,
    playroom: playroomImg
};

export default function PuzzleGame({ level = 'high_flyers', stageConfig, onComplete, onBack }) {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time || 90);
    const [gameOver, setGameOver] = useState(false);

    // Current Scenario
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    // Initialize scenes synchronously
    const [scenes, setScenes] = useState(() => {
        const data = PUZZLE_GAME_DATA[level] || [];
        if (data.length === 0) return [];

        // If a specific scene is requested via config (from GameController randomization)
        if (stageConfig?.sceneId) {
            const specificScene = data.find(s => s.id === stageConfig.sceneId);
            return specificScene ? [specificScene] : [];
        }

        // Fallback: Shuffle and return all available scenes (legacy behavior)
        return [...data].sort(() => Math.random() - 0.5);
    });

    // Reset loop if level changes or specific scene changes
    useEffect(() => {
        const data = PUZZLE_GAME_DATA[level] || [];

        if (stageConfig?.sceneId) {
            const specificScene = data.find(s => s.id === stageConfig.sceneId);
            setScenes(specificScene ? [specificScene] : []);
        } else {
            setScenes([...data].sort(() => Math.random() - 0.5));
        }

        setCurrentSceneIndex(0);
        setPlacedItems({});
    }, [level, stageConfig?.sceneId]);

    const currentScene = scenes[currentSceneIndex];
    const currentImage = currentScene ? SCENE_IMAGES[currentScene.imageId] : null;

    // State to track placed items: { itemId: true }
    const [placedItems, setPlacedItems] = useState({});

    // Ref for the image container to calculate relative positions
    const containerRef = useRef(null);

    // Timer Logic
    useEffect(() => {
        if (gameOver) return;
        if (!currentScene || !currentScene.items) return;
        if (Object.keys(placedItems).length === currentScene.items.length) return; // Stop timer if won

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
    }, [gameOver, placedItems, currentScene]);

    const handleDragEnd = (event, info, item) => {
        if (!containerRef.current) return;

        // Find the actual image element to calculate relative coordinates against the IMAGE, not the container buffer
        const imgElement = containerRef.current.querySelector('img');
        if (!imgElement) return;

        const containerRect = imgElement.getBoundingClientRect();
        const pointer = { x: info.point.x, y: info.point.y };

        // Check against target zone
        const target = item.target; // { top: '50%', left: '20%', width: '10%', height: '10%' }

        // Convert percentages to pixels relative to container
        const tY = (parseFloat(target.top) / 100) * containerRect.height;
        const tX = (parseFloat(target.left) / 100) * containerRect.width;
        const tW = (parseFloat(target.width) / 100) * containerRect.width;
        const tH = (parseFloat(target.height) / 100) * containerRect.height;

        // Absolute screen positioning of the target zone
        const zoneRect = {
            top: containerRect.top + tY,
            left: containerRect.left + tX,
            bottom: containerRect.top + tY + tH,
            right: containerRect.left + tX + tW
        };

        const isInside =
            pointer.x >= zoneRect.left &&
            pointer.x <= zoneRect.right &&
            pointer.y >= zoneRect.top &&
            pointer.y <= zoneRect.bottom;

        if (isInside) {
            // Success for this item
            setPlacedItems(prev => {
                const newState = { ...prev, [item.id]: true };
                // Check win condition immediately
                if (Object.keys(newState).length === currentScene.items.length) {
                    handleAllCompleted();
                }
                return newState;
            });
        }
    };

    const handleAllCompleted = () => {
        const stageScore = (currentScene.items.length * 10) + timeLeft;
        const newTotalScore = score + stageScore;
        setScore(newTotalScore);

        // Wait a bit then decide
        setTimeout(() => {
            if (currentSceneIndex < scenes.length - 1) {
                // Next Scenario
                setCurrentSceneIndex(prev => prev + 1);
                setPlacedItems({});
                // Reset timer for next stage if needed, or keep cumulative? Usually reset.
                setTimeLeft(stageConfig.time || 90);
            } else {
                // All done
                onComplete(newTotalScore);
            }
        }, 1500);
    };

    if (gameOver) {
        return (
            <div className="w-full max-w-4xl backdrop-blur-sm bg-white/90 shadow-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-fade-in-up">
                <h2 className="text-3xl font-display font-bold text-red-500 mb-4">Time's Up!</h2>
                <button onClick={() => onComplete(score)} className="btn-primary">Finish</button>
            </div>
        );
    }

    if (!currentScene) return <div className="p-8 text-center">Loading Scenario...</div>;

    // Remaining items to be dragged
    const remainingItems = currentScene.items.filter(item => !placedItems[item.id]);

    return (
        <div className="w-full max-w-7xl backdrop-blur-sm bg-white/90 shadow-xl rounded-3xl p-4 md:p-6 animate-fade-in-up flex flex-col items-center min-h-[600px]">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-primary-600"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{currentScene.instruction}</h2>
                        <p className="text-slate-500">Drag the words to the correct objects!</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-bold">
                        Found: {Object.keys(placedItems).length} / {currentScene.items.length}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                        <span>⏱️</span>
                        <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row w-full gap-6 h-full items-start">
                {/* Main Game Area */}
                <div className="relative w-full lg:flex-1 bg-slate-100 rounded-3xl overflow-hidden shadow-inner border-4 border-white h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
                    {/* Inner wrapper that hugs the image */}
                    <div ref={containerRef} className="relative inline-block h-full w-full flex items-center justify-center">
                        <div className="relative">
                            <img
                                src={currentImage}
                                alt="Scene"
                                className="max-w-full max-h-[580px] w-auto h-auto object-contain select-none pointer-events-none"
                            />

                            {/* DEBUG: Show all hitboxes */}
                            {/* Successfully Placed Labels (Stick to image) */}
                            {currentScene.items.map(item => {
                                if (!placedItems[item.id]) return null;
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                                        style={{
                                            // Center of the target zone relative to the image wrapper
                                            top: `calc(${item.target.top} + (${item.target.height} / 2))`,
                                            left: `calc(${item.target.left} + (${item.target.width} / 2))`,
                                        }}
                                    >
                                        <div className="bg-green-500 text-white px-3 py-1 rounded-full shadow-lg font-bold text-sm border-2 border-white flex items-center gap-1 whitespace-nowrap">
                                            <span>{item.label}</span>
                                            <span className="bg-white text-green-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✓</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Draggable Word Bank */}
                <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm p-4 h-full border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Word Bank</h3>
                        <div className="flex flex-wrap lg:flex-col gap-3 justify-center">
                            <AnimatePresence>
                                {remainingItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layoutId={item.id}
                                        drag
                                        // Snap back to origin if dropped invalidly
                                        dragSnapToOrigin={true}
                                        whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: 100 }}
                                        whileHover={{ scale: 1.05, cursor: 'grab', backgroundColor: '#f0f9ff' }}
                                        onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                                        className="bg-white border-2 border-slate-200 text-slate-700 px-4 py-3 rounded-xl shadow-sm font-bold text-center cursor-grab touch-none select-none hover:border-blue-300 transition-colors w-40 lg:w-full min-w-[120px]"
                                    >
                                        {item.label}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {remainingItems.length === 0 && (
                                <div className="text-center p-6 text-green-600 font-bold bg-green-50 rounded-xl flex flex-col items-center gap-2">
                                    <span className="text-4xl">🎉</span>
                                    <span>All words found!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
