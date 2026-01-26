import React, { useState } from 'react';
import { User, ArrowRight, Sparkles } from 'lucide-react';

export default function PlayerRegistration({ onRegister }) {
    const [name, setName] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim().length > 0) {
            onRegister(name.trim());
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000); // Shaky styling reset
        }
    };

    return (
        <div className="card max-w-md w-full backdrop-blur-md bg-white/90 shadow-2xl p-8 animate-fade-in-up border border-white/50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-300 rounded-full blur-3xl opacity-30 animate-pulse delay-700"></div>

            <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform hover:scale-105 duration-300">
                    <User className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">
                    Welcome!
                </h2>
                <p className="text-slate-500 mb-8">
                    Enter your name to start the adventure.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className={`w-full px-6 py-4 rounded-xl border-2 outline-none text-lg transition-all duration-300 ${error
                                    ? 'border-red-400 bg-red-50 shake'
                                    : 'border-slate-200 bg-white/50 focus:border-blue-400 focus:bg-white focus:shadow-md'
                                } placeholder:text-slate-400 text-slate-700 font-medium text-center`}
                            autoFocus
                        />
                        <Sparkles className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400 transition-opacity duration-300 ${name.length > 0 ? 'opacity-100' : 'opacity-0'}`} />
                    </div>

                    <button
                        type="submit"
                        disabled={name.length === 0}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 transform ${name.length > 0
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span>Let's Play</span>
                        <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${name.length > 0 ? 'group-hover:translate-x-1' : ''}`} />
                    </button>
                </form>
            </div>
        </div>
    );
}
