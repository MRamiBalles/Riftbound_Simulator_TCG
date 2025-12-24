export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Champion';

export type CardType = 'Unit' | 'Spell' | 'Land' | 'Equipment' | 'Legend';

export interface Card {
    id: string;
    name: string;
    cost: number;
    type: CardType;
    subtypes: string[]; // e.g., "Yordle", "Mage"
    region: string; // e.g., "Piltover & Zaun", "Demacia"
    rarity: Rarity;
    text: string;
    flavor_text?: string;
    attack?: number;
    health?: number;
    image_url: string;
    set_id: string;
    collector_number: string;
    market_price?: number;
    price_change_24h?: number;
    artist?: string;
}

export interface Set {
    id: string;
    name: string;
    code: string; // e.g., "ORI" for Origins
    release_date: string;
    total_cards: number;
}

export interface UserCollectionItem {
    user_id: string;
    card_id: string;
    quantity_normal: number;
    quantity_foil: number;
    is_wishlist: boolean;
}
