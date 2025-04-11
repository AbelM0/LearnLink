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
  getSelectedChannelId: () => number | undefined; // Getter for channelId based on selectedChannel
}

export const useChannelStore = create<ChannelStore>((set, get) => ({
  channels: [],
  selectedChannel: "", // Initially empty
  setSelectedChannel: (channel: string) => set({ selectedChannel: channel }),

  setChannels: (channels: Channel[]) => {
    // Set the channels and reset selectedChannel to the first channel
    const firstChannelName = channels.length > 0 ? channels[0].name : "";
    set({ channels, selectedChannel: firstChannelName });
  },

  getSelectedChannelId: () => {
    const selectedChannel = get().selectedChannel;
    const matchedChannel = get().channels.find(
      (channel) => channel.name === selectedChannel
    );
    return matchedChannel?.id;
  },
}));
