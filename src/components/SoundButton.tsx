// components/SoundButton.tsx
"use client";

import { useSound } from '@/context/SoundContext';

export default function SoundButton() {
  const { isPlaying, toggleSound } = useSound();

  return (
    <button
      onClick={toggleSound}
      className="fixed left-4 top-4 z-50 bg-white text-black px-4 py-2 rounded-full shadow-lg hover:bg-gray-200 transition-all"
    >
      {isPlaying ? "Stop" : "Play"}
    </button>
  );
}
