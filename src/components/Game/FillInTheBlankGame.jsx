import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FILL_BLANK_DATA } from '../../data/dummyData';
import { CheckCircle } from 'lucide-react';

export default function FillInTheBlankGame({ stageConfig, onComplete }) {
    const [score, setScore] = useState(stageConfig.score);
    const [timeLeft, setTimeLeft] = useState(stageConfig.time);
    const [gameOver, setGameOver] = useState(false);

    // Track which questions are answered correctly
    const [completedIds, setCompletedIds] = useState([]);

    const questions = FILL_BLANK_DATA.trailblazers || [];

    // Timer
    useEffect(() => {
        if (gameOver || completedIds.length === questions.length) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameOver, completedIds.length, questions.length]);

    // Check completion
    useEffect(() => {
        if (completedIds.length === questions.length && questions.length > 0) {
            setTimeout(() => {
                onComplete(Math.max(0, score));
            }, 1000);
        }
    }, [completedIds, questions.length, onComplete, score]);

    const handleDragEnd = (event, info, option, question) => {
        const dropZone = document.getElementById(`target-blank-${question.id}`);
        if (dropZone) {
            const rect = dropZone.getBoundingClientRect();
            const dropX = info.point.x;
            const dropY = info.point.y;

            if (
                dropX >= rect.left &&
                dropX <= rect.right &&
                dropY >= rect.top &&
                dropY <= rect.bottom
            ) {
                if (option === question.answer) {
                    // Correct!
                    setCompletedIds(prev => [...prev, question.id]);
                } else {
                    // Incorrect!
                    setScore(prev => Math.max(0, prev - 2));
                }
            }
        }
    };

    if (gameOver) {
        return (
            <div className="w-full max-w-4xl backdrop-blur-sm bg-white/90 shadow-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-fade-in-up">
                <h2 className="text-3xl font-display font-bold text-red-500 mb-4">Time's Up!</h2>
                <p className="mb-6 text-slate-600">You ran out of time.</p>
                <button onClick={() => onComplete(0)} className="btn-primary">Continue</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl backdrop-blur-sm bg-white/90 shadow-xl rounded-3xl p-4 md:p-8 animate-fade-in-up flex flex-col h-[85vh]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Fill in the Blanks</h2>
                    <p className="text-slate-500 text-sm">Drag the correct words to complete the sentences.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                    <span>⏱️</span>
                    <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</span>
                </div>
            </div>

            {/* Scrollable Questions List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 md:space-y-8 custom-scrollbar pb-20">
                {questions.map((q, qIdx) => {
                    const isCompleted = completedIds.includes(q.id);
                    const parts = q.sentence.split('___');

                    return (
                        <div key={q.id} className={`p-6 rounded-2xl border-2 transition-all duration-500 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>

                            {/* Sentence Line */}
                            <div className="flex flex-wrap items-center gap-3 text-lg md:text-2xl font-bold text-slate-700 mb-6">
                                <span className="bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm text-slate-500">{qIdx + 1}</span>
                                <span>{parts[0]}</span>

                                {isCompleted ? (
                                    <span className="text-green-600 border-b-4 border-green-400 px-2 animate-bounce flex items-center gap-2">
                                        {q.answer} <CheckCircle className="w-5 h-5" />
                                    </span>
                                ) : (
                                    <div
                                        id={`target-blank-${q.id}`}
                                        className="w-32 h-10 md:w-40 md:h-12 bg-white rounded-lg border-2 border-dashed border-slate-400 shadow-inner"
                                    />
                                )}

                                <span>{parts[1]}</span>
                            </div>

                            {/* Options */}
                            {!isCompleted && (
                                <div className="flex flex-wrap gap-4 pl-11">
                                    {q.options.map((opt, idx) => (
                                        <motion.div
                                            key={`${q.id}-${idx}`}
                                            drag
                                            dragSnapToOrigin={true}
                                            whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
                                            onDragEnd={(e, info) => handleDragEnd(e, info, opt, q)}
                                            className="cursor-grab bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:shadow-md hover:border-primary-300 hover:text-primary-600 transition-all select-none"
                                        >
                                            {opt}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
