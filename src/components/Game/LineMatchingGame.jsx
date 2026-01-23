import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LINE_MATCH_DATA } from '../../data/dummyData';

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export default function LineMatchingGame({ level = 'small_stars', stageConfig, onComplete }) {
    const [images, setImages] = useState([]);
    const [words, setWords] = useState([]);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time || 45);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Draw state
    const [connections, setConnections] = useState([]); // Array of { start: id, end: id, correct: boolean }
    const [currentLine, setCurrentLine] = useState(null); // { startPoint: {x,y}, endPoint: {x,y}, startId: id, type: 'image'|'word' }

    // Refs for elements to calculate positions
    const containerRef = useRef(null);
    const itemRefs = useRef({});

    // Initialize
    useEffect(() => {
        const pool = LINE_MATCH_DATA[level] || LINE_MATCH_DATA['small_stars'];
        const shuffledPool = shuffle([...pool]); // Shuffle ALL items first
        const selected = shuffledPool.slice(0, 5); // Take first 5 random items

        // Split into separate shuffled arrays
        setImages(shuffle([...selected]));
        setWords(shuffle([...selected]));
    }, [level]);

    // Timer
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

    // Check completion
    useEffect(() => {
        if (images.length > 0 && connections.length === images.length) {
            // All matches made
            setTimeout(() => {
                onComplete(score);
            }, 1000);
        }
    }, [connections, images, score, onComplete]);

    const getAnchorPosition = (id, type) => {
        const key = `${type}-${id}`;
        const el = itemRefs.current[key];
        if (!el || !containerRef.current) return { x: 0, y: 0 };

        const rect = el.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate relative position within the container
        // Image (Left col) -> Connect to Right side
        // Word (Right col) -> Connect to Left side
        // The dots are positioned absolutely roughly 12px (3 * 4px) outside.
        const xOffset = type === 'image' ? rect.width + 12 : -12;

        return {
            x: (rect.left - containerRect.left) + (type === 'image' ? rect.width : 0) + (type === 'image' ? 10 : -10), // Adjust to hit the dot center roughly
            y: (rect.top - containerRect.top) + rect.height / 2
        };
    };

    const handleStart = (id, type, e) => {
        if (connections.find(c => c.start === id || c.end === id)) return; // Already connected

        // Prevent default only if touch to avoid scrolling while drawing? 
        // Better to allow scrolling if not direct hit.

        const pos = getAnchorPosition(id, type);
        setCurrentLine({
            startId: id,
            startType: type,
            startPoint: pos,
            endPoint: pos // Initially same
        });
    };

    const handleMove = (e) => {
        if (!currentLine || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        // Handle both Mouse and Touch events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        setCurrentLine(prev => ({
            ...prev,
            endPoint: {
                x: clientX - containerRect.left,
                y: clientY - containerRect.top
            }
        }));
    };

    const handleEnd = (e) => {
        if (!currentLine) return;

        // Check what we dropped on
        // Simple hit detection if we let go over a target? 
        // Or we can rely on `onMouseUp` on the target elements.
        // Actually, pure mouse move ending over an element requires `document.elementFromPoint`.

        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        const element = document.elementFromPoint(clientX, clientY);
        // Find closest parent that is a drop target
        const targetEl = element?.closest('[data-id]');

        if (targetEl) {
            const targetId = parseInt(targetEl.getAttribute('data-id'));
            const targetType = targetEl.getAttribute('data-type');

            // Validate match
            if (targetType && targetType !== currentLine.startType) {
                // Must receive opposite type

                // Allow connection only if not already connected
                const alreadyConnected = connections.find(c => c.start === targetId || c.end === targetId || c.start === currentLine.startId || c.end === currentLine.startId);

                if (!alreadyConnected) {
                    const isCorrect = targetId === currentLine.startId;

                    const newConnection = {
                        start: currentLine.startType === 'image' ? currentLine.startId : targetId,
                        end: currentLine.startType === 'word' ? currentLine.startId : targetId,
                        correct: isCorrect
                    };

                    setConnections(prev => [...prev, newConnection]);

                    if (isCorrect) {
                        setScore(prev => prev + 5);
                    } else {
                        // Penalty?
                        setScore(prev => Math.max(0, prev - 2));

                        // Optional: Remove wrong connection after delay
                        setTimeout(() => {
                            setConnections(prev => prev.filter(c => c !== newConnection));
                        }, 500);
                    }
                }
            }
        }

        setCurrentLine(null);
    };

    return (
        <div
            className="w-full max-w-5xl backdrop-blur-sm bg-white/90 shadow-xl rounded-3xl p-4 md:p-8 animate-fade-in-up flex flex-col items-center min-h-[600px] select-none"
        >
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Match the Actions!</h2>
                    <p className="text-slate-500">Draw a line from image to word</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                    <span>⏱️</span>
                    <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative w-full flex-1 flex justify-between items-center px-8"
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            >
                {/* Lines Layer (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {connections.map((conn, i) => {
                        const startPos = getAnchorPosition(conn.start, 'image');
                        const endPos = getAnchorPosition(conn.end, 'word');
                        return (
                            <line
                                key={i}
                                x1={startPos.x} y1={startPos.y}
                                x2={endPos.x} y2={endPos.y}
                                stroke={conn.correct ? '#22c55e' : '#ef4444'}
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        );
                    })}
                    {currentLine && (
                        <line
                            x1={currentLine.startPoint.x} y1={currentLine.startPoint.y}
                            x2={currentLine.endPoint.x} y2={currentLine.endPoint.y}
                            stroke="#3b82f6"
                            strokeWidth="4"
                            strokeDasharray="5,5"
                            strokeLinecap="round"
                        />
                    )}
                </svg>

                {/* Images Column */}
                <div className="flex flex-col gap-6 w-1/3">
                    {images.map(item => {
                        const isConnected = connections.find(c => c.start === item.id);
                        return (
                            <div
                                key={item.id}
                                data-id={item.id}
                                data-type="image"
                                ref={el => itemRefs.current[`image-${item.id}`] = el}
                                onMouseDown={(e) => handleStart(item.id, 'image', e)}
                                onTouchStart={(e) => handleStart(item.id, 'image', e)}
                                className={`
                                    relative h-24 bg-white rounded-2xl shadow-md p-2 flex items-center justify-center cursor-pointer transition-all
                                    ${isConnected ? (isConnected.correct ? 'border-4 border-green-500' : 'border-4 border-red-500') : 'hover:scale-105 border-2 border-transparent hover:border-primary-300'}
                                `}
                            >
                                <img src={item.image} alt="action" className="h-full w-full object-contain rounded-xl pointer-events-none" />
                                {/* Connector Dot Right */}
                                <div className="absolute -right-3 w-6 h-6 bg-slate-200 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Words Column */}
                <div className="flex flex-col gap-6 w-1/3">
                    {words.map(item => {
                        const isConnected = connections.find(c => c.end === item.id);
                        return (
                            <div
                                key={item.id}
                                data-id={item.id}
                                data-type="word"
                                ref={el => itemRefs.current[`word-${item.id}`] = el}
                                onMouseDown={(e) => handleStart(item.id, 'word', e)}
                                onTouchStart={(e) => handleStart(item.id, 'word', e)}
                                className={`
                                    relative h-24 bg-white rounded-2xl shadow-md p-4 flex items-center justify-center cursor-pointer transition-all
                                    ${isConnected ? (isConnected.correct ? 'border-4 border-green-500' : 'border-4 border-red-500') : 'hover:scale-105 border-2 border-transparent hover:border-primary-300'}
                                `}
                            >
                                <span className="text-xl font-bold text-slate-700 pointer-events-none">{item.word}</span>
                                {/* Connector Dot Left */}
                                <div className="absolute -left-3 w-6 h-6 bg-slate-200 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {gameOver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Time's Up!</h2>
                        <button onClick={() => onComplete(score)} className="btn-primary">Finish</button>
                    </div>
                </div>
            )}
        </div>
    );
}
