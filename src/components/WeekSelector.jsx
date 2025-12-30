import React from 'react';

const WeekSelector = ({ activeWeek, setActiveWeek, maxWeeks, activeSheet }) => {
  if (activeSheet === 'schedule' || activeSheet === 'progress') {
    return null;
  }

  return (
    <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
      {[...Array(maxWeeks)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => setActiveWeek(i + 1)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
            activeWeek === i + 1
              ? 'bg-slate-600 text-white shadow-lg'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-650'
          }`}
        >
          W{i + 1}
        </button>
      ))}
    </div>
  );
};

export default WeekSelector;

