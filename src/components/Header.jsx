import React from 'react';
import { RefreshCw } from 'lucide-react';

const Header = ({ activeLevel, setActiveLevel, handleRefresh, maxWeeks }) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Hybrid Training Tracker</h1>
          <p className="text-sm sm:text-base text-slate-400">Track your {maxWeeks}-week journey to hybrid fitness</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex-1 sm:flex-none px-4 py-2.5 text-sm sm:text-base rounded-lg font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
            title="Refresh to get latest version"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setActiveLevel(1)}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm sm:text-base rounded-lg font-semibold transition-all ${
              activeLevel === 1
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Level 1
          </button>
          <button
            onClick={() => setActiveLevel(2)}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm sm:text-base rounded-lg font-semibold transition-all ${
              activeLevel === 2
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Level 2
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

