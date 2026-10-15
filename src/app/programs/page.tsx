'use client';

import Navigation from '@/components/Navigation';
import { Flame, Dumbbell, Clock, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const programsList = [
  {
    id: '1',
    title: 'Kickboxing Foundations',
    level: 'Beginner / Inter',
    weeks: '4 Weeks',
    equipment: 'Gloves, Wraps, Jump Rope',
    description: 'Learn fundamental striking technique, footwork combinations, and metabolic conditioning.',
    isEnrolled: true,
  },
  {
    id: '2',
    title: 'High-Velocity Conditioning',
    level: 'Intermediate',
    weeks: '6 Weeks',
    equipment: 'Kettlebell, Dumbbells',
    description: 'Explosive bodyweight power blocks and high-intensity interval training.',
    isEnrolled: false,
  },
  {
    id: '3',
    title: 'Core & Mobility Base',
    level: 'All Levels',
    weeks: '3 Weeks',
    equipment: 'Mat, Resistance Bands',
    description: 'Rotational power, core strength stabilization, and active recovery routines.',
    isEnrolled: false,
  },
];

export default function ProgramsPage() {
  const [enrolledId, setEnrolledId] = useState('1');

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 pb-28 pt-6 px-4 max-w-md mx-auto relative">
      <header className="mb-6">
        <h1 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
          DW / FITNESS
        </h1>
        <p className="text-xl font-extrabold tracking-tight">Training Programs</p>
      </header>

      <div className="space-y-4">
        {programsList.map((prog) => {
          const isActive = enrolledId === prog.id;
          return (
            <div
              key={prog.id}
              className={`bg-zinc-900 border rounded-2xl p-5 transition-all relative overflow-hidden ${
                isActive ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10' : 'border-zinc-800'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 right-0 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
                  Active Plan
                </span>
              )}

              <h2 className="text-lg font-extrabold text-white mb-1 pr-16">{prog.title}</h2>
              <p className="text-xs text-zinc-400 mb-4">{prog.description}</p>

              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-zinc-300 mb-4">
                <span className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Flame className="w-3 h-3 text-emerald-400" /> {prog.level}
                </span>
                <span className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> {prog.weeks}
                </span>
                <span className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-emerald-400" /> {prog.equipment}
                </span>
              </div>

              <button
                onClick={() => setEnrolledId(prog.id)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                {isActive ? 'Currently Enrolled' : 'Enroll in Program'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Navigation />
    </main>
  );
}