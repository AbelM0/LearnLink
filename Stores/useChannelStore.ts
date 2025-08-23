import { create } from "zustand";

interface Channel {
  id: number;
  name: string;
  createdAt: Date;
}

interface ChannelStore {
  channels: Channel[];
  selectedChannel: Channel | null;
  setSelectedChannel: (channel: Channel | null) => void;
  setChannels: (channels: Channel[]) => void;
}

export const useChannelStore = create<ChannelStore>((set, get) => ({
  channels: [],
  selectedChannel: null, // Initially no channel selected
  setSelectedChannel: (channel: Channel | null) =>
    set({ selectedChannel: channel }),

  setChannels: (channels: Channel[]) => {
    // Set the channels and reset selectedChannel to the first channel object
    const firstChannel = channels.length > 0 ? channels[0] : null;
    set({ channels, selectedChannel: firstChannel });
  },

}));
