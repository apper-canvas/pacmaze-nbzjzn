import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import getIcon from './utils/iconUtils';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const MoonIcon = getIcon("Moon");
  const SunIcon = getIcon("Sun");

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-surface-900">
      <header className="py-4 px-4 md:px-6 bg-surface-800/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary grid place-items-center">
              <div className="w-6 h-6 rounded-full bg-surface-900"></div>
            </div>
            <h1 className="text-xl md:text-2xl font-game text-primary text-glow">PacMaze</h1>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-surface-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: darkMode ? 180 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {darkMode ? <SunIcon size={24} /> : <MoonIcon size={24} />}
            </motion.div>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="bg-surface-800 py-4 px-4 md:px-6 mt-auto">
        <div className="container mx-auto text-center text-surface-400 text-sm">
          <p>© {new Date().getFullYear()} PacMaze. All rights reserved.</p>
        </div>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastStyle={{
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
}

export default App;