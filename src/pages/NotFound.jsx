import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

const NotFound = () => {
  const GhostIcon = getIcon("Ghost");
  const HomeIcon = getIcon("Home");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4"
    >
      <motion.div
        animate={{ 
          y: [0, -15, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
        }}
        className="text-primary mb-6"
      >
        <GhostIcon size={80} />
      </motion.div>
      
      <h1 className="font-game text-4xl md:text-5xl lg:text-6xl text-primary mb-4">
        404
      </h1>
      
      <h2 className="text-xl md:text-2xl font-bold mb-4">
        Game Over! Page Not Found
      </h2>
      
      <p className="text-surface-300 max-w-md mb-8">
        The maze you're looking for doesn't exist. Perhaps the ghosts have eaten it?
      </p>
      
      <Link 
        to="/"
        className="btn btn-primary inline-flex items-center gap-2"
      >
        <HomeIcon size={20} />
        <span>Return to Main Menu</span>
      </Link>
    </motion.div>
  );
};

export default NotFound;