import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
    id: string;
    username: string;
    status: 'ONLINE' | 'OFFLINE' | 'IN_GAME' | 'AWAY';
    lastSeen: number;
}

export interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: number;
    type: 'GLOBAL' | 'GUILD' | 'SYSTEM';
}

interface SocialState {
    friends: Friend[];
    messages: ChatMessage[];

    // Actions
    addFriend: (username: string) => void;
    removeFriend: (id: string) => void;
    updateStatus: (id: string, status: Friend['status']) => void;
    sendMessage: (content: string, type: ChatMessage['type'], sender: string) => void;
}

/**
 * Rift Link Social Store (Phase 19)
 */
export const useSocialStore = create<SocialState>()(
    persist(
        (set) => ({
            friends: [
                { id: 'f1', username: 'RiftWalker_99', status: 'IN_GAME', lastSeen: Date.now() },
                { id: 'f2', username: 'ShadowBlade', status: 'ONLINE', lastSeen: Date.now() },
                { id: 'f3', username: 'NexusGuardian', status: 'OFFLINE', lastSeen: Date.now() - 3600000 },
            ],
            messages: [
                { id: 'msg1', sender: 'System AI', content: 'Welcome to the Rift Link Lobby.', timestamp: Date.now(), type: 'SYSTEM' },
            ],

            addFriend: (username) => set(state => ({
                friends: [...state.friends, { id: `friend-${Date.now()}`, username, status: 'ONLINE', lastSeen: Date.now() }]
            })),

            removeFriend: (id) => set(state => ({
                friends: state.friends.filter(f => f.id !== id)
            })),

            updateStatus: (id, status) => set(state => ({
                friends: state.friends.map(f => f.id === id ? { ...f, status, lastSeen: Date.now() } : f)
            })),

            sendMessage: (content, type, sender) => set(state => ({
                messages: [...state.messages, { id: `chat-${Date.now()}`, sender, content, timestamp: Date.now(), type }]
            }))
        }),
        { name: 'riftbound-social-storage' }
    )
);
