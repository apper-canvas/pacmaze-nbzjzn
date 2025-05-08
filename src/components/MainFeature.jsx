import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

const CELL_SIZE = 30;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 15;

// Entity types for the grid
const EMPTY = 0;
const WALL = 1;
const DOT = 2;
const POWER_PELLET = 3;
const PACMAN = 4;
const GHOST = 5;

// Direction constants
const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };

const DEFAULT_MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 3, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 3, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1], 
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], 
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 1, 2, 1, 2, 0, 2, 1, 2, 1, 2, 2, 1],
  [1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1],
  [1, 3, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 3, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const MainFeature = ({ updateHighScore }) => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [playerPosition, setPlayerPosition] = useState({ x: 7, y: 7 });
  const [playerDirection, setPlayerDirection] = useState(RIGHT);
  const [nextDirection, setNextDirection] = useState(null);
  const [ghosts, setGhosts] = useState([
    { id: 1, position: { x: 1, y: 1 }, direction: RIGHT, color: "#FF0000" },
    { id: 2, position: { x: 13, y: 1 }, direction: LEFT, color: "#00FFFF" },
    { id: 3, position: { x: 1, y: 13 }, direction: UP, color: "#FFB8FF" },
    { id: 4, position: { x: 13, y: 13 }, direction: DOWN, color: "#FFB852" }
  ]);
  const [maze, setMaze] = useState(() => DEFAULT_MAZE.map(row => [...row]));
  const [powerMode, setPowerMode] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [countDown, setCountDown] = useState(3);
  const [dotsRemaining, setDotsRemaining] = useState(0);
  
  // Icons
  const PlayIcon = getIcon("Play");
  const PauseIcon = getIcon("Pause");
  const RefreshIcon = getIcon("RefreshCcw");
  const HeartIcon = getIcon("Heart");
  const TrophyIcon = getIcon("Trophy");
  const StarIcon = getIcon("Star");
  
  // Game loop with requestAnimationFrame
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const powerModeTimeRef = useRef(0);
  
  // Calculate the number of dots in the maze
  useEffect(() => {
    let count = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (maze[y][x] === DOT || maze[y][x] === POWER_PELLET) { 
          count++;
        }
      }
    }
    setDotsRemaining(count);
  }, [maze]);
  
  // Initialize the game canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = CELL_SIZE * GRID_WIDTH;
    canvas.height = CELL_SIZE * GRID_HEIGHT;
    
    // Draw the initial state
    drawGame();
    
    // Set up keyboard listeners
    const handleKeyDown = (e) => {
      if (!gameStarted || gamePaused || gameOver) return;
      
      switch (e.key.toLowerCase()) {
        case "ArrowUp":
          setNextDirection(UP);
          break;
        case "ArrowDown":
          setNextDirection(DOWN);
          break;
        case "ArrowLeft":
          setNextDirection(LEFT);
          break;
        case "ArrowRight":
          setNextDirection(RIGHT);
          break;
        case "w":
          setNextDirection(UP);
          break;
        case "s":
          setNextDirection(DOWN);
          break;
        case "a":
          setNextDirection(LEFT);
          break;
        case "d":
          setNextDirection(RIGHT);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gamePaused, gameOver]);
  
  // Start countdown when game starts
  useEffect(() => {
    if (gameStarted && !gamePaused && !gameOver && countDown > 0) {
      const timer = setTimeout(() => {
        setCountDown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gamePaused, gameOver, countDown]);
  
  // Handle power mode timer
  useEffect(() => {
    if (powerMode) {
      const powerModeTimer = setTimeout(() => {
        setPowerMode(false);
        toast.info("Power mode expired!", { icon: "👻" });
      }, 10000); // 10 seconds of power mode
      
      return () => clearTimeout(powerModeTimer);
    }
  }, [powerMode]);
  
  // Game loop
  useEffect(() => {
    if (gameStarted && !gamePaused && !gameOver && countDown === 0) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gamePaused, gameOver, countDown, playerPosition, playerDirection, nextDirection, ghosts, maze, powerMode]);
  
  const gameLoop = useCallback((time) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
    }
    
    const deltaTime = time - lastTimeRef.current;
    const moveInterval = difficultyLevel === 'easy' ? 200 : (difficultyLevel === 'medium' ? 150 : 100);
    
    if (deltaTime > moveInterval) {
      // Update player position
      movePlayer();
      
      // Update ghost positions
      moveGhosts();
      
      // Check collisions
      checkCollisions();
      
      // Check if level is complete
      checkLevelComplete();
      
      // Update the display
      drawGame();
      
      lastTimeRef.current = time;
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [difficultyLevel, playerPosition, playerDirection, nextDirection, ghosts, maze, powerMode, dotsRemaining]);
  
  const movePlayer = useCallback(() => {
    // Try to change direction if a new direction is requested
    if (nextDirection) {
      // Calculate the next position based on the requested direction
      const nextPositionX = playerPosition.x + nextDirection.x;
      const nextPositionY = playerPosition.y + nextDirection.y;
      
      // Ensure next position is within bounds
      const nextX = Math.max(0, Math.min(GRID_WIDTH - 1, nextPositionX));
      const nextY = Math.max(0, Math.min(GRID_HEIGHT - 1, nextPositionY));
      if (nextX >= 0 && nextX < GRID_WIDTH && nextY >= 0 && nextY < GRID_HEIGHT && maze[nextY][nextX] !== WALL) {
        setPlayerDirection(nextDirection);
        setNextDirection(null);
      }
    }
    
    // Move in the current direction
    const nextPositionX = playerPosition.x + playerDirection.x;
    const nextPositionY = playerPosition.y + playerDirection.y;
    
    // Ensure next position is within bounds
    const nextX = Math.max(0, Math.min(GRID_WIDTH - 1, nextPositionX));
    const nextY = Math.max(0, Math.min(GRID_HEIGHT - 1, nextPositionY));
    
    // Check if movement is valid
    if (maze[nextY][nextX] === WALL) {
      // Hit a wall, don't move
    } else {
      if (maze[nextY][nextX] === DOT) { // Collecting a dot
        const newMaze = [...maze];
        newMaze[nextY][nextX] = EMPTY;
        setMaze(newMaze);
        setScore(prevScore => prevScore + 10);
        setDotsRemaining(prev => prev - 1);
      } 
      // Check if the player is collecting a power pellet
      else if (maze[nextY][nextX] === POWER_PELLET) { 
        const newMaze = [...maze];
        newMaze[nextY][nextX] = EMPTY;
        setMaze(newMaze);
        setScore(prevScore => prevScore + 50);
        setPowerMode(true);
        setDotsRemaining(prev => prev - 1);
        toast.success("Power mode activated!", { icon: "💪" });
      }
      
      // Update player position
      setPlayerPosition({ x: nextX, y: nextY });
    }
  }, [playerPosition, playerDirection, nextDirection, maze]);
  
  const moveGhosts = useCallback(() => {
    const newGhosts = [...ghosts];
    
    newGhosts.forEach(ghost => {
      // Define possible directions
      // Add the current direction first to prioritize forward movement
      const directions = [ghost.direction, UP, DOWN, LEFT, RIGHT].filter((dir, index, self) => 
        self.findIndex(d => d.x === dir.x && d.y === dir.y) === index);
      
      // Get current direction
      const currentDirection = ghost.direction;
      
      // Filter out the opposite direction (prevent turning back)
      const oppositeDirection = {
        x: -currentDirection.x,
        y: -currentDirection.y
      };
      
      const possibleDirections = directions.filter(dir => 
        !(dir.x === oppositeDirection.x && dir.y === oppositeDirection.y)
      );
      
      // For power mode, make ghosts more likely to move away from Pac-Man
      const validDirections = [];
      
      for (const dir of possibleDirections) {
        const nextX = ghost.position.x + dir.x;
        const nextY = ghost.position.y + dir.y;
        
        if (nextX >= 0 && nextX < GRID_WIDTH && nextY >= 0 && nextY < GRID_HEIGHT && maze[nextY][nextX] !== WALL) {
          validDirections.push(dir);
        }
      }
      
      // If no valid directions, keep the current direction
      if (validDirections.length === 0) {
        return;
      } else if (validDirections.length === 1) {
        // If there's only one valid direction, take it without additional logic
        ghost.direction = validDirections[0];
        ghost.position = {
          x: ghost.position.x + ghost.direction.x,
          y: ghost.position.y + ghost.direction.y
        };
        return;
      } 
      
      let newDirection;
      
      // In power mode, try to move away from Pac-Man
      if (powerMode) {
        // Calculate distance to player for each direction
        const directionDistances = validDirections.map(dir => {
          const nextX = ghost.position.x + dir.x;
          const nextY = ghost.position.y + dir.y;
          
          // Manhattan distance to player
          const distance = Math.abs(nextX - playerPosition.x) + Math.abs(nextY - playerPosition.y);
          return { dir, distance };
        });
        
        // Sort by distance (descending in power mode to move away)
        directionDistances.sort((a, b) => b.distance - a.distance);
        
        // Add some randomness
        const randomIndex = Math.floor(Math.random() * Math.min(2, directionDistances.length));
        // Use optional chaining to prevent errors with empty arrays
        newDirection = directionDistances[randomIndex]?.dir || validDirections[0];
      }
      // Normal mode: chase player
      else {
        // Calculate distance to player for each direction
        const directionDistances = validDirections.map(dir => {
          const nextX = ghost.position.x + dir.x;
          const nextY = ghost.position.y + dir.y;
          
          // Manhattan distance to player
          const distance = Math.abs(nextX - playerPosition.x) + Math.abs(nextY - playerPosition.y);
          return { dir, distance };
        });
        
        // Sort by distance (ascending in normal mode to chase)
        directionDistances.sort((a, b) => a.distance - b.distance);
        
        // Add some randomness
        const randomFactor = Math.random();
        const randomIndex = randomFactor < 0.7 ? 0 : Math.floor(randomFactor * validDirections.length);
        // Use optional chaining to prevent errors with empty arrays
        newDirection = directionDistances[Math.min(randomIndex, directionDistances.length - 1)]?.dir || validDirections[0];
      }
      
      // Update ghost direction and position
      ghost.direction = newDirection;
      ghost.position = {
        x: ghost.position.x + newDirection.x,
        y: ghost.position.y + newDirection.y
      };
    });
    
    setGhosts(newGhosts);
  }, [ghosts, maze, playerPosition, powerMode]);
  
  const checkCollisions = useCallback(() => {
    // Check collision with ghosts
    const collidedGhost = ghosts.find(ghost => 
      ghost.position.x === playerPosition.x && ghost.position.y === playerPosition.y
    );
    
    if (collidedGhost) {
      if (powerMode) {
        // Player eats the ghost
        setScore(prevScore => prevScore + 200);
        
        // Respawn ghost
        setGhosts(prevGhosts => 
          prevGhosts.map(ghost => 
            ghost.id === collidedGhost.id 
              ? { 
                  ...ghost, 
                  position: { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) } 
                }
              : ghost
          )
        );
        
        toast.success("Ghost eaten! +200 points", { icon: "👻" });
      } else {
        // Ghost eats the player
        setLives(prevLives => prevLives - 1);
        
        if (lives > 1) {
          // Reset positions
          setPlayerPosition({ x: 7, y: 7 });
          setPlayerDirection(RIGHT);
          setNextDirection(null);
          
          // Reset ghosts
          setGhosts([
            { id: 1, position: { x: 1, y: 1 }, direction: RIGHT, color: "#FF0000" },
            { id: 2, position: { x: 13, y: 1 }, direction: LEFT, color: "#00FFFF" },
            { id: 3, position: { x: 1, y: 13 }, direction: UP, color: "#FFB8FF" },
            { id: 4, position: { x: 13, y: 13 }, direction: DOWN, color: "#FFB852" }
          ]);
          
          toast.error("You lost a life!", { icon: "💔" });
          
          // Pause briefly
          setGamePaused(true);
          setTimeout(() => {
            setGamePaused(false);
          }, 1000);
        } else {
          // Game over
          endGame();
          toast.error("Game Over!", { icon: "☠️" });
        }
      }
    }
  }, [ghosts, playerPosition, powerMode, lives]);
  
  const checkLevelComplete = useCallback(() => {
    if (dotsRemaining === 0) {
      // Level complete
      toast.success(`Level ${level} complete!`, { icon: "🎉" });
      
      // Increase level and reset the game
      setLevel(prevLevel => prevLevel + 1);
      
      // Reset positions but keep score
      setPlayerPosition({ x: 7, y: 7 });
      setPlayerDirection(RIGHT);
      setNextDirection(null);
      
      // Reset maze with all dots
      setMaze([...DEFAULT_MAZE.map(row => [...row])]);
      
      // Reset ghosts
      setGhosts([
        { id: 1, position: { x: 1, y: 1 }, direction: RIGHT, color: "#FF0000" },
        { id: 2, position: { x: 13, y: 1 }, direction: LEFT, color: "#00FFFF" },
        { id: 3, position: { x: 1, y: 13 }, direction: UP, color: "#FFB8FF" },
        { id: 4, position: { x: 13, y: 13 }, direction: DOWN, color: "#FFB852" }
      ]);
      
      // Pause briefly
      setGamePaused(true);
      setTimeout(() => {
        setGamePaused(false);
      }, 1500);
    }
  }, [dotsRemaining, level]);
  
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cellType = maze[y][x];
        
        // Draw walls
        if (cellType === WALL) {
          ctx.fillStyle = '#2563EB'; // Blue walls
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        
        // Draw dots
        else if (cellType === DOT) {
          ctx.fillStyle = '#FFCC00'; // Yellow dots
          ctx.beginPath();
          ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 10,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        
        // Draw power pellets
        else if (cellType === POWER_PELLET) {
          ctx.fillStyle = '#FFCC00'; // Yellow power pellets
          ctx.beginPath();
          ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
    
    // Draw player (Pac-Man)
    ctx.fillStyle = '#FFCC00'; // Yellow Pac-Man
    ctx.beginPath();
    
    // Calculate angle based on direction
    let startAngle = 0.2 * Math.PI;
    let endAngle = 1.8 * Math.PI;
    
    if (playerDirection === UP) {
      startAngle = 1.25 * Math.PI;
      endAngle = 3.75 * Math.PI;
    } else if (playerDirection === DOWN) {
      startAngle = 0.25 * Math.PI;
      endAngle = 2.75 * Math.PI;
    } else if (playerDirection === LEFT) {
      startAngle = 0.75 * Math.PI;
      endAngle = 3.25 * Math.PI;
    } else if (playerDirection === RIGHT) {
      startAngle = 0.25 * Math.PI;
      endAngle = 1.75 * Math.PI;
    }
    
    // Animate mouth opening and closing
    const mouthSpeed = 0.05;
    const mouthSize = Math.sin(Date.now() * mouthSpeed) * 0.2 + 0.2;
    
    ctx.arc(
      playerPosition.x * CELL_SIZE + CELL_SIZE / 2,
      playerPosition.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      startAngle + mouthSize,
      endAngle - mouthSize
    );
    ctx.lineTo(
      playerPosition.x * CELL_SIZE + CELL_SIZE / 2,
      playerPosition.y * CELL_SIZE + CELL_SIZE / 2
    );
    ctx.fill();
    
    // Draw ghosts
    ghosts.forEach(ghost => {
      // Ghost body
      const ghostX = ghost.position.x * CELL_SIZE + CELL_SIZE / 2;
      const ghostY = ghost.position.y * CELL_SIZE + CELL_SIZE / 2;
      
      // Set ghost color (blue when in power mode)
      ctx.fillStyle = powerMode ? '#0000FF' : ghost.color;
      
      // Draw ghost body (semi-circle + rectangle)
      ctx.beginPath();
      ctx.arc(
        ghostX,
        ghostY - CELL_SIZE / 6,
        CELL_SIZE / 2 - 2,
        Math.PI,
        0
      );
      
      // Ghost's wavy bottom
      const waveHeight = CELL_SIZE / 10;
      ctx.lineTo(ghostX + CELL_SIZE / 2 - 2, ghostY + CELL_SIZE / 3);
      ctx.lineTo(ghostX + CELL_SIZE / 3, ghostY + CELL_SIZE / 3 - waveHeight);
      ctx.lineTo(ghostX + CELL_SIZE / 6, ghostY + CELL_SIZE / 3);
      ctx.lineTo(ghostX, ghostY + CELL_SIZE / 3 - waveHeight);
      ctx.lineTo(ghostX - CELL_SIZE / 6, ghostY + CELL_SIZE / 3);
      ctx.lineTo(ghostX - CELL_SIZE / 3, ghostY + CELL_SIZE / 3 - waveHeight);
      ctx.lineTo(ghostX - CELL_SIZE / 2 + 2, ghostY + CELL_SIZE / 3);
      ctx.lineTo(ghostX - CELL_SIZE / 2 + 2, ghostY - CELL_SIZE / 6);
      ctx.fill();
      
      // Draw eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(
        ghostX - CELL_SIZE / 6,
        ghostY - CELL_SIZE / 6,
        CELL_SIZE / 8,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(
        ghostX + CELL_SIZE / 6,
        ghostY - CELL_SIZE / 6,
        CELL_SIZE / 8,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw pupils (looking in the direction of movement)
      ctx.fillStyle = '#000000';
      const pupilOffsetX = ghost.direction.x * CELL_SIZE / 24;
      const pupilOffsetY = ghost.direction.y * CELL_SIZE / 24;
      
      ctx.beginPath();
      ctx.arc(
        ghostX - CELL_SIZE / 6 + pupilOffsetX,
        ghostY - CELL_SIZE / 6 + pupilOffsetY,
        CELL_SIZE / 16,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(
        ghostX + CELL_SIZE / 6 + pupilOffsetX,
        ghostY - CELL_SIZE / 6 + pupilOffsetY,
        CELL_SIZE / 16,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Draw countdown if active
    if (countDown > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 48px "Press Start 2P", cursive';
      ctx.fillStyle = '#FFCC00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(countDown.toString(), canvas.width / 2, canvas.height / 2);
    }
    
    // Draw pause screen if paused
    if (gamePaused && !gameOver && countDown === 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 24px "Press Start 2P", cursive';
      ctx.fillStyle = '#FFCC00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
    
    // Draw game over screen if game is over
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 24px "Press Start 2P", cursive';
      ctx.fillStyle = '#FFCC00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
      
      ctx.font = '16px "Press Start 2P", cursive';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
  }, [maze, playerPosition, playerDirection, ghosts, powerMode, countDown, gamePaused, gameOver, score]);
  
  const startGame = () => {
    if (gameOver) {
      // Reset game state
      setMaze([...DEFAULT_MAZE.map(row => [...row])]);
      setPlayerPosition({ x: 7, y: 7 });
      setPlayerDirection(RIGHT);
      setNextDirection(null);
      setGhosts([
        { id: 1, position: { x: 1, y: 1 }, direction: RIGHT, color: "#FF0000" },
        { id: 2, position: { x: 13, y: 1 }, direction: LEFT, color: "#00FFFF" },
        { id: 3, position: { x: 1, y: 13 }, direction: UP, color: "#FFB8FF" },
        { id: 4, position: { x: 13, y: 13 }, direction: DOWN, color: "#FFB852" }
      ]);
      setScore(0);
      setLives(3);
      setLevel(1);
      setPowerMode(false);
      setGameOver(false);
    }
    
    setCountDown(3);
    setGameStarted(true);
    setGamePaused(false);
    toast.info("Game starting!", { icon: "🎮" });
  };
  
  const pauseGame = () => {
    setGamePaused(!gamePaused);
    if (!gamePaused) {
      toast.info("Game paused", { icon: "⏸️" });
    } else {
      toast.info("Game resumed", { icon: "▶️" });
    }
  };
  
  const endGame = () => {
    setGameOver(true);
    
    // Update high score
    if (updateHighScore && typeof updateHighScore === 'function') {
      updateHighScore(score);
    }
  };
  
  const resetGame = () => {
    // Reset game state
    setMaze([...DEFAULT_MAZE.map(row => [...row])]);
    setPlayerPosition({ x: 7, y: 7 });
    setPlayerDirection(RIGHT);
    setNextDirection(null);
    setGhosts([
      { id: 1, position: { x: 1, y: 1 }, direction: RIGHT, color: "#FF0000" },
      { id: 2, position: { x: 13, y: 1 }, direction: LEFT, color: "#00FFFF" },
      { id: 3, position: { x: 1, y: 13 }, direction: UP, color: "#FFB8FF" },
      { id: 4, position: { x: 13, y: 13 }, direction: DOWN, color: "#FFB852" }
    ]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setPowerMode(false);
    setGameStarted(false);
    setGamePaused(false);
    setGameOver(false);
    setCountDown(3);
    
    // Redraw game
    drawGame();
    
    toast.info("Game reset", { icon: "🔄" });
  };
  
  return (
    <div className="game-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-game text-primary">PacMaze</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1 text-white">
            <TrophyIcon className="text-primary" size={18} />
            <span className="font-medium font-game text-sm md:text-base">{score}</span>
          </div>
          <div className="flex items-center gap-1 text-white">
            <HeartIcon className="text-danger" size={18} />
            <span className="font-medium font-game text-sm md:text-base">{lives}</span>
          </div>
          <div className="flex items-center gap-1 text-white">
            <StarIcon className="text-primary" size={18} />
            <span className="font-medium font-game text-sm md:text-base">{level}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
        <div className="w-full md:w-auto flex-grow-0">
          <div className="border-4 border-surface-700 rounded-lg shadow-neu-dark overflow-hidden">
            <canvas 
              ref={canvasRef} 
              className="bg-surface-900 w-full pixelated" 
              style={{ aspectRatio: '1/1' }}
            />
          </div>
          
          <div className="mt-4 flex justify-center space-x-3">
            {!gameStarted ? (
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={startGame}
              >
                <PlayIcon size={18} />
                <span>Start Game</span>
              </button>
            ) : (
              <>
                <button
                  className="btn btn-secondary flex items-center gap-2"
                  onClick={pauseGame}
                  disabled={gameOver || countDown > 0}
                >
                  {gamePaused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
                  <span>{gamePaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  className="btn btn-outline flex items-center gap-2"
                  onClick={resetGame}
                >
                  <RefreshIcon size={18} />
                  <span>Reset</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-64 mt-4 md:mt-0 space-y-4">
          {/* Game settings */}
          <div className="game-card">
            <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
            <div className="flex flex-col space-y-2">
              <button
                className={`py-2 px-3 rounded-lg transition-colors ${difficultyLevel === 'easy' 
                  ? 'bg-primary text-surface-900 font-semibold' 
                  : 'bg-surface-700 hover:bg-surface-600'}`}
                onClick={() => setDifficultyLevel('easy')}
                disabled={gameStarted && !gameOver}
              >
                Easy
              </button>
              <button
                className={`py-2 px-3 rounded-lg transition-colors ${difficultyLevel === 'medium' 
                  ? 'bg-primary text-surface-900 font-semibold' 
                  : 'bg-surface-700 hover:bg-surface-600'}`}
                onClick={() => setDifficultyLevel('medium')}
                disabled={gameStarted && !gameOver}
              >
                Medium
              </button>
              <button
                className={`py-2 px-3 rounded-lg transition-colors ${difficultyLevel === 'hard' 
                  ? 'bg-primary text-surface-900 font-semibold' 
                  : 'bg-surface-700 hover:bg-surface-600'}`}
                onClick={() => setDifficultyLevel('hard')}
                disabled={gameStarted && !gameOver}
              >
                Hard
              </button>
            </div>
          </div>
          
          {/* Game instructions */}
          <div className="game-card">
            <h3 className="text-lg font-semibold mb-2">Controls</h3>
            <div className="text-sm space-y-2 text-surface-300">
              <p>Use arrow keys to navigate the maze</p>
              <p>Use arrow keys or WASD to navigate the maze</p>
              <p>Avoid ghosts or collect power pellets to eat them</p>
            </div>
          </div>
          
          {/* Power mode indicator */}
          {powerMode && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="game-card bg-secondary border border-secondary-light"
            >
              <h3 className="text-lg font-semibold mb-1">Power Mode Active!</h3>
              <p className="text-sm">You can eat ghosts for bonus points!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainFeature;