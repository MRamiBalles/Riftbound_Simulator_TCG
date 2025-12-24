'use client';

import { Card as CardType } from '@/lib/database.types';
import { Card } from './Card';

interface CardGridProps {
    cards: CardType[];
}

export function CardGrid({ cards }: CardGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {cards.map((card) => (
                <div key={card.id} className="flex justify-center">
                    <Card card={card} />
                </div>
            ))}
        </div>
    );
}
