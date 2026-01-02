import React from 'react';
import { Calendar, Footprints, Bike, Dumbbell, Scale, TrendingUp, Download, Snowflake, Flower } from 'lucide-react';

const Navigation = ({ activeSheet, setActiveSheet, activeWeek, maxWeeks, handleExportToCSV }) => {
  return (
    <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
      <button
        onClick={() => setActiveSheet('schedule')}
        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
          activeSheet === 'schedule'
            ? 'bg-orange-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <Calendar className="inline mr-1 sm:mr-2" size={18} />
        Schedule
      </button>
      <button
        onClick={() => setActiveSheet('running')}
        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
          activeSheet === 'running'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <Footprints className="inline mr-1 sm:mr-2" size={18} />
        Running
      </button>
      <button
        onClick={() => setActiveSheet('cycling')}
        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
          activeSheet === 'cycling'
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <Bike className="inline mr-1 sm:mr-2" size={18} />
        Cycling
      </button>
      <button
        onClick={() => setActiveSheet('weights')}
        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
          activeSheet === 'weights'
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <Dumbbell className="inline mr-1 sm:mr-2" size={18} />
        Weights
      </button>
      <button
        onClick={() => setActiveSheet('yoga')}
        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
          activeSheet === 'yoga'
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <Flower className="inline mr-1 sm:mr-2" size={18} />
        Yoga
      </button>
      <button
        onClick={() => setActiveSheet('weightlog')}
        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
          activeSheet === 'weightlog'
            ? 'bg-cyan-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <Scale className="inline mr-1 sm:mr-2" size={18} />
        Weight Log
      </button>
      <button
        onClick={() => setActiveSheet('coldexposure')}
        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
          activeSheet === 'coldexposure'
            ? 'bg-sky-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <Snowflake className="inline mr-1 sm:mr-2" size={18} />
        Cold Exposure
      </button>
      <button
        onClick={() => setActiveSheet('progress')}
        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
          activeSheet === 'progress'
            ? 'bg-amber-600 text-white shadow-lg'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <TrendingUp className="inline mr-1 sm:mr-2" size={18} />
        Progress
      </button>
      {activeSheet !== 'schedule' && activeSheet !== 'progress' && activeSheet !== 'weightlog' && activeSheet !== 'coldexposure' && (
        <button
          onClick={handleExportToCSV}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <Download size={18} />
          <span className="sm:hidden">Export</span>
          <span className="hidden sm:inline">
            {activeSheet === 'coldexposure' ? 'Export All Data' : `Export Week ${activeWeek}`}
          </span>
        </button>
      )}
    </div>
  );
};

export default Navigation;

