'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, PlayCircle, BarChart2, User } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Programs', href: '/programs', icon: Dumbbell },
  { name: 'Workout', href: '/workout', icon: PlayCircle },
  { name: 'Progress', href: '/progress', icon: BarChart2 },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/80 px-2 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-500 font-semibold scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1 tracking-wider uppercase font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}