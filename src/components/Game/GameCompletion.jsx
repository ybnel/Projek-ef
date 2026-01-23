import React from 'react';
import { Trophy, RotateCw } from 'lucide-react';

export default function GameCompletion({ levelName, score, onReset }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center p-4">
            <div className="card max-w-md w-full text-center relative overflow-hidden animate-fade-in-up">
                <div className="absolute top-0 inset-x-0 h-2 bg-primary-500 loading-bar" />

                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <Trophy className="w-12 h-12 text-yellow-500" />
                </div>

                <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">Level Complete!</h2>
                <p className="text-slate-600 mb-8">
                    Great job <strong>{levelName}</strong>! ⭐<br />
                    <span className="text-2xl font-bold text-primary-600">Total Score: {score}</span>
                </p>

                <button
                    onClick={onReset}
                    className="btn-primary w-full flex items-center justify-center gap-2 group"
                >
                    <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    Play Another Level
                </button>
            </div>
        </div>
    );
}
