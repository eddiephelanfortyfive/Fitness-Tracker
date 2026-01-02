import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { formatMMSS, validateMMSS } from '../utils/timeFormat';
import { chartOptions } from '../constants/chartOptions';

const ColdExposureView = ({ 
  coldExposureData, 
  addColdExposureEntry, 
  updateColdExposureEntry, 
  deleteColdExposureEntry,
  coldExposureDurationData,
  coldExposureMethodData
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', duration: '', method: 'shower', temperature: '' });

  const methodLabels = {
    shower: 'Shower',
    ice_bath: 'Ice Bath',
    sea_river_swim: 'Sea/River Swim'
  };

  const handleAddEntry = () => {
    const dateInput = document.getElementById('coldExposureDateInput');
    const durationInput = document.getElementById('coldExposureDurationInput');
    const methodInput = document.getElementById('coldExposureMethodInput');
    const temperatureInput = document.getElementById('coldExposureTemperatureInput');
    
    if (dateInput && durationInput && methodInput) {
      const date = dateInput.value || new Date().toISOString().split('T')[0];
      const duration = durationInput.value;
      const method = methodInput.value;
      const temperature = temperatureInput?.value || '';
      
      if (duration && validateMMSS(duration)) {
        addColdExposureEntry(date, duration, method, temperature || null);
        durationInput.value = '';
        if (temperatureInput) temperatureInput.value = '';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      }
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditForm({
      date: entry.date,
      duration: entry.duration || '',
      method: entry.method || 'shower',
      temperature: entry.temperature || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingId && validateMMSS(editForm.duration)) {
      updateColdExposureEntry(editingId, 'date', editForm.date);
      updateColdExposureEntry(editingId, 'duration', editForm.duration);
      updateColdExposureEntry(editingId, 'method', editForm.method);
      updateColdExposureEntry(editingId, 'temperature', editForm.temperature || null);
      setEditingId(null);
      setEditForm({ date: '', duration: '', method: 'shower', temperature: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: '', duration: '', method: 'shower', temperature: '' });
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
      <div className="bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Cold Exposure Tracking</h2>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Add New Entry Form */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Add Cold Exposure Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Date</label>
              <input
                type="date"
                id="coldExposureDateInput"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Duration (MM:SS)</label>
              <input
                type="text"
                id="coldExposureDurationInput"
                onChange={(e) => {
                  const formatted = formatMMSS(e.target.value);
                  e.target.value = formatted;
                }}
                onBlur={(e) => {
                  if (e.target.value && !e.target.value.includes(':')) {
                    const num = parseInt(e.target.value, 10);
                    if (!isNaN(num)) {
                      e.target.value = `${num}:00`;
                    }
                  } else if (e.target.value && !validateMMSS(e.target.value)) {
                    const formatted = formatMMSS(e.target.value);
                    e.target.value = formatted || '';
                  }
                }}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="5:30"
                pattern="\d{1,3}:\d{2}"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Method</label>
              <select
                id="coldExposureMethodInput"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                defaultValue="shower"
              >
                <option value="shower">Shower</option>
                <option value="ice_bath">Ice Bath</option>
                <option value="sea_river_swim">Sea/River Swim</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Temperature (°C) - Optional</label>
              <input
                type="number"
                step="0.1"
                id="coldExposureTemperatureInput"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="e.g., 5.0"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAddEntry}
              className="px-4 py-2.5 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-all"
            >
              Add Entry
            </button>
          </div>
        </div>

        {/* Charts Section */}
        {coldExposureData.length > 0 && (
          <div className="bg-slate-700 rounded-lg p-4 sm:p-6 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-4">Charts</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Duration Trend Chart */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-base font-semibold text-white mb-3">Duration Over Time</h4>
                <div style={{ height: '300px', width: '100%' }}>
                  <Line
                    data={coldExposureDurationData}
                    options={{
                      ...chartOptions,
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: 'Duration (minutes)',
                            color: '#94a3b8'
                          },
                          beginAtZero: true
                        }
                      }
                    }}
                    redraw={false}
                  />
                </div>
              </div>

              {/* Method Distribution Chart */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-base font-semibold text-white mb-3">Method Distribution</h4>
                <div style={{ height: '300px', width: '100%' }}>
                  <Bar
                    data={coldExposureMethodData}
                    options={{
                      ...chartOptions,
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: 'Number of Sessions',
                            color: '#94a3b8'
                          },
                          beginAtZero: true
                        }
                      }
                    }}
                    redraw={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Cold Exposure History</h3>
          {coldExposureData.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No cold exposure entries yet. Add your first entry above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Mobile: Card layout */}
              <div className="block md:hidden space-y-3">
                {coldExposureData.map((entry) => (
                  <div key={entry.id} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                    {editingId === entry.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Date</label>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Duration (MM:SS)</label>
                          <input
                            type="text"
                            value={editForm.duration}
                            onChange={(e) => {
                              const formatted = formatMMSS(e.target.value);
                              setEditForm({ ...editForm, duration: formatted });
                            }}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="5:30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Method</label>
                          <select
                            value={editForm.method}
                            onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="shower">Shower</option>
                            <option value="ice_bath">Ice Bath</option>
                            <option value="sea_river_swim">Sea/River Swim</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Temperature (°C)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editForm.temperature}
                            onChange={(e) => setEditForm({ ...editForm, temperature: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="Optional"
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded text-sm font-semibold hover:bg-cyan-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-3 py-2 bg-slate-600 text-white rounded text-sm font-semibold hover:bg-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-base font-semibold text-white">{methodLabels[entry.method] || entry.method}</div>
                            <div className="text-sm text-slate-400">{new Date(entry.date).toLocaleDateString()}</div>
                          </div>
                          <div className="text-xl font-bold text-cyan-400">{entry.duration || '-'}</div>
                        </div>
                        {entry.temperature && (
                          <div className="text-sm text-slate-300 mb-2">
                            Temperature: {entry.temperature}°C
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="flex-1 px-3 py-2 bg-slate-600 text-white rounded text-sm font-semibold hover:bg-slate-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this cold exposure entry?')) deleteColdExposureEntry(entry.id);
                            }}
                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Temperature</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-600">
                    {coldExposureData.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-600 transition-colors">
                        {editingId === entry.id ? (
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={editForm.method}
                                onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500"
                              >
                                <option value="shower">Shower</option>
                                <option value="ice_bath">Ice Bath</option>
                                <option value="sea_river_swim">Sea/River Swim</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editForm.duration}
                                onChange={(e) => {
                                  const formatted = formatMMSS(e.target.value);
                                  setEditForm({ ...editForm, duration: formatted });
                                }}
                                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500"
                                placeholder="5:30"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.1"
                                value={editForm.temperature}
                                onChange={(e) => setEditForm({ ...editForm, temperature: e.target.value })}
                                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500"
                                placeholder="Optional"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1.5 bg-cyan-600 text-white rounded text-xs font-semibold hover:bg-cyan-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-slate-300">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm text-white font-medium">{methodLabels[entry.method] || entry.method}</td>
                            <td className="px-4 py-3 text-sm text-cyan-400 font-semibold">{entry.duration || '-'}</td>
                            <td className="px-4 py-3 text-sm text-slate-300">{entry.temperature ? `${entry.temperature}°C` : '-'}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-500"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Delete this cold exposure entry?')) deleteColdExposureEntry(entry.id);
                                  }}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
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

export default ColdExposureView;
