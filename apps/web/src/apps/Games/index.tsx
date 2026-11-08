import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDesktopStore } from '../../stores/desktopStore';

type GameTab = '2048' | 'snake' | 'space' | 'web';

// -------------------------------------------------------------
// 2048 Game Engine
// -------------------------------------------------------------
const getEmptyGrid = (): number[][] => [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const addRandomTile = (grid: number[][]): number[][] => {
  const emptyCoords: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) emptyCoords.push([r, c]);
    }
  }
  if (emptyCoords.length === 0) return grid;
  const [randR, randC] = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const newGrid = grid.map((row) => [...row]);
  newGrid[randR][randC] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

const slideRow = (row: number[]): { newRow: number[]; scoreGained: number } => {
  let filtered = row.filter((val) => val !== 0);
  let scoreGained = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      scoreGained += filtered[i];
      filtered[i + 1] = 0;
    }
  }
  filtered = filtered.filter((val) => val !== 0);
  while (filtered.length < 4) {
    filtered.push(0);
  }
  return { newRow: filtered, scoreGained };
};

const rotateGrid = (grid: number[][]): number[][] => {
  const rotated = getEmptyGrid();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      rotated[c][3 - r] = grid[r][c];
    }
  }
  return rotated;
};

export const GamesApp: React.FC = () => {
  const { theme } = useDesktopStore();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<GameTab>('2048');

  // --- 2048 State ---
  const [grid2048, setGrid2048] = useState<number[][]>(() => {
    let g = getEmptyGrid();
    g = addRandomTile(g);
    return addRandomTile(g);
  });
  const [score2048, setScore2048] = useState<number>(0);
  const [best2048, setBest2048] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('ibp_2048_best') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isGameOver2048, setIsGameOver2048] = useState<boolean>(false);
  const [hasWon2048, setHasWon2048] = useState<boolean>(false);

  // --- Snake State ---
  const [snake, setSnake] = useState<[number, number][]>([
    [10, 10],
    [10, 11],
    [10, 12],
  ]);
  const [snakeDir, setSnakeDir] = useState<[number, number]>([-1, 0]); // moving up
  const [snakeFood, setSnakeFood] = useState<[number, number]>([5, 5]);
  const [snakeScore, setSnakeScore] = useState<number>(0);
  const [snakeBest, setSnakeBest] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('ibp_snake_best') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isSnakeRunning, setIsSnakeRunning] = useState<boolean>(false);
  const [isSnakeGameOver, setIsSnakeGameOver] = useState<boolean>(false);
  const [snakeSpeed, setSnakeSpeed] = useState<number>(110);

  // --- Space Shooter State ---
  const [shooterScore, setShooterScore] = useState<number>(0);
  const [shooterHealth, setShooterHealth] = useState<number>(100);
  const [isShooterActive, setIsShooterActive] = useState<boolean>(false);
  const shooterCanvasRef = useRef<HTMLCanvasElement>(null);

  // -------------------------------------------------------------
  // 2048 Moves
  // -------------------------------------------------------------
  const move2048 = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver2048) return;

    let rotations = 0;
    if (direction === 'down') rotations = 1;
    else if (direction === 'right') rotations = 2;
    else if (direction === 'up') rotations = 3;

    let working = grid2048;
    for (let i = 0; i < rotations; i++) {
      working = rotateGrid(working);
    }

    let gainedScore = 0;
    const moved = working.map((row) => {
      const res = slideRow(row);
      gainedScore += res.scoreGained;
      return res.newRow;
    });

    for (let i = 0; i < (4 - rotations) % 4; i++) {
      working = rotateGrid(moved);
    }

    // Check if changed
    const hasChanged = JSON.stringify(working) !== JSON.stringify(grid2048);
    if (hasChanged) {
      const updatedWithRandom = addRandomTile(working);
      setGrid2048(updatedWithRandom);
      const newScore = score2048 + gainedScore;
      setScore2048(newScore);
      if (newScore > best2048) {
        setBest2048(newScore);
        try {
          localStorage.setItem('ibp_2048_best', newScore.toString());
        } catch {}
      }

      // Check win
      if (!hasWon2048 && updatedWithRandom.some((row) => row.some((val) => val === 2048))) {
        setHasWon2048(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      // Check loss
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (updatedWithRandom[r][c] === 0) canMove = true;
          if (r < 3 && updatedWithRandom[r][c] === updatedWithRandom[r + 1][c]) canMove = true;
          if (c < 3 && updatedWithRandom[r][c] === updatedWithRandom[r][c + 1]) canMove = true;
        }
      }
      if (!canMove) {
        setIsGameOver2048(true);
      }
    }
  };

  const restart2048 = () => {
    let g = getEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid2048(g);
    setScore2048(0);
    setIsGameOver2048(false);
    setHasWon2048(false);
  };

  // -------------------------------------------------------------
  // Snake Loop
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isSnakeRunning || isSnakeGameOver || activeTab !== 'snake') return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead: [number, number] = [head[0] + snakeDir[0], head[1] + snakeDir[1]];

        // Wall collisions (wrap-around)
        if (newHead[0] < 0) newHead[0] = 19;
        if (newHead[0] >= 20) newHead[0] = 0;
        if (newHead[1] < 0) newHead[1] = 19;
        if (newHead[1] >= 20) newHead[1] = 0;

        // Self collision
        const hitSelf = prevSnake.some((seg) => seg[0] === newHead[0] && seg[1] === newHead[1]);
        if (hitSelf) {
          setIsSnakeGameOver(true);
          setIsSnakeRunning(false);
          return prevSnake;
        }

        // Eat food
        if (newHead[0] === snakeFood[0] && newHead[1] === snakeFood[1]) {
          const nextScore = snakeScore + 10;
          setSnakeScore(nextScore);
          if (nextScore > snakeBest) {
            setSnakeBest(nextScore);
            try {
              localStorage.setItem('ibp_snake_best', nextScore.toString());
            } catch {}
          }
          // Spawn new food
          setSnakeFood([Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]);
          return [newHead, ...prevSnake];
        }

        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, snakeSpeed);

    return () => clearInterval(interval);
  }, [isSnakeRunning, snakeDir, snakeFood, isSnakeGameOver, snakeScore, snakeBest, snakeSpeed, activeTab]);

  const restartSnake = () => {
    setSnake([
      [10, 10],
      [10, 11],
      [10, 12],
    ]);
    setSnakeDir([-1, 0]);
    setSnakeScore(0);
    setIsSnakeGameOver(false);
    setIsSnakeRunning(true);
    setSnakeFood([Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]);
  };

  // -------------------------------------------------------------
  // Space Blaster Canvas Game
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'space' || !isShooterActive) return;
    const canvas = shooterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let playerX = canvas.width / 2;
    let bullets: { x: number; y: number }[] = [];
    let enemies: { x: number; y: number; speed: number; size: number }[] = [];
    let keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        bullets.push({ x: playerX, y: canvas.height - 30 });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let spawnTimer = 0;
    const loop = () => {
      ctx.fillStyle = '#060A14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 20; i++) {
        const sx = (Math.sin(i * 99 + Date.now() * 0.001) * 0.5 + 0.5) * canvas.width;
        const sy = (Date.now() * 0.08 + i * 40) % canvas.height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Player move
      if (keys['ArrowLeft'] || keys['a']) playerX = Math.max(20, playerX - 5);
      if (keys['ArrowRight'] || keys['d']) playerX = Math.min(canvas.width - 20, playerX + 5);

      // Draw Player Ship
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.moveTo(playerX, canvas.height - 35);
      ctx.lineTo(playerX - 14, canvas.height - 12);
      ctx.lineTo(playerX + 14, canvas.height - 12);
      ctx.closePath();
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#F43F5E';
      bullets = bullets.filter((b) => b.y > 0);
      bullets.forEach((b) => {
        b.y -= 7;
        ctx.fillRect(b.x - 2, b.y, 4, 10);
      });

      // Spawn Enemies
      spawnTimer++;
      if (spawnTimer % 45 === 0) {
        enemies.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -20,
          speed: Math.random() * 2 + 1.5,
          size: Math.random() * 8 + 14,
        });
      }

      // Update & Draw Enemies
      enemies.forEach((en, enIdx) => {
        en.y += en.speed;
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Check bullet hit
        bullets.forEach((b, bIdx) => {
          const dist = Math.hypot(b.x - en.x, b.y - en.y);
          if (dist < en.size) {
            enemies.splice(enIdx, 1);
            bullets.splice(bIdx, 1);
            setShooterScore((s) => s + 50);
          }
        });

        // Check player collision
        if (Math.hypot(playerX - en.x, canvas.height - 20 - en.y) < en.size + 10) {
          enemies.splice(enIdx, 1);
          setShooterHealth((h) => {
            const next = Math.max(0, h - 25);
            if (next === 0) setIsShooterActive(false);
            return next;
          });
        }
      });
      enemies = enemies.filter((en) => en.y < canvas.height + 20);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTab, isShooterActive]);

  // Global Key Handler for 2048 & Snake
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeTab === '2048') {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
          e.preventDefault();
          move2048('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
          e.preventDefault();
          move2048('right');
        } else if (e.key === 'ArrowUp' || e.key === 'w') {
          e.preventDefault();
          move2048('up');
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          e.preventDefault();
          move2048('down');
        }
      } else if (activeTab === 'snake') {
        if (e.key === 'ArrowLeft' && snakeDir[1] !== 1) {
          e.preventDefault();
          setSnakeDir([0, -1]);
        } else if (e.key === 'ArrowRight' && snakeDir[1] !== -1) {
          e.preventDefault();
          setSnakeDir([0, 1]);
        } else if (e.key === 'ArrowUp' && snakeDir[0] !== 1) {
          e.preventDefault();
          setSnakeDir([-1, 0]);
        } else if (e.key === 'ArrowDown' && snakeDir[0] !== -1) {
          e.preventDefault();
          setSnakeDir([1, 0]);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab, grid2048, isGameOver2048, snakeDir]);

  // Tile Color Lookup for 2048
  const getTileClasses = (val: number): string => {
    switch (val) {
      case 2:
        return 'bg-slate-700/80 text-white border border-slate-600/50';
      case 4:
        return 'bg-slate-600/90 text-white border border-slate-500/50';
      case 8:
        return 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold';
      case 16:
        return 'bg-amber-500 text-white shadow-md shadow-amber-500/40 font-bold';
      case 32:
        return 'bg-orange-600 text-white shadow-lg shadow-orange-600/40 font-bold';
      case 64:
        return 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 font-bold';
      case 128:
        return 'bg-yellow-500 text-slate-950 font-black shadow-xl shadow-yellow-500/60 text-lg';
      case 256:
        return 'bg-yellow-400 text-slate-950 font-black shadow-xl shadow-yellow-400/70 text-lg';
      case 512:
        return 'bg-emerald-500 text-white font-black shadow-2xl text-xl';
      case 1024:
        return 'bg-teal-400 text-slate-950 font-black shadow-2xl text-xl';
      case 2048:
        return 'bg-gradient-to-tr from-amber-400 to-rose-500 text-white font-black animate-pulse text-2xl';
      default:
        return 'bg-slate-900/40 text-transparent border border-white/5';
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full select-none overflow-hidden font-sans ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#090E1A] text-slate-100'
      }`}
    >
      {/* Top Header & Game Switcher */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${
          isLight ? 'bg-white border-slate-300' : 'bg-[#0D1424] border-white/10'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30">
            <Gamepad2 size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide leading-tight">Arcade Games</h3>
            <span className="text-[10px] text-slate-400 font-mono">Instant playable games inside IBP OS</span>
          </div>
        </div>

        {/* Game Navigation Pills */}
        <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/10 space-x-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('2048')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === '2048'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2048
          </button>
          <button
            onClick={() => {
              setActiveTab('snake');
              if (!isSnakeRunning && !isSnakeGameOver) restartSnake();
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'snake'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Neon Snake
          </button>
          <button
            onClick={() => {
              setActiveTab('space');
              setIsShooterActive(true);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'space'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Space Blaster
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'web'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Online Hub
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-auto p-4 flex flex-col items-center justify-center">
        {/* ======================================================== */}
        {/* 1. 2048 PUZZLE GAME                                      */}
        {/* ======================================================== */}
        {activeTab === '2048' && (
          <div className="max-w-md w-full space-y-4">
            {/* Score & Controls Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight">2048</h2>
                <span className="text-xs text-slate-400">Join the numbers to get to 2048!</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase">Score</span>
                  <span className="font-bold text-sm text-white">{score2048}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase">Best</span>
                  <span className="font-bold text-sm text-amber-400">{best2048}</span>
                </div>
                <button
                  onClick={restart2048}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow transition"
                  title="New Game"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* 2048 4x4 Grid Board */}
            <div className="relative p-3 rounded-2xl bg-slate-900/90 border border-white/15 shadow-2xl backdrop-blur-xl aspect-square">
              {/* Game Over / Win Overlay */}
              {(isGameOver2048 || hasWon2048) && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl z-20 flex flex-col items-center justify-center space-y-3">
                  <h3 className="text-2xl font-black text-white">
                    {hasWon2048 ? '🎉 You Won 2048!' : 'Game Over'}
                  </h3>
                  <p className="text-xs text-slate-400">Final Score: {score2048}</p>
                  <button
                    onClick={restart2048}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Play Again
                  </button>
                </div>
              )}

              <div className="grid grid-cols-4 grid-rows-4 gap-2.5 h-full w-full">
                {grid2048.map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`rounded-xl flex items-center justify-center font-black transition-all duration-100 select-none ${getTileClasses(
                        val
                      )}`}
                    >
                      {val > 0 ? val : ''}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Directional Pad Controls */}
            <div className="flex flex-col items-center space-y-1.5 pt-1">
              <button
                onClick={() => move2048('up')}
                className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center text-slate-200 active:scale-95 transition"
              >
                <ArrowUp size={16} />
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => move2048('left')}
                  className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center text-slate-200 active:scale-95 transition"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => move2048('down')}
                  className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center text-slate-200 active:scale-95 transition"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => move2048('right')}
                  className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center text-slate-200 active:scale-95 transition"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1">
                Tip: You can also use Keyboard Arrow Keys (↑, ↓, ←, →)
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. NEON SNAKE RETRO GAME                                 */}
        {/* ======================================================== */}
        {activeTab === 'snake' && (
          <div className="max-w-md w-full space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-emerald-400 tracking-tight">Neon Snake</h2>
                <span className="text-xs text-slate-400">Collect glowing orbs and grow</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase">Score</span>
                  <span className="font-bold text-sm text-emerald-400">{snakeScore}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase">Best</span>
                  <span className="font-bold text-sm text-white">{snakeBest}</span>
                </div>
                <button
                  onClick={restartSnake}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
                  title="Restart"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Snake 20x20 Grid */}
            <div className="relative p-2 rounded-2xl bg-black/90 border border-emerald-500/30 shadow-2xl aspect-square">
              {isSnakeGameOver && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center space-y-3">
                  <h3 className="text-2xl font-black text-rose-500">Game Over</h3>
                  <p className="text-xs text-slate-300">Your Score: {snakeScore}</p>
                  <button
                    onClick={restartSnake}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Play Again
                  </button>
                </div>
              )}

              <div className="grid grid-cols-20 grid-rows-20 gap-0.5 h-full w-full">
                {Array.from({ length: 400 }).map((_, idx) => {
                  const r = Math.floor(idx / 20);
                  const c = idx % 20;
                  const isHead = snake[0][0] === r && snake[0][1] === c;
                  const isBody = snake.slice(1).some((seg) => seg[0] === r && seg[1] === c);
                  const isFood = snakeFood[0] === r && snakeFood[1] === c;

                  return (
                    <div
                      key={idx}
                      className={`rounded-sm transition-all duration-75 ${
                        isHead
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
                          : isBody
                          ? 'bg-emerald-600/80'
                          : isFood
                          ? 'bg-rose-500 rounded-full shadow-[0_0_8px_#F43F5E] animate-ping'
                          : 'bg-slate-900/30'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Directional Pad */}
            <div className="flex flex-col items-center space-y-1.5 pt-1">
              <button
                onClick={() => snakeDir[0] !== 1 && setSnakeDir([-1, 0])}
                className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center text-emerald-400 active:scale-95 transition"
              >
                <ArrowUp size={16} />
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => snakeDir[1] !== 1 && setSnakeDir([0, -1])}
                  className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center text-emerald-400 active:scale-95 transition"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => snakeDir[0] !== -1 && setSnakeDir([1, 0])}
                  className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center text-emerald-400 active:scale-95 transition"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => snakeDir[1] !== -1 && setSnakeDir([0, 1])}
                  className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center text-emerald-400 active:scale-95 transition"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. SPACE BLASTER ARCADE SHOOTER                          */}
        {/* ======================================================== */}
        {activeTab === 'space' && (
          <div className="max-w-lg w-full space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-sky-400 tracking-tight">Space Blaster 1984</h2>
                <span className="text-xs text-slate-400">Arrow keys to move, Spacebar to fire</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">SHIELDS</span>
                  <span className={`font-bold ${shooterHealth > 40 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {shooterHealth}%
                  </span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-slate-800 border border-white/10 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">SCORE</span>
                  <span className="font-bold text-sky-400">{shooterScore}</span>
                </div>
                <button
                  onClick={() => {
                    setShooterScore(0);
                    setShooterHealth(100);
                    setIsShooterActive(true);
                  }}
                  className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow"
                  title="Restart"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-sky-500/30 shadow-2xl">
              {!isShooterActive && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
                  <h3 className="text-2xl font-black text-white">Mission Complete</h3>
                  <p className="text-xs text-slate-300">Final Score: {shooterScore}</p>
                  <button
                    onClick={() => {
                      setShooterScore(0);
                      setShooterHealth(100);
                      setIsShooterActive(true);
                    }}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Launch Next Mission
                  </button>
                </div>
              )}

              <canvas
                ref={shooterCanvasRef}
                width={480}
                height={340}
                className="w-full h-auto block bg-[#060A14]"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ONLINE WEB GAMES HUB                                  */}
        {/* ======================================================== */}
        {activeTab === 'web' && (
          <div className="max-w-3xl w-full space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white">Online Arcade & Web Games</h2>
              <p className="text-xs text-slate-400">Play instant web games directly inside IBP OS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Game 1: World of Solitaire */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 transition space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 mb-1">
                    <Trophy size={16} />
                    <h3 className="font-bold text-white text-sm">Classic World of Solitaire</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Play classic Klondike, Spider, and FreeCell solitaire online directly in your browser.
                  </p>
                </div>
                <button
                  onClick={() => window.open('https://worldofsolitaire.com/', '_blank')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                >
                  <span>Launch Solitaire</span>
                  <ExternalLink size={13} />
                </button>
              </div>

              {/* Game 2: Free Online Chess */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-sky-500/40 transition space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-sky-400 mb-1">
                    <Zap size={16} />
                    <h3 className="font-bold text-white text-sm">Lichess Online Chess</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Play free chess against top AI engines or challenge friends with zero ads.
                  </p>
                </div>
                <button
                  onClick={() => window.open('https://lichess.org/', '_blank')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                >
                  <span>Play Free Chess</span>
                  <ExternalLink size={13} />
                </button>
              </div>

              {/* Game 3: Offline Dino T-Rex */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                    <Flame size={16} />
                    <h3 className="font-bold text-white text-sm">T-Rex Runner</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    The classic Chrome dinosaur obstacle runner with cacti jumps and pterodactyl dodges.
                  </p>
                </div>
                <button
                  onClick={() => window.open('https://chromedino.com/', '_blank')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                >
                  <span>Play Dino Runner</span>
                  <ExternalLink size={13} />
                </button>
              </div>

              {/* Game 4: Slither / Agar */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-500/40 transition space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-purple-400 mb-1">
                    <Sparkles size={16} />
                    <h3 className="font-bold text-white text-sm">Slither Multiplayer IO</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Multiplayer real-time snake battle royale with global leaderboards.
                  </p>
                </div>
                <button
                  onClick={() => window.open('https://slither.io/', '_blank')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                >
                  <span>Play Slither.io</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

