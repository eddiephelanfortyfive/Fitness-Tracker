import React from 'react';
import { Check, X } from 'lucide-react';

const CyclingView = ({ activeWeek, cyclingData, updateCycling, updateWorkoutStatus, activeLevel }) => {
  const weekData = cyclingData.filter(r => r.week === activeWeek);
  const cyclingDay = activeLevel === 1 ? 'Friday' : 'Thursday';
  const weekCycling = cyclingData.find(c => c.week === activeWeek);
  const currentStatus = weekCycling?.status || 'not_done';
  const isInterval = weekData.some(c => c.segment && c.segment.includes('Hard'));

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
      <div className="bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Cycling - Week {activeWeek}</h2>
          <button
            onClick={() => updateWorkoutStatus('cycling', { week: activeWeek, day: cyclingDay }, currentStatus)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              currentStatus === 'completed' 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : currentStatus === 'skipped'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            {currentStatus === 'completed' ? (
              <> <Check size={18} /> Completed </>
            ) : currentStatus === 'skipped' ? (
              <> <X size={18} /> Skipped </>
            ) : (
              <> ○ Not Done </>
            )}
          </button>
        </div>
        {isInterval && (
          <div className="mt-3 bg-orange-900/30 border border-orange-700 rounded-lg p-3">
            <div className="text-sm font-semibold text-orange-300 mb-2">Interval Session</div>
            <div className="text-xs text-orange-200 space-y-1">
              {(() => {
                const hardSegments = weekData.filter(c => c.segment && c.segment.includes('Hard'));
                const easySegments = weekData.filter(c => c.segment && c.segment.includes('Easy'));
                return (
                  <>
                    <div>• {hardSegments.length}x Hard intervals ({hardSegments[0]?.duration || 4} min each)</div>
                    <div>• {easySegments.length}x Rest periods ({easySegments[0]?.duration || 2} min each)</div>
                    <div>• Total: ~40 minutes</div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile: Vertical card layout */}
      <div className="block md:hidden p-4 space-y-4">
        {weekData.map((row, index) => {
          const dataIndex = cyclingData.findIndex(
            item => item.week === row.week && item.segment === row.segment
          );
          
          return (
            <div key={index} className={`bg-slate-700 rounded-lg p-4 space-y-3 border ${
              row.segment && row.segment.includes('Hard') ? 'border-orange-600' : 
              row.segment && row.segment.includes('Easy') ? 'border-green-600' : 
              'border-slate-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">{row.day}</h3>
                  <p className="text-sm text-slate-300 mt-1">{row.segment}</p>
                  {row.segment && row.segment.includes('Easy') && (
                    <p className="text-xs text-green-400 mt-1">Rest Period</p>
                  )}
                  {row.segment && row.segment.includes('Hard') && (
                    <p className="text-xs text-orange-400 mt-1">Work Interval</p>
                  )}
                </div>
                <div className="text-sm text-slate-400 font-medium">{row.duration} min</div>
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={row.distance}
                  onChange={(e) => updateCycling(dataIndex, 'distance', e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              {row.pace && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Pace (km/h)</label>
                  <div className="text-base text-slate-300 font-medium">{row.pace} km/h</div>
                </div>
              )}
              
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">RPE (1-5)</label>
                <select
                  value={row.rpe}
                  onChange={(e) => updateCycling(dataIndex, 'rpe', e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          );
        })}
      </div>
      
      {/* Desktop: Table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Day</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Segment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Duration (min)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Distance (km)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Pace (km/h)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">RPE (1-5)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {weekData.map((row, index) => {
              const dataIndex = cyclingData.findIndex(
                item => item.week === row.week && item.segment === row.segment
              );
              
              return (
                <tr key={index} className={`hover:bg-slate-700 transition-colors ${
                  row.segment && row.segment.includes('Easy') ? 'bg-green-900/20' : 
                  row.segment && row.segment.includes('Hard') ? 'bg-orange-900/20' : ''
                }`}>
                  <td className="px-4 py-3 text-sm font-medium text-white">{row.day}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {row.segment}
                    {row.segment && row.segment.includes('Easy') && (
                      <span className="ml-2 text-xs text-green-400">(Rest)</span>
                    )}
                    {row.segment && row.segment.includes('Hard') && (
                      <span className="ml-2 text-xs text-orange-400">(Work)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.duration}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.1"
                      value={row.distance}
                      onChange={(e) => updateCycling(dataIndex, 'distance', e.target.value)}
                      className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {row.pace && `${row.pace} km/h`}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.rpe}
                      onChange={(e) => updateCycling(dataIndex, 'rpe', e.target.value)}
                      className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">-</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
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

export default CyclingView;

