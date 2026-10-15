'use client';

import Navigation from '@/components/Navigation';
import { Play, CheckCircle2, Flame, Calendar, Dumbbell } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 pb-28 pt-6 px-4 max-w-md mx-auto relative">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
            DW / FITNESS
          </h1>
          <p className="text-xl font-extrabold tracking-tight">Today&apos;s Focus</p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-xs font-bold text-zinc-200">3 Day Streak</span>
        </div>
      </header>

      {/* Hero Card: Next Workout */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20">
          Next Up
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Week 1 • Session 1</span>
        </div>

        <h2 className="text-2xl font-black mb-2 tracking-tight text-white">
          Kickboxing Foundations
        </h2>

        <p className="text-xs text-zinc-400 mb-4 line-clamp-2">
          High-intensity strike combinations, shadowboxing technique, and core stabilization intervals.
        </p>

        {/* Equipment Requirements */}
        <div className="flex items-center gap-2 mb-6 text-[11px] text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/50">
          <Dumbbell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Boxing Wraps, Light Dumbbells, Jump Rope</span>
        </div>

        {/* Action Button */}
        <Link
          href="/workout"
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] text-sm"
        >
          <Play className="w-4 h-4 fill-zinc-950" />
          Start Session Now
        </Link>
      </section>

      {/* Weekly Schedule Progress */}
      <section className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-zinc-300">Weekly Progress</h3>
        <div className="grid grid-cols-7 gap-1.5 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
            const isCompleted = idx < 3;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-medium">{day}</span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-950 text-zinc-600 border border-zinc-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-[10px]">{idx + 1}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Navigation */}
      <Navigation />
    </main>
  );
}