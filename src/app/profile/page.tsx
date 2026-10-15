'use client';

import Navigation from '@/components/Navigation';
import { User, ShieldCheck, Check, Globe } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const [equipment, setEquipment] = useState(['Gloves', 'Wraps', 'Jump Rope']);

  const availableEquip = ['Gloves', 'Wraps', 'Jump Rope', 'Dumbbells', 'Kettlebell', 'Mat'];

  const toggleGear = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((g) => g !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 pb-28 pt-6 px-4 max-w-md mx-auto relative">
      <header className="mb-6">
        <h1 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
          DW / FITNESS
        </h1>
        <p className="text-xl font-extrabold tracking-tight">Member Profile</p>
      </header>

      {/* User Info Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center font-black text-lg">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white">Cleverton</h2>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Member</span>
          </div>
        </div>
      </div>

      {/* Equipment Selector */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-1">
          Available Equipment
        </h3>
        <p className="text-[11px] text-zinc-400 mb-4">
          Select equipment you own to personalize your workout block filters.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {availableEquip.map((item) => {
            const hasGear = equipment.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleGear(item)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                  hasGear
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}
              >
                <span>{item}</span>
                {hasGear && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">
          App Settings
        </h3>
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-3 mb-3">
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" /> Timezone
          </span>
          <span className="font-mono text-zinc-200">WAT (Africa/Lagos)</span>
        </div>
      </section>

      <Navigation />
    </main>
  );
}