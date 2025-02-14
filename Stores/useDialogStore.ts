import { create } from "zustand";

type DialogStore = {
  openDialogs: Record<string, boolean>; // Tracks multiple dialogs
  openDialog: (dialogName: string) => void;
  closeDialog: (dialogName: string) => void;
};

export const useDialogStore = create<DialogStore>((set) => ({
  openDialogs: {},
  openDialog: (dialogName) =>
    set((state) => ({
      openDialogs: { ...state.openDialogs, [dialogName]: true },
    })),
  closeDialog: (dialogName) =>
    set((state) => ({
      openDialogs: { ...state.openDialogs, [dialogName]: false },
    })),
}));
