import React, { useEffect, useState } from 'react';
import { Trophy, RotateCw, CheckCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function GameCompletion({ levelName, score, onReset, playerName, setPlayerName, onLogout }) {
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
    const [inputName, setInputName] = useState('');
    const [error, setError] = useState(false);

    // Placeholder for Google Sheets URL - USER MUST UPDATE THIS
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdNgysMbGSMePYMvEojr4ds4CdB3C4pcwhvTm4sFG5l1f1fUjCmCOnJCnYpmQTr1sseA/exec';

    useEffect(() => {
        // If playerName is already set (e.g. from previous level), auto-save immediately
        if (playerName && saveStatus === 'idle') {
            saveScore();
        }
    }, [playerName, saveStatus]);

    const saveScore = async () => {
        setSaveStatus('saving');

        try {
            // Prepare data
            const data = {
                name: playerName, // Use the prop, not inputName state
                level: levelName,
                score: score
            };

            // NOTE: Fetch to Google Script can sometimes be blocked by CORS or strict browser settings in development.
            // Using 'no-cors' mode is often required for simple submission forms like this, 
            // but it means we won't get a readable JSON response back.
            // For a robust system, we assume 'no-cors' success if no network error occurs.

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save score:", error);
            setSaveStatus('error');
        }
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (inputName.trim().length > 0) {
            setPlayerName(inputName.trim());
            // The useEffect will catch the prop change and trigger saveScore
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 w-full">
            <div className="card max-w-md w-full text-center relative overflow-hidden animate-fade-in-up bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 loading-bar" />

                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-inner border-4 border-white">
                    <Trophy className="w-12 h-12 text-yellow-500" />
                </div>

                <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">Level Complete!</h2>

                {/* Score Box */}
                <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
                    <span className="text-sm uppercase tracking-wide text-slate-400 font-bold mb-1 block">Total Score</span>
                    <span className="text-4xl font-black text-slate-800">{score}</span>
                </div>

                {!playerName ? (
                    /* Name Input Section */
                    <div className="mb-6 animate-fade-in-up">
                        <p className="text-slate-600 mb-4">
                            Enter your name to save your score!
                        </p>
                        <form onSubmit={handleNameSubmit} className="space-y-3">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={inputName}
                                    onChange={(e) => setInputName(e.target.value)}
                                    placeholder="Your Name"
                                    className={`w-full px-5 py-3 rounded-xl border-2 outline-none transition-all duration-300 ${error
                                        ? 'border-red-400 bg-red-50 shake'
                                        : 'border-slate-200 bg-slate-50 focus:border-primary-400 focus:bg-white'
                                        } placeholder:text-slate-400 text-slate-700 font-medium text-center`}
                                    autoFocus
                                />
                                <Sparkles className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 transition-opacity duration-300 ${inputName.length > 0 ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                            <button
                                type="submit"
                                disabled={inputName.length === 0}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${inputName.length > 0
                                    ? 'btn-primary'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <span>Save Score</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Success / Status Section */
                    <div className="mb-8 animate-fade-in-up">
                        <p className="text-slate-600 mb-4">
                            Playing as <strong className="text-primary-600">{playerName}</strong>
                        </p>

                        <div className="flex justify-center">
                            {saveStatus === 'saving' && (
                                <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-100 px-3 py-1 rounded-full">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </div>
                            )}
                            {saveStatus === 'saved' && (
                                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <CheckCircle className="w-4 h-4" /> Saved!
                                </div>
                            )}
                            {saveStatus === 'error' && (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-red-500 text-sm">Saving failed (Connection error?)</span>
                                    <button onClick={saveScore} className="text-xs text-primary-500 hover:underline">Try Again</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center justify-center gap-2 text-sm py-3 ${playerName ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                        disabled={!playerName}
                    >
                        <RotateCw className="w-4 h-4" />
                        Next Level
                    </button>
                </div>
            </div>
        </div>
    );
}
