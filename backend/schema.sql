-- Riftbound Simulator: Enterprise Cloud Schema (Phase 10)

-- 1. Profiles: Persistent user stats and preferences
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Decks: Multi-device deck persistence
CREATE TABLE decks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    deck_code TEXT NOT NULL, -- Base64 encoded card list
    is_public BOOLEAN DEFAULT true,
    win_count INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Collection Showcase: Global featured cards
CREATE TABLE showcase_slots (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    slot_index INTEGER CHECK (slot_index >= 0 AND slot_index < 9),
    card_id TEXT NOT NULL,
    PRIMARY KEY (user_id, slot_index)
);

-- 4. Global Meta: High-level analytics (View)
CREATE VIEW meta_statistics AS
SELECT 
    name, 
    AVG(win_count::float / NULLIF(play_count, 0)) as win_rate,
    SUM(play_count) as total_plays
FROM decks
GROUP BY name;
