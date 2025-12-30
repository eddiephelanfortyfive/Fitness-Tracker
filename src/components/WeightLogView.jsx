import React from 'react';

const WeightLogView = ({ 
  activeWeek, 
  setActiveWeek, 
  maxWeeks, 
  weightLogData, 
  targetWeight, 
  setTargetWeight, 
  addWeightEntry, 
  updateWeightEntry, 
  deleteWeightEntry 
}) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
      <div className="bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Body Weight Log</h2>
        {targetWeight && (
          <p className="text-sm text-cyan-400 mt-2">Target Weight: {targetWeight} kg</p>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Add New Entry Form */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Add Weight Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Week</label>
              <select
                value={activeWeek}
                onChange={(e) => setActiveWeek(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {[...Array(maxWeeks)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                id="weightInput"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="e.g., 75.5"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Date (optional)</label>
              <input
                type="date"
                id="dateInput"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const weightInput = document.getElementById('weightInput');
                const dateInput = document.getElementById('dateInput');
                if (weightInput && weightInput.value) {
                  addWeightEntry(activeWeek, weightInput.value, dateInput?.value || '');
                  weightInput.value = '';
                  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
                }
              }}
              className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-all"
            >
              Add Entry
            </button>
          </div>
        </div>

        {/* Target Weight Setting */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Target Weight</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              step="0.1"
              value={targetWeight || ''}
              onChange={(e) => setTargetWeight(e.target.value ? parseFloat(e.target.value) : null)}
              className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Set your target weight (kg)"
            />
            {targetWeight && (
              <button
                onClick={() => setTargetWeight(null)}
                className="px-4 py-2.5 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Weight Entries List */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Weight History</h3>
          {weightLogData.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No weight entries yet. Add your first entry above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Mobile: Card layout */}
              <div className="block md:hidden space-y-3">
                {weightLogData.map((entry) => (
                  <div key={entry.id} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-base font-semibold text-white">Week {entry.week}</div>
                        <div className="text-sm text-slate-400">{new Date(entry.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-xl font-bold text-cyan-400">{entry.weight} kg</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          const newWeight = prompt('Enter new weight (kg):', entry.weight);
                          if (newWeight) updateWeightEntry(entry.id, 'weight', newWeight);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-600 text-white rounded text-sm font-semibold hover:bg-slate-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this weight entry?')) deleteWeightEntry(entry.id);
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Week</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Weight (kg)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-600">
                    {weightLogData.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-600 transition-colors">
                        <td className="px-4 py-3 text-sm text-white font-medium">Week {entry.week}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-cyan-400 font-semibold">{entry.weight} kg</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newWeight = prompt('Enter new weight (kg):', entry.weight);
                                if (newWeight) updateWeightEntry(entry.id, 'weight', newWeight);
                              }}
                              className="px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this weight entry?')) deleteWeightEntry(entry.id);
                              }}
                              className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeightLogView;

