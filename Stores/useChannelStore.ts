import { create } from "zustand";

interface ChannelStore {
  selectedChannel: string;
  setChannel: (channel: string) => void;
}

export const useChannelStore = create<ChannelStore>((set) => ({
  selectedChannel: "Announcements",
  setChannel: (channel: string) => set({ selectedChannel: channel }),
}));
