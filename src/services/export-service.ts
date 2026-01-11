import { Card } from '@/lib/database.types';

interface ExportItem extends Card {
    quantity: number;
    totalValue: number;
}

export const generateCSV = (inventory: Record<string, number>, allCards: Card[]) => {
    const rows = [['ID', 'Name', 'Set', 'Rarity', 'Type', 'Region', 'Quantity', 'Market Price', 'Total Value']];

    allCards.forEach(card => {
        const qty = inventory[card.id] || 0;
        if (qty > 0) {
            const totalVal = qty * (card.market_price || 0);
            rows.push([
                card.id,
                `"${card.name}"`, // Quote names to handle commas
                card.set_id,
                card.rarity,
                card.type,
                card.region,
                qty.toString(),
                (card.market_price || 0).toFixed(2),
                totalVal.toFixed(2)
            ]);
        }
    });

    return rows.map(e => e.join(',')).join('\n');
};

export const generateJSON = (inventory: Record<string, number>, allCards: Card[]) => {
    const exportData = {
        exportedAt: new Date().toISOString(),
        collection: [] as any[]
    };

    allCards.forEach(card => {
        const qty = inventory[card.id] || 0;
        if (qty > 0) {
            exportData.collection.push({
                ...card,
                quantity: qty,
                estimatedValue: qty * (card.market_price || 0)
            });
        }
    });

    return JSON.stringify(exportData, null, 2);
};

export const downloadFile = (content: string, filename: string, type: 'csv' | 'json') => {
    const mimeType = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
