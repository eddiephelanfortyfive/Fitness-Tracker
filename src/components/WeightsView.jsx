import React from 'react';
import { Check, X, ChevronDown, ChevronUp, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { getLastWeekWeight } from '../utils/calculations';
import WeightRecommendation from './WeightRecommendation';

const WeightsView = ({ 
  activeWeek, 
  weightData, 
  workoutDays, 
  updateWeight, 
  updateNumSets, 
  updateWorkoutStatus,
  isCollapsed,
  toggleCollapsed,
  getWorkoutIdentifier,
  updateWeightRecommendation
}) => {
  return (
    <div className="space-y-6">
      {workoutDays.map((workout, dayIndex) => {
        const dayExercises = weightData.filter(
          item => item.week === activeWeek && item.day === workout.day
        );
        const workoutStatus = dayExercises[0]?.status || 'not_done';
        const workoutId = getWorkoutIdentifier('weights', { week: activeWeek, day: workout.day, workoutName: workout.name });
        const collapsed = isCollapsed(workoutId);
        const shouldShowCollapsed = (workoutStatus === 'completed' || workoutStatus === 'skipped') && collapsed;
        
        return (
          <div key={dayIndex} className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-white">{workout.day} - {workout.name}</h3>
                <div className="flex items-center gap-2">
                  {(workoutStatus === 'completed' || workoutStatus === 'skipped') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapsed(workoutId);
                      }}
                      className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-all"
                      title={collapsed ? 'Expand' : 'Collapse'}
                    >
                      {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                  )}
                  <button
                    onClick={() => updateWorkoutStatus('weights', { week: activeWeek, day: workout.day, workoutName: workout.name }, workoutStatus)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                      workoutStatus === 'completed' 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : workoutStatus === 'skipped'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    {workoutStatus === 'completed' ? (
                      <> <Check size={16} /> <span className="hidden sm:inline">Completed</span> </>
                    ) : workoutStatus === 'skipped' ? (
                      <> <X size={16} /> <span className="hidden sm:inline">Skipped</span> </>
                    ) : (
                      <> ○ <span className="hidden sm:inline">Not Done</span> </>
                    )}
                  </button>
                </div>
              </div>
            </div>
              {shouldShowCollapsed ? (
              <div className="p-4 bg-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      workoutStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {workoutStatus === 'completed' ? 'Completed' : 'Skipped'}
                    </span>
                    <span className="text-sm text-slate-400">Click to expand and view details</span>
                  </div>
                  <button
                    onClick={() => toggleCollapsed(workoutId)}
                    className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-all flex items-center gap-1"
                  >
                    <span className="text-xs">Expand</span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              {dayExercises.map((exercise, exerciseIndex) => {
                const exerciseDataIndex = weightData.findIndex(
                  item => item.week === exercise.week && 
                          item.day === exercise.day && 
                          item.exercise === exercise.exercise
                );
                
                return (
                  <div key={exerciseIndex} className="bg-slate-700 rounded-lg p-3 sm:p-4 border border-slate-600">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base sm:text-lg font-semibold text-white">{exercise.exercise}</h4>
                          <WeightRecommendation
                            recommendation={exercise.weightRecommendation || null}
                            onChange={updateWeightRecommendation}
                            exerciseIndex={exerciseIndex}
                            exerciseDataIndex={exerciseDataIndex}
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400">Rep Range: {exercise.repRange}</p>
                        {exercise.recommendedSets && (
                          <p className="text-xs text-slate-500 mt-1 italic">
                            Recommended: {exercise.recommendedSets} set{exercise.recommendedSets !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-300 whitespace-nowrap">Sets:</label>
                        <select
                          value={exercise.numSets || 0}
                          onChange={(e) => updateNumSets(exerciseDataIndex, e.target.value)}
                          className="w-full sm:w-auto px-3 py-2.5 text-base bg-slate-600 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="0">Select...</option>
                          {[...Array(5)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {exercise.sets && exercise.sets.length > 0 && (
                      <>
                        {/* Mobile: Vertical card layout */}
                        <div className="block md:hidden space-y-3">
                          {exercise.sets.map((set, setIndex) => {
                            const lastWeekWeight = getLastWeekWeight(activeWeek, workout.day, exercise.exercise, set.set, weightData);
                            // Get previous week's recommendation
                            const lastWeekExercise = activeWeek > 1 ? weightData.find(
                              item => item.week === activeWeek - 1 && 
                                      item.day === workout.day && 
                                      item.exercise === exercise.exercise
                            ) : null;
                            const lastWeekRecommendation = lastWeekExercise?.weightRecommendation || null;
                            
                            return (
                              <div key={setIndex} className="bg-slate-800 rounded-lg p-4 space-y-3 border border-slate-600">
                                <div className="flex items-center justify-between">
                                  <span className="text-base font-semibold text-white">Set {set.set}</span>
                                  {lastWeekWeight !== '-' && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm text-blue-400 font-medium">Last: {lastWeekWeight} kg</span>
                                      {lastWeekRecommendation === 'increase' && (
                                        <ArrowUp size={14} className="text-green-400" title="Increase weight" />
                                      )}
                                      {lastWeekRecommendation === 'drop' && (
                                        <ArrowDown size={14} className="text-red-400" title="Drop weight" />
                                      )}
                                      {lastWeekRecommendation === 'stay' && (
                                        <Minus size={14} className="text-amber-400" title="Stay at same weight" />
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <label className="block text-xs text-slate-400">Weight (kg)</label>
                                    </div>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={set.weight}
                                      onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'weight', e.target.value)}
                                      className="w-full px-3 py-2.5 text-base bg-slate-700 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Reps</label>
                                    <input
                                      type="number"
                                      value={set.reps}
                                      onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'reps', e.target.value)}
                                      className="w-full px-3 py-2.5 text-base bg-slate-700 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1.5">RPE (1-10)</label>
                                  <select
                                    value={set.rpe}
                                    onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'rpe', e.target.value)}
                                    className="w-full px-3 py-2.5 text-base bg-slate-700 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="">-</option>
                                    {[...Array(10)].map((_, i) => (
                                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
                                  <input
                                    type="text"
                                    value={set.notes}
                                    onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'notes', e.target.value)}
                                    className="w-full px-3 py-2.5 text-base bg-slate-700 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Form notes, feeling, etc."
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Desktop: Table layout */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-800">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Set</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Last Week</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Weight (kg)</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Reps</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">RPE (1-10)</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-64">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-600">
                              {exercise.sets.map((set, setIndex) => {
                                const lastWeekWeight = getLastWeekWeight(activeWeek, workout.day, exercise.exercise, set.set, weightData);
                                // Get previous week's recommendation
                                const lastWeekExercise = activeWeek > 1 ? weightData.find(
                                  item => item.week === activeWeek - 1 && 
                                          item.day === workout.day && 
                                          item.exercise === exercise.exercise
                                ) : null;
                                const lastWeekRecommendation = lastWeekExercise?.weightRecommendation || null;
                                
                                return (
                                  <tr key={setIndex} className="hover:bg-slate-600 transition-colors">
                                    <td className="px-4 py-3 text-sm text-white font-medium">{set.set}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-sm text-blue-400 font-medium">
                                          {lastWeekWeight !== '-' ? `${lastWeekWeight} kg` : '-'}
                                        </span>
                                        {lastWeekWeight !== '-' && lastWeekRecommendation === 'increase' && (
                                          <ArrowUp size={14} className="text-green-400" title="Increase weight" />
                                        )}
                                        {lastWeekWeight !== '-' && lastWeekRecommendation === 'drop' && (
                                          <ArrowDown size={14} className="text-red-400" title="Drop weight" />
                                        )}
                                        {lastWeekWeight !== '-' && lastWeekRecommendation === 'stay' && (
                                          <Minus size={14} className="text-amber-400" title="Stay at same weight" />
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={set.weight}
                                          onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'weight', e.target.value)}
                                          className="w-20 px-3 py-2 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                          placeholder="0"
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <input
                                        type="number"
                                        value={set.reps}
                                        onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'reps', e.target.value)}
                                        className="w-16 px-3 py-2 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="0"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <select
                                        value={set.rpe}
                                        onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'rpe', e.target.value)}
                                        className="w-20 px-3 py-2 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      >
                                        <option value="">-</option>
                                        {[...Array(10)].map((_, i) => (
                                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-4 py-3">
                                      <input
                                        type="text"
                                        value={set.notes}
                                        onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'notes', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Form notes, feeling, etc."
                                      />
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
              })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeightsView;

