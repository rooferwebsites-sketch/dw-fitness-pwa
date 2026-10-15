'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Play, Pause, SkipForward, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutPage() {
  const [seconds, setSeconds] = useState(45);
  const [isActive, setIsActive] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(1);
  const totalBlocks = 5;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);

  const nextBlock = () => {
    if (currentBlock < totalBlocks) {
      setCurrentBlock((prev) => prev + 1);
      setSeconds(45);
      setIsActive(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 pb-28 pt-6 px-4 max-w-md mx-auto relative">
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
          Block {currentBlock} of {totalBlocks}
        </span>
      </header>

      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-black text-white">Jab-Cross-Hook Combo</h1>
        <p className="text-xs text-zinc-400">High-Velocity Strike Interval</p>
      </div>

      {/* Movement Demo Frame */}
      <div className="w-full h-44 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6 flex flex-col items-center justify-center relative overflow-hidden">
        <p className="text-xs text-zinc-400 font-medium">Movement Form Guide</p>
        <span className="text-[10px] text-zinc-500 mt-1">Video Stream Ready</span>
      </div>

      {/* Interval Timer Card */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 text-center shadow-2xl">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">
          Work Interval
        </span>
        <div className="text-6xl font-black tracking-tight text-orange-500 font-mono my-2">
          00:{seconds < 10 ? `0${seconds}` : seconds}
        </div>

        {/* Timer Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg ${
              isActive
                ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                : 'bg-orange-500 text-zinc-950 hover:bg-orange-400 shadow-orange-500/20'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-amber-400" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-zinc-950" /> Start
              </>
            )}
          </button>

          <button
            onClick={nextBlock}
            className="flex items-center justify-center p-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl border border-zinc-700/50 transition-all"
            title="Next Block"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Exercise Instructions */}
      <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 mb-6">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
          Instructions
        </h3>
        <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
          <li>Keep your hands high in guard position.</li>
          <li>Rotate your hips into the cross strike.</li>
          <li>Exhale sharply on every punch.</li>
        </ul>
      </section>

      {/* Bottom Nav */}
      <Navigation />
    </main>
  );
}