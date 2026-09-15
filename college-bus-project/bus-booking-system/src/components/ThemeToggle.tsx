"use client";

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('omnibus-theme');
    const light = savedTheme === 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    const stateTimer = window.setTimeout(() => setIsLight(light), 0);
    return () => window.clearTimeout(stateTimer);
  }, []);

  const toggleTheme = () => {
    const nextIsLight = !isLight;
    document.documentElement.dataset.theme = nextIsLight ? 'light' : 'dark';
    window.localStorage.setItem('omnibus-theme', nextIsLight ? 'light' : 'dark');
    setIsLight(nextIsLight);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      className="theme-toggle fixed bottom-5 right-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur transition hover:-translate-y-1"
    >
      {isLight ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
