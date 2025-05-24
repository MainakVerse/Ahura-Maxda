// context/SoundContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type SoundContextType = {
  isPlaying: boolean;
  toggleSound: () => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {throw new Error("useSound must be used within a SoundProvider");}
  return context;
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => new Audio("/music.mp3")); // Add your music file in /public

  useEffect(() => {
    audio.loop = true;
    return () => {
      audio.pause();
    };
  }, [audio]);

  const toggleSound = () => {
    setIsPlaying((prev) => {
      if (prev) {
        audio.pause();
      } else {
        audio.play();
      }
      return !prev;
    });
  };

  return (
    <SoundContext.Provider value={{ isPlaying, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};
