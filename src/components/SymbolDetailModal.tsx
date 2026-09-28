import React, { useState, useMemo } from 'react';
import { generateChartSeries } from '../data/marketsData';

export interface SelectedSymbolInfo {
  symbol: string;
  name: string;
  subtitle?: string;
  badgeText: string;
  badgeBg: string;
  badgeTextColor?: string;
  price: string;
  rawPrice: number;
  change?: string;
  changePercent: string;
  isPositive: boolean;
  volume?: string;
  marketCap?: string;
  sector?: string;
  exchange?: string;
  peRatio?: string;
  eps?: string;
  divYield?: string;
  dayRange?: string;
  yearRange?: string;
  technicalRating?: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell';
  description?: string;
}

interface SymbolDetailModalProps {
  symbolInfo: SelectedSymbolInfo | null;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onOpenSuperchart: (symbolInfo: SelectedSymbolInfo) => void;
}

type Timeframe = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y';

export const SymbolDetailModal: React.FC<SymbolDetailModalProps> = ({
  symbolInfo,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onOpenSuperchart,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [alertPrice, setAlertPrice] = useState<string>('');
  const [alertSaved, setAlertSaved] = useState<boolean>(false);

  const series = useMemo(() => {
    if (!symbolInfo) return [];
    return generateChartSeries(
      symbolInfo.symbol,
      symbolInfo.rawPrice,
      symbolInfo.isPositive,
      timeframe
    );
  }, [symbolInfo, timeframe]);

  if (!symbolInfo) return null;

  const prices = series.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceSpan = maxPrice - minPrice || 1;

  const width = 720;
  const height = 240;
  const padY = 20;

  const coords = series.map((pt, idx) => {
    const x = (idx / Math.max(1, series.length - 1)) * width;
    const y =
      height - padY - ((pt.price - minPrice) / priceSpan) * (height - padY * 2);
    return { x, y, ...pt };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${width} ${height} L0 ${height} Z`;

  const activePoint = hoverIdx !== null && coords[hoverIdx] ? coords[hoverIdx] : coords[coords.length - 1];
  const strokeColor = symbolInfo.isPositive ? '#089981' : '#f23645';

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertPrice.trim()) return;
    setAlertSaved(true);
    setTimeout(() => {
      setAlertSaved(false);
      setAlertPrice('');
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-tv-grayBorder rounded-2xl max-w-3xl w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-tv-grayBorder flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span
              className="w-11 h-11 rounded-full font-bold text-sm flex items-center justify-center shrink-0"
              style={{
                backgroundColor: symbolInfo.badgeBg,
                color: symbolInfo.badgeTextColor || '#ffffff',
              }}
            >
              {symbolInfo.badgeText}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-tv-black">{symbolInfo.name}</h2>
                <span className="text-xs font-semibold text-tv-grayText uppercase">
                  {symbolInfo.symbol} {symbolInfo.exchange ? `· ${symbolInfo.exchange}` : ''}
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-extrabold tabular-numbers text-tv-black">
                  {hoverIdx !== null && activePoint
                    ? symbolInfo.price.startsWith('$')
                      ? `$${activePoint.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : activePoint.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                    : symbolInfo.price}
                </span>
                <span
                  className={`text-sm font-bold tabular-numbers ${
                    symbolInfo.isPositive ? 'text-tv-green' : 'text-tv-red'
                  }`}
                >
                  {symbolInfo.change ? `${symbolInfo.change} ` : ''}
                  {symbolInfo.changePercent}
                </span>
                {hoverIdx !== null && activePoint && (
                  <span className="text-xs text-tv-grayText tabular-numbers">
                    at {activePoint.time}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(symbolInfo.symbol)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isWatchlisted
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-tv-grayBorder text-tv-black hover:bg-tv-grayLight'
              }`}
            >
              <svg
                className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-400 text-amber-500' : 'text-tv-grayText'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
            <button
              onClick={() => onOpenSuperchart(symbolInfo)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-tv-blueActive text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Full Superchart</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-lg text-tv-grayText hover:text-tv-black hover:bg-tv-grayLight transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Interactive Chart Area */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-tv-grayLight p-1 rounded-lg">
              {(['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white text-tv-black shadow-xs'
                      : 'text-tv-grayText hover:text-tv-black'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="text-xs text-tv-grayText flex items-center gap-3 tabular-numbers">
              <span>High: <strong className="text-tv-black">{maxPrice.toLocaleString()}</strong></span>
              <span>·</span>
              <span>Low: <strong className="text-tv-black">{minPrice.toLocaleString()}</strong></span>
              {symbolInfo.technicalRating && (
                <>
                  <span>·</span>
                  <span>
                    Technicals:{' '}
                    <strong
                      className={
                        symbolInfo.technicalRating.includes('Buy')
                          ? 'text-tv-green'
                          : symbolInfo.technicalRating === 'Sell'
                          ? 'text-tv-red'
                          : 'text-tv-black'
                      }
                    >
                      {symbolInfo.technicalRating}
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* SVG Interactive Chart */}
          <div
            className="relative w-full h-60 border border-tv-grayBorder rounded-xl bg-white overflow-hidden select-none cursor-crosshair"
            onMouseLeave={() => setHoverIdx(null)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const idx = Math.round(relX * (coords.length - 1));
              setHoverIdx(idx);
            }}
          >
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="modalChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid Lines */}
              {[0.2, 0.5, 0.8].map((ratio, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={height * ratio}
                  x2={width}
                  y2={height * ratio}
                  stroke="#f0f3fa"
                  strokeWidth="1"
                />
              ))}
              <path d={areaPath} fill="url(#modalChartGrad)" />
              <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {hoverIdx !== null && activePoint && (
                <>
                  <line
                    x1={activePoint.x}
                    y1={0}
                    x2={activePoint.x}
                    y2={height}
                    stroke="#787b86"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="5"
                    fill={strokeColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
          </div>

          {/* Key Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-tv-grayBorder">
            <div>
              <span className="text-xs text-tv-grayText block">Volume</span>
              <span className="text-sm font-bold tabular-numbers text-tv-black">
                {symbolInfo.volume || '42.18M'}
              </span>
            </div>
            <div>
              <span className="text-xs text-tv-grayText block">Market Cap / Venue</span>
              <span className="text-sm font-bold tabular-numbers text-tv-black">
                {symbolInfo.marketCap || 'Global Benchmark'}
              </span>
            </div>
            <div>
              <span className="text-xs text-tv-grayText block">Day Range</span>
              <span className="text-sm font-bold tabular-numbers text-tv-black">
                {symbolInfo.dayRange || `${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}`}
              </span>
            </div>
            <div>
              <span className="text-xs text-tv-grayText block">P/E · EPS</span>
              <span className="text-sm font-bold tabular-numbers text-tv-black">
                {symbolInfo.peRatio ? `${symbolInfo.peRatio} · ${symbolInfo.eps || '—'}` : 'Index / Spot'}
              </span>
            </div>
          </div>

          {/* Description & Quick Price Alert */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-tv-grayBorder items-center">
            <div className="md:col-span-2 text-xs text-tv-grayText leading-relaxed">
              {symbolInfo.description ||
                `${symbolInfo.name} (${symbolInfo.symbol}) real-time market quote, intraday order flow, and multi-timeframe technical structure.`}
            </div>
            <form onSubmit={handleCreateAlert} className="flex items-center gap-2">
              <input
                type="text"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder={`Alert @ ${symbolInfo.price}`}
                className="w-full px-3 py-1.5 text-xs bg-tv-grayLight rounded-lg border border-transparent focus:border-tv-blueActive focus:bg-white focus:outline-none tabular-numbers"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-[#131722] text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
              >
                {alertSaved ? 'Alert Set ✓' : 'Set Alert'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
