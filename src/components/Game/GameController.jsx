import React, { useState } from 'react';
import { Star, Zap, Award, Crown, Lock } from 'lucide-react';
import MatchGame from './MatchGame';
import FillInTheBlankGame from './FillInTheBlankGame';
import FindThePairGame from './FindThePairGame';
import LineMatchingGame from './LineMatchingGame';
import PuzzleGame from './PuzzleGame';
import SpellingGame from './SpellingGame';
import TextMemoryGame from './TextMemoryGame';
import GameCompletion from './GameCompletion';
import SentenceBuilderGame from './SentenceBuilderGame';
import bgImage from '../../assets/bg-image.png';
import bgImage2 from '../../assets/english1plaza.jpg';
import { LEVEL_CONFIG } from '../../data/dummyData';

const BACKGROUNDS = [bgImage, bgImage2];

const LEVELS = [
    { id: 'small_stars', name: 'Small Stars', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100', desc: 'Start your journey here!', locked: false },
    { id: 'high_flyers', name: 'High Flyers', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100', desc: 'For faster learners.', locked: false },
    { id: 'trailblazers', name: 'Trailblazers', icon: Award, color: 'text-slate-400', bg: 'bg-slate-100', desc: 'Coming soon...', locked: true },
    { id: 'frontrunner', name: 'Frontrunner', icon: Crown, color: 'text-slate-400', bg: 'bg-slate-100', desc: 'Coming soon...', locked: true },
];

export default function GameController() {
    const [playerName, setPlayerName] = useState(''); // Store player name
    const [currentLevel, setCurrentLevel] = useState(null); // null = selection screen
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [bgIndex, setBgIndex] = useState(0);
    const [activeStages, setActiveStages] = useState([]); // Store the randomized stages for the current session

    // Rotate background every 5 seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLevelSelect = (levelId) => {
        const selectedLevel = LEVELS.find(l => l.id === levelId);
        if (selectedLevel?.locked) return; // Prevent selection if locked

        // Dynamic Stage Generation
        let stages = LEVEL_CONFIG[levelId]?.stages || [];

        if (levelId === 'high_flyers') {
            // Special logic for High Flyers: 1 Random Puzzle + Match Game + Text Memory
            const puzzleIds = [1, 2, 3]; // Bedroom, Restaurant, Playroom
            const shuffled = [...puzzleIds].sort(() => Math.random() - 0.5);
            const selectedPuzzle = shuffled[0];

            stages = [
                { id: 1, type: 'puzzle', sceneId: selectedPuzzle, score: 25, time: 90 },
                { id: 2, type: 'text_memory', pairCount: 8, score: 20, time: 90 }, // Verb Memory (4x4 Grid)
                { id: 3, type: 'sentence_builder', time: 120 } // Sentence Builder
            ];
        }

        setActiveStages(stages);
        setCurrentLevel(levelId);
        setCurrentStageIndex(0);
        setTotalScore(0);
        setIsComplete(false);
    };

    const handleStageComplete = (stageScore) => {
        const newTotal = totalScore + stageScore;
        setTotalScore(newTotal);

        if (currentStageIndex < activeStages.length - 1) {
            // Go to next stage
            // Optional: Show a "Stage Complete" interlude here
            setCurrentStageIndex(prev => prev + 1);
        } else {
            // Level Complete
            setIsComplete(true);
        }
    };

    const handleReset = () => {
        // Keep playerName, just reset game state to Level Selection
        setCurrentLevel(null);
        setCurrentStageIndex(0);
        setTotalScore(0);
        setIsComplete(false);
    };

    const handleFullReset = () => {
        // Reset everything including name
        setPlayerName('');
        handleReset();
    };

    // Get current stage config from dynamic state
    const activeStageConfig = activeStages[currentStageIndex];

    // Common background wrapper
    return (
        <div
            className="h-screen w-screen overflow-hidden p-4 md:p-6 flex flex-col items-center justify-center relative touch-none"
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
                        playerName={playerName}
                        setPlayerName={setPlayerName}
                        levelName={LEVELS.find(l => l.id === currentLevel)?.name || 'Unknown Level'}
                        score={totalScore}
                        onReset={handleReset}
                        onLogout={handleFullReset}
                    />
                ) : currentLevel && activeStageConfig ? (
                    // Render Game based on Type
                    activeStageConfig.type === 'fill_blank' ? (

                        <FillInTheBlankGame
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
                        />
                    ) : activeStageConfig.type === 'find_pair' ? (
                        <FindThePairGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
                        />
                    ) : activeStageConfig.type === 'line_match' ? (
                        <LineMatchingGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
                        />
                    ) : activeStageConfig.type === 'puzzle' ? (
                        <PuzzleGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
                        />
                    ) : activeStageConfig.type === 'spelling' ? (
                        <SpellingGame
                            key={activeStageConfig.id}
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
                        />
                    ) : activeStageConfig.type === 'text_memory' ? (
                        <TextMemoryGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
                        />
                    ) : activeStageConfig.type === 'sentence_builder' ? (
                        <SentenceBuilderGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
                        />
                    ) : activeStageConfig.type === 'match' ? (
                        <MatchGame
                            level={currentLevel}
                            stageConfig={activeStageConfig}
                            onComplete={handleStageComplete}
                            onBack={handleReset}
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
                        <div className="text-center mb-8 md:mb-12 relative">

                            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-2 md:mb-4">
                                Welcome to ENGLISH1 !
                            </h1>
                            <p className="text-base md:text-lg text-slate-600">
                                Choose your level to start playing.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            {LEVELS.map((level) => {
                                const Icon = level.locked ? Lock : level.icon;
                                return (
                                    <button
                                        key={level.id}
                                        onClick={() => handleLevelSelect(level.id)}
                                        disabled={level.locked}
                                        className={`group p-4 flex items-start gap-4 text-left border-2 rounded-2xl transition-all duration-300
                                            ${level.locked
                                                ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                                                : 'border-slate-400 hover:bg-slate-50 hover:border-primary-400 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className={`p-4 rounded-2xl ${level.bg} ${level.color} ${!level.locked && 'group-hover:scale-110'} transition-transform duration-300`}>
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

