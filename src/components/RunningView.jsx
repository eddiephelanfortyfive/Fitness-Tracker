import React from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { decimalToMMSS, mmssToDecimal, formatMMSS, validateMMSS, calculatePaceMinPerKm } from '../utils/timeFormat';
import { convertHRPercentageToBPM } from '../utils/heartRate';

const RunningView = ({ activeWeek, runningData, updateRunning, updateWorkoutStatus, activeLevel, isCollapsed, toggleCollapsed, getWorkoutIdentifier, maxHeartRate }) => {
  const weekData = Array.isArray(runningData) ? runningData.filter(r => r && r.week === activeWeek) : [];
  const intervalRun = weekData.find(r => r && r.type === 'Interval');

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
      <div className="bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Running - Week {activeWeek}</h2>
        {intervalRun && intervalRun.day && (
          <div className="mt-3 bg-orange-900/30 border border-orange-700 rounded-lg p-3">
            <div className="text-sm font-semibold text-orange-300 mb-2">Interval Run - {intervalRun.day}</div>
            <div className="text-xs text-orange-200 space-y-1">
              <div className="font-semibold mb-1">Structure:</div>
              <div className="space-y-0.5 ml-2">
                {intervalRun.intervalStructure && typeof intervalRun.intervalStructure === 'string' ? (
                  intervalRun.intervalStructure.split(' → ').map((segment, idx) => (
                    <div key={idx}>• {convertHRPercentageToBPM(segment, maxHeartRate)}</div>
                  ))
                ) : (
                  <div>No structure defined</div>
                )}
              </div>
              {intervalRun.intervalRounds > 0 && (
                <div className="mt-2">• Rounds: {intervalRun.intervalRounds}x</div>
              )}
              {intervalRun.restTime && (
                <div>• Rest: {convertHRPercentageToBPM(intervalRun.restTime, maxHeartRate)}</div>
              )}
              <div>• Total Distance: {intervalRun.distance}km</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile: Vertical card layout */}
      <div className="block md:hidden p-4 space-y-4">
        {weekData.map((row, index) => {
          const dataIndex = runningData.findIndex(
            item => item.week === row.week && item.run === row.run
          );
          const workoutId = getWorkoutIdentifier('running', { week: row.week, day: row.day, run: row.run });
          const collapsed = isCollapsed(workoutId);
          const shouldShowCollapsed = (row.status === 'completed' || row.status === 'skipped') && collapsed;
          
          return (
            <div key={index} className={`bg-slate-700 rounded-lg overflow-hidden border ${
              row.type === 'Interval' ? 'border-orange-600' : 'border-slate-600'
            }`}>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">{row.day} - Run {row.run}</h3>
                    <p className="text-xs text-slate-400 mt-1">{convertHRPercentageToBPM(row.intensity, maxHeartRate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.type === 'Interval' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {row.type}
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
                      onClick={() => updateWorkoutStatus('running', { week: row.week, day: row.day, run: row.run }, row.status)}
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
              
              {row.type === 'Interval' && (
                <div className="bg-orange-900/30 rounded-lg p-2 border border-orange-700">
                  <div className="text-xs font-semibold text-orange-300 mb-1">Interval Run</div>
                  <div className="text-xs text-orange-200 leading-relaxed space-y-0.5">
                    {row.intervalStructure && typeof row.intervalStructure === 'string' ? (
                      row.intervalStructure.split(' → ').map((segment, idx) => (
                        <div key={idx}>• {convertHRPercentageToBPM(segment, maxHeartRate)}</div>
                      ))
                    ) : (
                      <div>No structure defined</div>
                    )}
                  </div>
                  {row.intervalRounds > 0 && (
                    <div className="text-xs text-orange-300 mt-1">
                      <span className="font-semibold">Rounds:</span> {row.intervalRounds}x
                    </div>
                  )}
                  {row.restTime && (
                    <div className="text-xs text-orange-300">
                      <span className="font-semibold">Rest:</span> {convertHRPercentageToBPM(row.restTime, maxHeartRate)}
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Distance (km)</label>
                <div className="text-base text-slate-300 font-medium">{row.distance} km</div>
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Duration (MM:SS)</label>
                <input
                  type="text"
                  value={row.duration ? (typeof row.duration === 'string' && row.duration.includes(':') ? row.duration : decimalToMMSS(row.duration)) : ''}
                  onChange={(e) => {
                    const formatted = formatMMSS(e.target.value);
                    updateRunning(dataIndex, 'duration', formatted);
                  }}
                  onBlur={(e) => {
                    if (e.target.value && !e.target.value.includes(':')) {
                      const num = parseInt(e.target.value, 10);
                      if (!isNaN(num)) {
                        updateRunning(dataIndex, 'duration', `${num}:00`);
                      }
                    } else if (e.target.value && !validateMMSS(e.target.value)) {
                      const formatted = formatMMSS(e.target.value);
                      if (formatted) {
                        updateRunning(dataIndex, 'duration', formatted);
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 text-base bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25:30"
                  pattern="\d{1,3}:\d{2}"
                />
              </div>
              
              {row.pace && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Pace (min/km)</label>
                  <div className="text-base text-slate-300 font-medium">{row.pace}/km</div>
                </div>
              )}
              
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">RPE (1-5)</label>
                <select
                  value={row.rpe}
                  onChange={(e) => updateRunning(dataIndex, 'rpe', e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Run #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Intensity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Distance (km)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Duration (MM:SS)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Pace (min/km)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">RPE (1-5)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {weekData.map((row, index) => {
              const dataIndex = runningData.findIndex(
                item => item && item.week === row.week && item.run === row.run
              );
              const workoutId = getWorkoutIdentifier('running', { week: row.week, day: row.day, run: row.run });
              const collapsed = isCollapsed(workoutId);
              const shouldShowCollapsed = (row.status === 'completed' || row.status === 'skipped') && collapsed;
              
              if (shouldShowCollapsed) {
                return (
                  <tr key={index} className={`hover:bg-slate-700 transition-colors ${
                    row.type === 'Interval' ? 'bg-orange-900/10' : ''
                  }`}>
                    <td colSpan="9" className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white">{row.day} - Run {row.run}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            row.type === 'Interval' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                          }`}>
                            {row.type}
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
                <tr key={index} className={`hover:bg-slate-700 transition-colors ${
                  row.type === 'Interval' ? 'bg-orange-900/10' : ''
                }`}>
                  <td className="px-4 py-3 text-sm font-medium text-white">{row.day}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.run}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.type === 'Interval' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {row.type}
                    </span>
                    {row.type === 'Interval' && row.intervalRounds > 0 && (
                      <div className="text-xs text-orange-400 mt-1">{row.intervalRounds}x rounds</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {convertHRPercentageToBPM(row.intensity, maxHeartRate)}
                    {row.type === 'Interval' && row.restTime && (
                      <div className="text-xs text-orange-400 mt-1">Rest: {convertHRPercentageToBPM(row.restTime, maxHeartRate)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.distance}</td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.duration ? (typeof row.duration === 'string' && row.duration.includes(':') ? row.duration : decimalToMMSS(row.duration)) : ''}
                      onChange={(e) => {
                        const formatted = formatMMSS(e.target.value);
                        updateRunning(dataIndex, 'duration', formatted);
                      }}
                      onBlur={(e) => {
                        if (e.target.value && !e.target.value.includes(':')) {
                          const num = parseInt(e.target.value, 10);
                          if (!isNaN(num)) {
                            updateRunning(dataIndex, 'duration', `${num}:00`);
                          }
                        } else if (e.target.value && !validateMMSS(e.target.value)) {
                          const formatted = formatMMSS(e.target.value);
                          if (formatted) {
                            updateRunning(dataIndex, 'duration', formatted);
                          }
                        }
                      }}
                      className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25:30"
                      pattern="\d{1,3}:\d{2}"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {row.pace && `${row.pace}/km`}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.rpe}
                      onChange={(e) => updateRunning(dataIndex, 'rpe', e.target.value)}
                      className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
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
                        onClick={() => updateWorkoutStatus('running', { week: row.week, day: row.day, run: row.run }, row.status)}
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
    </div>
  );
};

export default RunningView;

