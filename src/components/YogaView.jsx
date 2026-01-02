import React from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { decimalToMMSS, formatMMSS, validateMMSS } from '../utils/timeFormat';

const YogaView = ({ activeWeek, yogaData, runningData, cyclingData, updateYoga, updateWorkoutStatus, activeLevel, isCollapsed, toggleCollapsed, getWorkoutIdentifier, getOrCreateYogaEntry }) => {
  // Get days that have running or cycling for this week
  const getActiveDays = () => {
    const activeDays = new Set();
    
    // Add running days
    if (Array.isArray(runningData)) {
      runningData.filter(r => r && r.week === activeWeek).forEach(run => {
        if (run.day) activeDays.add(run.day);
      });
    }
    
    // Add cycling days
    if (Array.isArray(cyclingData)) {
      cyclingData.filter(c => c && c.week === activeWeek).forEach(cycle => {
        if (cycle.day) activeDays.add(cycle.day);
      });
    }
    
    return activeDays;
  };

  const activeDays = getActiveDays();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Get yoga sessions for rest days (days without running/cycling)
  const weekData = daysOfWeek
    .filter(day => !activeDays.has(day))
    .map(day => {
      const existing = yogaData?.find(y => y.week === activeWeek && y.day === day);
      return existing || { week: activeWeek, day, duration: '', status: 'not_done' };
    });

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
      <div className="bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Yoga - Week {activeWeek}</h2>
        <p className="text-sm text-slate-400 mt-2">Scheduled on rest days (days without running or cycling)</p>
      </div>
      
      {weekData.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-slate-400">No rest days this week - all days have running or cycling workouts scheduled.</p>
        </div>
      ) : (
        <>
          {/* Mobile: Vertical card layout */}
          <div className="block md:hidden p-4 space-y-4">
            {weekData.map((row, index) => {
              const dataIndex = yogaData?.findIndex(
                item => item.week === row.week && item.day === row.day
              ) ?? -1;
              const workoutId = getWorkoutIdentifier('yoga', { week: row.week, day: row.day });
              const collapsed = isCollapsed(workoutId);
              const shouldShowCollapsed = (row.status === 'completed' || row.status === 'skipped') && collapsed;
              
              return (
                <div key={index} className="bg-slate-700 rounded-lg overflow-hidden border border-indigo-600">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-white">{row.day}</h3>
                        <p className="text-xs text-slate-400 mt-1">Yoga Session</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-600 text-white">
                          Yoga
                        </span>
                        {(row.status === 'completed' || row.status === 'skipped') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCollapsed(workoutId);
                            }}
                            className="px-2 py-1 rounded text-slate-300 hover:bg-slate-600 transition-all"
                            title={collapsed ? 'Expand' : 'Collapse'}
                          >
                            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                          </button>
                        )}
                        <button
                          onClick={() => updateWorkoutStatus('yoga', { week: row.week, day: row.day }, row.status)}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                            row.status === 'completed' 
                              ? 'bg-green-600 text-white' 
                              : row.status === 'skipped'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-600 text-slate-300'
                          }`}
                        >
                          {row.status === 'completed' ? <Check size={14} /> : row.status === 'skipped' ? <X size={14} /> : '○'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {shouldShowCollapsed ? (
                    <div className="px-4 pb-4 bg-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            row.status === 'completed' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {row.status === 'completed' ? 'Completed' : 'Skipped'}
                          </span>
                          <span className="text-xs text-slate-400">Click to expand and view details</span>
                        </div>
                        <button
                          onClick={() => toggleCollapsed(workoutId)}
                          className="px-2 py-1 rounded text-xs text-slate-300 hover:bg-slate-600 transition-all flex items-center gap-1"
                        >
                          <span>Expand</span>
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 pt-0 space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Duration (MM:SS)</label>
                        <input
                          type="text"
                          value={row.duration ? (typeof row.duration === 'string' && row.duration.includes(':') ? row.duration : decimalToMMSS(row.duration)) : ''}
                          onChange={(e) => {
                            const formatted = formatMMSS(e.target.value);
                            if (dataIndex >= 0) {
                              updateYoga(dataIndex, 'duration', formatted);
                            } else if (getOrCreateYogaEntry) {
                              // Create new entry if it doesn't exist
                              const entry = getOrCreateYogaEntry(row.week, row.day);
                              const newIndex = yogaData?.findIndex(y => y.week === entry.week && y.day === entry.day) ?? -1;
                              if (newIndex >= 0) {
                                updateYoga(newIndex, 'duration', formatted);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value && !e.target.value.includes(':')) {
                              const num = parseInt(e.target.value, 10);
                              if (!isNaN(num)) {
                                if (dataIndex >= 0) {
                                  updateYoga(dataIndex, 'duration', `${num}:00`);
                                } else if (getOrCreateYogaEntry) {
                                  const entry = getOrCreateYogaEntry(row.week, row.day);
                                  const newIndex = yogaData?.findIndex(y => y.week === entry.week && y.day === entry.day) ?? -1;
                                  if (newIndex >= 0) {
                                    updateYoga(newIndex, 'duration', `${num}:00`);
                                  }
                                }
                              }
                            } else if (e.target.value && !validateMMSS(e.target.value)) {
                              const formatted = formatMMSS(e.target.value);
                              if (formatted) {
                                if (dataIndex >= 0) {
                                  updateYoga(dataIndex, 'duration', formatted);
                                } else if (getOrCreateYogaEntry) {
                                  const entry = getOrCreateYogaEntry(row.week, row.day);
                                  const newIndex = yogaData?.findIndex(y => y.week === entry.week && y.day === entry.day) ?? -1;
                                  if (newIndex >= 0) {
                                    updateYoga(newIndex, 'duration', formatted);
                                  }
                                }
                              }
                            }
                          }}
                          className="w-full px-3 py-2.5 text-base bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="30:00"
                          pattern="\d{1,3}:\d{2}"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Duration (MM:SS)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {weekData.map((row, index) => {
                  const dataIndex = yogaData?.findIndex(
                    item => item && item.week === row.week && item.day === row.day
                  ) ?? -1;
                  const workoutId = getWorkoutIdentifier('yoga', { week: row.week, day: row.day });
                  const collapsed = isCollapsed(workoutId);
                  const shouldShowCollapsed = (row.status === 'completed' || row.status === 'skipped') && collapsed;
                  
                  if (shouldShowCollapsed) {
                    return (
                      <tr key={index} className="hover:bg-slate-700 transition-colors bg-indigo-900/10">
                        <td colSpan="3" className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-white">{row.day}</span>
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-600 text-white">
                                Yoga
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                row.status === 'completed' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                {row.status === 'completed' ? 'Completed' : 'Skipped'}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleCollapsed(workoutId)}
                              className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-600 transition-all flex items-center gap-1"
                            >
                              <span>Expand</span>
                              <ChevronDown size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  
                  return (
                    <tr key={index} className="hover:bg-slate-700 transition-colors bg-indigo-900/10">
                      <td className="px-4 py-3 text-sm font-medium text-white">{row.day}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={row.duration ? (typeof row.duration === 'string' && row.duration.includes(':') ? row.duration : decimalToMMSS(row.duration)) : ''}
                          onChange={(e) => {
                            const formatted = formatMMSS(e.target.value);
                            if (dataIndex >= 0) {
                              updateYoga(dataIndex, 'duration', formatted);
                            } else if (getOrCreateYogaEntry) {
                              const entry = getOrCreateYogaEntry(row.week, row.day);
                              const newIndex = yogaData?.findIndex(y => y.week === entry.week && y.day === entry.day) ?? -1;
                              if (newIndex >= 0) {
                                updateYoga(newIndex, 'duration', formatted);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value && !e.target.value.includes(':')) {
                              const num = parseInt(e.target.value, 10);
                              if (!isNaN(num)) {
                                if (dataIndex >= 0) {
                                  updateYoga(dataIndex, 'duration', `${num}:00`);
                                } else if (getOrCreateYogaEntry) {
                                  const entry = getOrCreateYogaEntry(row.week, row.day);
                                  const newIndex = yogaData?.findIndex(y => y.week === entry.week && y.day === entry.day) ?? -1;
                                  if (newIndex >= 0) {
                                    updateYoga(newIndex, 'duration', `${num}:00`);
                                  }
                                }
                              }
                            } else if (e.target.value && !validateMMSS(e.target.value)) {
                              const formatted = formatMMSS(e.target.value);
                              if (formatted) {
                                if (dataIndex >= 0) {
                                  updateYoga(dataIndex, 'duration', formatted);
                                } else if (getOrCreateYogaEntry) {
                                  const entry = getOrCreateYogaEntry(row.week, row.day);
                                  const newIndex = yogaData?.findIndex(y => y.week === entry.week && y.day === entry.day) ?? -1;
                                  if (newIndex >= 0) {
                                    updateYoga(newIndex, 'duration', formatted);
                                  }
                                }
                              }
                            }
                          }}
                          className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="30:00"
                          pattern="\d{1,3}:\d{2}"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(row.status === 'completed' || row.status === 'skipped') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCollapsed(workoutId);
                              }}
                              className="px-2 py-1.5 rounded text-slate-300 hover:bg-slate-600 transition-all"
                              title={collapsed ? 'Expand' : 'Collapse'}
                            >
                              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </button>
                          )}
                          <button
                            onClick={() => updateWorkoutStatus('yoga', { week: row.week, day: row.day }, row.status)}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                              row.status === 'completed' 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : row.status === 'skipped'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                            }`}
                            title={row.status === 'completed' ? 'Completed' : row.status === 'skipped' ? 'Skipped' : 'Not Done'}
                          >
                            {row.status === 'completed' ? <Check size={16} /> : row.status === 'skipped' ? <X size={16} /> : '○'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default YogaView;
