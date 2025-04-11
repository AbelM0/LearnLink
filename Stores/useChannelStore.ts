import { create } from "zustand";


interface Channel {
  id: number;
  name: string;
  createdAt: Date;
}

interface ChannelStore {
  channels: Channel[];
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  setChannels: (channels: Channel[]) => void;
}

export const useChannelStore = create<ChannelStore>((set) => ({
  channels: [],
  selectedChannel: "General",
  setSelectedChannel: (channel: string) => set({ selectedChannel: channel }),
  setChannels:(channels: Channel[]) => set({ channels: channels})
}));
