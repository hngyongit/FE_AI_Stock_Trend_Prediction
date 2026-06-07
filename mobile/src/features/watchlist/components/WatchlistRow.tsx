import { StockListItem } from '@/shared/ui';
import type { WatchlistItem } from '../types';

type WatchlistRowProps = {
    item: WatchlistItem;
    onPress: (symbol: string) => void;
};

export function WatchlistRow({ item, onPress }: WatchlistRowProps) {
    const p = item.latest_price;

    return (
        <StockListItem
            symbol={item.stock.symbol}
            companyName={item.stock.company_name}
            exchangeCode={item.stock.exchange_code}
            price={p?.close_price}
            priceChange={p?.price_change}
            priceChangePercent={p?.price_change_percent}
            volume={p?.volume}
            onPress={() => onPress(item.stock.symbol)}
        />
    );
}
