'use client';

import Navigation from '@/components/Navigation';
import { Flame, Clock, Trophy, Calendar } from 'lucide-react';

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 pb-28 pt-6 px-4 max-w-md mx-auto relative">
      <header className="mb-6">
        <h1 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
          DW / FITNESS
        </h1>
        <p className="text-xl font-extrabold tracking-tight">Your Progress</p>
      </header>

      {/* Overview Metric Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <span className="text-xl font-black text-white block">12</span>
          <span className="text-[10px] text-zinc-400 font-medium uppercase">Sessions</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-xl font-black text-white block">384</span>
          <span className="text-[10px] text-zinc-400 font-medium uppercase">Minutes</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <span className="text-xl font-black text-white block">100%</span>
          <span className="text-[10px] text-zinc-400 font-medium uppercase">Target</span>
        </div>
      </div>

      {/* History Feed */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
          Completed Sessions
        </h3>
        <div className="space-y-2.5">
          {[
            { title: 'Kickboxing Foundations - W1 D3', date: 'Yesterday', time: '32 min' },
            { title: 'Kickboxing Foundations - W1 D2', date: '3 days ago', time: '30 min' },
            { title: 'Kickboxing Foundations - W1 D1', date: '5 days ago', time: '35 min' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex justify-between items-center"
            >
              <div>
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-emerald-400" /> {item.date}
                </span>
              </div>
              <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Navigation />
    </main>
  );
}