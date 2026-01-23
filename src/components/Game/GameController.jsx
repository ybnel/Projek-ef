import React, { useState } from 'react';
import { Star, Zap, Award, Crown } from 'lucide-react';
import MatchGame from './MatchGame';
import FillInTheBlankGame from './FillInTheBlankGame';
import FindThePairGame from './FindThePairGame';
import LineMatchingGame from './LineMatchingGame';
import PuzzleGame from './PuzzleGame';
import GameCompletion from './GameCompletion';
import bgImage from '../../assets/bg-image.png';
import bgImage2 from '../../assets/english1plaza.jpg';
import { LEVEL_CONFIG } from '../../data/dummyData';

const BACKGROUNDS = [bgImage, bgImage2];

const LEVELS = [
    { id: 'small_stars', name: 'Small Stars', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100', desc: 'Start your journey here!' },
    { id: 'high_flyers', name: 'High Flyers', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100', desc: 'For faster learners.' },
    { id: 'trailblazers', name: 'Trailblazers', icon: Award, color: 'text-purple-500', bg: 'bg-purple-100', desc: 'Blaze a new path.' },
    { id: 'frontrunner', name: 'Frontrunner', icon: Crown, color: 'text-red-500', bg: 'bg-red-100', desc: 'Lead the pack!' },
];

export default function GameController() {
    const [currentLevel, setCurrentLevel] = useState(null); // null = selection screen
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [bgIndex, setBgIndex] = useState(0);

    // Rotate background every 5 seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLevelSelect = (levelId) => {
        setCurrentLevel(levelId);
        setCurrentStageIndex(0);
        setTotalScore(0);
        setIsComplete(false);
    };

    const handleStageComplete = (stageScore) => {
        const newTotal = totalScore + stageScore;
        setTotalScore(newTotal);

        const levelConfig = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG['small_stars']; // Fallback
        const stages = levelConfig.stages || [];

        if (currentStageIndex < stages.length - 1) {
            // Go to next stage
            // Optional: Show a "Stage Complete" interlude here
            setCurrentStageIndex(prev => prev + 1);
        } else {
            // Level Complete
            setIsComplete(true);
        }
    };

    const handleReset = () => {
        setCurrentLevel(null);
        setCurrentStageIndex(0);
        setTotalScore(0);
        setIsComplete(false);
    };

    // Get current stage config
    const activeLevelConfig = LEVEL_CONFIG[currentLevel];
    const activeStageConfig = activeLevelConfig?.stages?.[currentStageIndex];

    // Common background wrapper
    return (
        <div
            className="min-h-screen p-4 md:p-6 flex flex-col items-center justify-center relative"
            style={{
                backgroundImage: `url(${BACKGROUNDS[bgIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 1s ease-in-out'
            }}
        >
            {/* Background Overlay with stronger blur */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

            {/* Content Wrapper */}
            <div className="relative z-10 w-full flex items-center justify-center">
                {isComplete ? (
                    <GameCompletion
                        levelName={LEVELS.find(l => l.id === currentLevel)?.name || 'Unknown Level'}
                        score={totalScore}
                        onReset={handleReset}
                    />
                ) : currentLevel && activeStageConfig ? (
                    // Render Game based on Type
                    activeStageConfig.type === 'fill_blank' ? (
                        <FillInTheBlankGame
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                        />
                    ) : activeStageConfig.type === 'find_pair' ? (
                        <FindThePairGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                        />
                    ) : activeStageConfig.type === 'line_match' ? (
                        <LineMatchingGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                        />
                    ) : activeStageConfig.type === 'puzzle' ? (
                        <PuzzleGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                        />
                    ) : (
                        <MatchGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
                        />
                    )
                ) : (
                    // Level Selection
                    <div className="card w-full max-w-5xl backdrop-blur-md bg-white/90 shadow-2xl p-6 md:p-12 animate-fade-in-up">
                        <div className="text-center mb-8 md:mb-12">
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-2 md:mb-4">
                                Welcome to ENGLISH 1
                            </h1>
                            <p className="text-base md:text-lg text-slate-600">
                                Choose your level to start playing.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            {LEVELS.map((level) => {
                                const Icon = level.icon;
                                return (
                                    <button
                                        key={level.id}
                                        onClick={() => handleLevelSelect(level.id)}
                                        className="group p-4 flex items-start gap-4 text-left border-2 border-slate-400 rounded-2xl hover:bg-slate-50 hover:border-primary-400 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className={`p-4 rounded-2xl ${level.bg} ${level.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">{level.name}</h3>
                                            <p className="text-slate-500">{level.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

