import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PUZZLE_GAME_DATA } from '../../data/dummyData';
// Since we might not want to install dnd-kit if not present, let's use Framer Motion drag directly.
// It's simpler for this use case.

export default function PuzzleGame({ level = 'high_flyers', stageConfig, onComplete }) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time || 60);
    const [gameOver, setGameOver] = useState(false);

    // Config
    const scenes = PUZZLE_GAME_DATA[level] || PUZZLE_GAME_DATA['high_flyers'];
    const currentScene = scenes[currentSceneIndex];

    // State for current interactive session
    const [isCorrectlyPlaced, setIsCorrectlyPlaced] = useState(false);

    // Refs for measuring bounding boxes
    const dropZoneRef = useRef(null);

    // Timer Logic
    useEffect(() => {
        if (gameOver) return;
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
    }, [gameOver]);

    const handleDragEnd = (event, info, item) => {
        if (!dropZoneRef.current) return;

        const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
        const pointer = { x: info.point.x, y: info.point.y };

        // Simple hit detection: Check if pointer is within drop zone rect
        const isInside =
            pointer.x >= dropZoneRect.left &&
            pointer.x <= dropZoneRect.right &&
            pointer.y >= dropZoneRect.top &&
            pointer.y <= dropZoneRect.bottom;

        if (isInside) {
            if (item.id === currentScene.correctId) {
                // Correct!
                handleSuccess();
            } else {
                // Wrong piece
                // Maybe show visual feedback? Shake?
                // For now, it just snaps back (default framer motion behavior if dragConstraints imply it, 
                // but here we aren't constraining to a box, but we can reset key to force re-render or similar)
                // Actually framer motion drag simply stays where dropped unless we control x/y.
            }
        }
    };

    const handleSuccess = () => {
        setIsCorrectlyPlaced(true);
        setScore(prev => prev + 10);

        // Next level delay
        setTimeout(() => {
            if (currentSceneIndex < scenes.length - 1) {
                setIsCorrectlyPlaced(false);
                setCurrentSceneIndex(prev => prev + 1);
            } else {
                // All scenes done
                onComplete(score + 10);
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

    if (!currentScene) return <div>Loading...</div>;

    return (
        <div className="w-full max-w-5xl backdrop-blur-sm bg-white/90 shadow-xl rounded-3xl p-4 md:p-8 animate-fade-in-up flex flex-col items-center min-h-[600px]">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{currentScene.instruction}</h2>
                    <p className="text-slate-500">Drag the correct item to the empty spot!</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                    <span>⏱️</span>
                    <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative w-full max-w-3xl aspect-video bg-slate-200 rounded-3xl overflow-hidden shadow-inner mb-8">
                {/* Main Background */}
                <img
                    src={currentScene.mainImage}
                    alt="Scene"
                    className="w-full h-full object-cover"
                />

                {/* Drop Zone (The "Hole") */}
                <div
                    ref={dropZoneRef}
                    className={`absolute border-4 border-dashed transition-colors duration-300 flex items-center justify-center
                        ${currentScene.holeShape === 'circle' ? 'rounded-full' : 'rounded-xl'}
                        ${isCorrectlyPlaced ? 'border-green-500 bg-green-500/20' : 'border-white/50 bg-black/10'}
                    `}
                    style={{
                        top: currentScene.holePosition.top,
                        left: currentScene.holePosition.left,
                        width: currentScene.holePosition.width,
                        height: currentScene.holePosition.height,
                    }}
                >
                    {isCorrectlyPlaced && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-2 rounded-full shadow-lg"
                        >
                            <span className="text-2xl">✨</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Draggable Options */}
            <div className="flex gap-6 justify-center w-full">
                <AnimatePresence mode='popLayout'>
                    {!isCorrectlyPlaced && currentScene.options.map((item) => (
                        <motion.div
                            key={item.id}
                            layoutId={item.id}
                            drag
                            dragSnapToOrigin={true}
                            whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
                            whileHover={{ scale: 1.05, cursor: 'grab' }}
                            onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                            className="w-24 h-24 bg-white rounded-2xl shadow-lg p-2 flex items-center justify-center cursor-grab touch-none"
                        >
                            <img src={item.image} alt="option" className="w-full h-full object-contain pointer-events-none" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isCorrectlyPlaced && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-green-500 flex items-center gap-2"
                    >
                        <span>Great Job!</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
