import { create } from 'zustand';

interface Class {
  id: number;
  className: string;
  subject: string;
  description: string;
  imageUrl: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  classCode: string;
}

interface ClassStore {
  classes: Class[];
  setClasses: (classes: Class[]) => void;
  addClass: (newClass: Class) => void;
}

export const useClassStore = create<ClassStore>((set: any) => ({
  classes: [],
  setClasses: (classes: Class[]) => set({ classes }),
  addClass: (newClass: Class) => set((state: any) => ({ classes: [...state.classes, newClass] })),
}));
