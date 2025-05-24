"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const toggleSound = () => {
    if (!audio) {
      const newAudio = new Audio("/music.mp3");
      newAudio.loop = true;
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <SoundContext.Provider value={{ isPlaying, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};
