import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';

const Home = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pacmazeHighScore');
    return saved ? parseInt(saved) : 0;
  });
  
  const ArrowDownIcon = getIcon("ChevronDown");
  const ArrowUpIcon = getIcon("ChevronUp");
  const TrophyIcon = getIcon("Trophy");
  const InfoIcon = getIcon("Info");
  
  useEffect(() => {
    // Welcome toast on first load
    toast.info("Welcome to PacMaze! Use arrow keys to navigate.", {
      icon: "🎮",
      position: "top-center"
    });
  }, []);
  
  const updateHighScore = (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('pacmazeHighScore', newScore.toString());
      toast.success(`New high score: ${newScore}!`, {
        icon: "🏆"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MainFeature updateHighScore={updateHighScore} />
        </div>
        
        <div className="space-y-4">
          <div className="game-card">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-game text-primary mb-2">Leaderboard</h2>
              <TrophyIcon className="text-primary" size={24} />
            </div>
            <div className="p-3 bg-surface-900 rounded-lg">
              <div className="flex justify-between items-center p-2 border-b border-surface-700">
                <span className="font-medium">Your High Score</span>
                <span className="font-game text-primary">{highScore}</span>
              </div>
            </div>
          </div>
          
          <div className="game-card">
            <div className="flex justify-between items-center mb-2" onClick={() => setShowInstructions(!showInstructions)}>
              <h2 className="text-lg md:text-xl font-game text-primary">How to Play</h2>
              <button 
                className="p-1 hover:bg-surface-700 rounded-full transition-colors"
                aria-label={showInstructions ? "Hide instructions" : "Show instructions"}
              >
                {showInstructions ? <ArrowUpIcon size={20} /> : <ArrowDownIcon size={20} />}
              </button>
            </div>
            
            {showInstructions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-3 bg-surface-900 rounded-lg space-y-2"
              >
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Controls:</span> Use arrow keys to navigate the maze.
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Objective:</span> Collect all dots while avoiding ghosts.
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Power-ups:</span> Eat power pellets to temporarily hunt ghosts.
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Lives:</span> You have 3 lives per game.
                </p>
              </motion.div>
            )}
          </div>
          
          <div className="game-card flex items-center gap-3 p-4">
            <InfoIcon size={24} className="text-secondary flex-shrink-0" />
            <p className="text-sm text-surface-300">
              This is a modern recreation of the classic Pac-Man game with customizable difficulty levels.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;