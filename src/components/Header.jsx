import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';

const Header = ({ 
  activeLevel, 
  setActiveLevel, 
  maxWeeks, 
  activeWeek,
  setActiveWeek,
  effectiveWeek,
  startDate,
  activeSheet,
  onMenuClick,
  handleRefresh
}) => {
  const showWeekSelector = startDate !== null && activeSheet !== 'home';
  const weekToShow = effectiveWeek || activeWeek;

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Burger Menu */}
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Center: App Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg sm:text-xl font-bold text-white">Hybrid Training Tracker</h1>
        </div>

        {/* Right: Level, Week, Today */}
        <div className="flex items-center gap-2">
          {/* Level Selector (Compact) */}
          <div className="flex gap-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveLevel(1)}
              className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                activeLevel === 1
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Level 1"
            >
              L1
            </button>
            <button
              onClick={() => setActiveLevel(2)}
              className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                activeLevel === 2
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Level 2"
            >
              L2
            </button>
          </div>

          {/* Week Selector (Only if start date is set and not on home page) */}
          {showWeekSelector && (
            <select
              value={weekToShow}
              onChange={(e) => setActiveWeek(parseInt(e.target.value))}
              className="px-2 py-1 text-xs sm:text-sm bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              title="Select week"
            >
              {[...Array(maxWeeks)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  W{i + 1}
                </option>
              ))}
            </select>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
            title="Refresh to get latest version"
            aria-label="Refresh app"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

