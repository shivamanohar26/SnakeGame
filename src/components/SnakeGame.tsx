import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const SPEED_MS = 80; // Faster, more erratic

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const gameState = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    dir: { x: 0, y: -1 } as Point,
    nextDir: { x: 0, y: -1 } as Point,
    food: { x: 15, y: 5 } as Point,
    particles: [] as Particle[],
    lastMoveTime: 0,
    shakeUntil: 0,
  });

  const generateFood = (currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        maxLife: 1.0,
        color: Math.random() > 0.5 ? '#0ff' : '#f0f',
      });
    }
    gameState.current.particles.push(...newParticles);
  };

  const resetGame = useCallback(() => {
    gameState.current = {
      snake: [{ x: 10, y: 10 }],
      dir: { x: 0, y: -1 },
      nextDir: { x: 0, y: -1 },
      food: generateFood([{ x: 10, y: 10 }]),
      particles: [],
      lastMoveTime: performance.now(),
      shakeUntil: 0,
    };
    setScore(0);
    setStatus('playing');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      if (status === 'idle' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        resetGame();
      }

      const state = gameState.current;
      switch (e.key) {
        case 'ArrowUp': if (state.dir.y !== 1) state.nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (state.dir.y !== -1) state.nextDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (state.dir.x !== 1) state.nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (state.dir.x !== -1) state.nextDir = { x: 1, y: 0 }; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, resetGame]);

  const update = useCallback((time: number) => {
    const state = gameState.current;

    // Update particles
    state.particles = state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.08;
      return p.life > 0;
    });

    if (status === 'playing' && time - state.lastMoveTime > SPEED_MS) {
      state.lastMoveTime = time;
      state.dir = state.nextDir;

      const head = state.snake[0];
      const newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setStatus('gameover');
        state.shakeUntil = time + 500; // 500ms screen shake
        return;
      }

      // Self collision
      if (state.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setStatus('gameover');
        state.shakeUntil = time + 500;
        return;
      }

      state.snake.unshift(newHead);

      // Food collision
      if (newHead.x === state.food.x && newHead.y === state.food.y) {
        setScore(s => s + 1);
        spawnParticles(state.food.x, state.food.y, '#f0f');
        state.food = generateFood(state.snake);
      } else {
        state.snake.pop();
      }
    }
  }, [status]);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;

    ctx.save();
    // Glitch shake
    if (time < state.shakeUntil || (status === 'playing' && Math.random() > 0.98)) {
      const dx = (Math.random() - 0.5) * 15;
      const dy = (Math.random() - 0.5) * 15;
      ctx.translate(dx, dy);
      // Chromatic aberration effect during shake
      ctx.globalCompositeOperation = 'screen';
    }

    // Clear background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid
    ctx.strokeStyle = '#ff00ff';
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Draw Food
    ctx.fillStyle = '#f0f';
    // Glitch food occasionally
    if (Math.random() > 0.9) {
       ctx.fillRect(state.food.x * CELL_SIZE - 5, state.food.y * CELL_SIZE + 5, CELL_SIZE, CELL_SIZE);
    }
    ctx.fillRect(state.food.x * CELL_SIZE + 2, state.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    // Draw Snake
    state.snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#fff' : '#0ff';
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    // Draw Particles
    state.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 6, 6);
    });

    // Random scanline artifact
    if (Math.random() > 0.95) {
      ctx.fillStyle = '#0ff';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(0, Math.random() * CANVAS_SIZE, CANVAS_SIZE, Math.random() * 20);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }, [status]);

  const gameLoop = useCallback((time: number) => {
    update(time);
    draw(time);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  useEffect(() => {
    if (status === 'gameover' && score > highScore) {
      setHighScore(score);
    }
  }, [status, score, highScore]);

  return (
    <div className="flex flex-col items-center font-sans w-full">
      {/* HUD */}
      <div className="w-full flex justify-between items-end mb-4 px-2 border-b-4 border-[#0ff] pb-2">
        <div className="flex flex-col">
          <span className="text-[#f0f] text-lg tracking-widest mb-1">DATA_HARVESTED</span>
          <span className="text-[#0ff] text-4xl leading-none font-mono">
            0x{score.toString(16).padStart(4, '0').toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#f0f] text-lg tracking-widest mb-1">MAX_CAPACITY</span>
          <span className="text-[#0ff] text-2xl leading-none font-mono">
            0x{highScore.toString(16).padStart(4, '0').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative overflow-hidden border-4 border-[#0ff] bg-black w-full max-w-[500px] aspect-square tear">
        {/* Glitch artifacts */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-[#f0f] z-20"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#0ff] z-20"></div>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block w-full h-full object-contain"
        />

        {/* Overlays */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <p className="text-[#0ff] animate-pulse tracking-widest text-2xl text-center glitch" data-text="AWAITING_INPUT">
              AWAITING_INPUT<br/>
              <span className="text-sm text-[#f0f]">PRESS_ARROW_KEYS</span>
            </p>
          </div>
        )}

        {status === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
            <h2 className="text-[#f0f] text-5xl font-mono mb-4 glitch" data-text="FATAL_ERR">
              FATAL_ERR
            </h2>
            <p className="text-[#0ff] text-xl mb-8 tracking-widest">CORRUPTION_DETECTED</p>
            <button
              onClick={resetGame}
              className="bg-black border-4 border-[#0ff] text-[#0ff] hover:bg-[#0ff] hover:text-black px-8 py-4 font-sans text-xl transition-none cursor-pointer uppercase tracking-wider"
            >
              REBOOT_SEQ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
