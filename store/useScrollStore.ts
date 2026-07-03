import { create } from 'zustand';

interface ScrollState {
  scrollY: number;
  scrollYProgress: number;
  setScroll: (y: number, progress: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  scrollY: 0,
  scrollYProgress: 0,
  setScroll: (y, progress) => set({ scrollY: y, scrollYProgress: progress }),
}));
