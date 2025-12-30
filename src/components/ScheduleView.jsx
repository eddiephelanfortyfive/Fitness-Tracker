import React from 'react';
import { Check, X } from 'lucide-react';
import { calculateOverallProgress, calculateWeekProgress, getScheduleForWeek } from '../utils/calculations';

const ScheduleView = ({ 
  maxWeeks, 
  runningData, 
  cyclingData, 
  weightData, 
  workoutDays, 
  activeLevel, 
  updateWorkoutStatus 
}) => {
  const overallProgress = calculateOverallProgress(runningData, cyclingData, weightData);

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Overall Progress</h2>
            <p className="text-sm text-slate-400">
              Week {overallProgress.currentWeek} of {maxWeeks} - {overallProgress.completionRate}% Complete
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{overallProgress.completed}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{overallProgress.skipped}</div>
              <div className="text-xs text-slate-400">Skipped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-400">{overallProgress.notDone}</div>
              <div className="text-xs text-slate-400">Remaining</div>
            </div>
          </div>
        </div>
      </div>
      
      {[...Array(maxWeeks)].map((_, weekIndex) => {
        const week = weekIndex + 1;
        const schedule = getScheduleForWeek(week, runningData, cyclingData, weightData, workoutDays, activeLevel);
        const weekProgress = calculateWeekProgress(week, runningData, cyclingData, weightData);
        
        return (
          <div key={week} className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Week {week}</h2>
                <div className="text-sm text-slate-400">
                  {weekProgress.completionRate}% Complete ({weekProgress.completed}/{weekProgress.total})
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 divide-x divide-slate-700">
              {Object.entries(schedule).map(([day, activities]) => (
                <div key={day} className="p-4">
                  <h3 className="font-bold text-white mb-3 text-center">{day}</h3>
                  <div className="space-y-2">
                    {activities.length > 0 ? (
                      activities.map((activity, idx) => {
                        const getStatusColors = () => {
                          if (activity.status === 'completed') {
                            return 'bg-green-600 border-green-500 text-white';
                          } else if (activity.status === 'skipped') {
                            return 'bg-red-600 border-red-500 text-white';
                          } else {
                            // Default colors based on activity type
                            if (activity.type === 'Running' && activity.isInterval) {
                              return 'bg-orange-900 border-orange-700 text-orange-200';
                            } else if (activity.type === 'Running') {
                              return 'bg-blue-900 border-blue-700 text-blue-200';
                            } else if (activity.type === 'Weights') {
                              return 'bg-purple-900 border-purple-700 text-purple-200';
                            } else {
                              return 'bg-green-900 border-green-700 text-green-200';
                            }
                          }
                        };
                        
                        const getActivityType = () => {
                          if (activity.type === 'Running') return 'running';
                          if (activity.type === 'Cycling') return 'cycling';
                          if (activity.type === 'Weights') return 'weights';
                          return 'running';
                        };
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => updateWorkoutStatus(getActivityType(), activity.identifier, activity.status)}
                            className={`p-2 rounded text-xs border-2 cursor-pointer transition-all hover:opacity-80 ${getStatusColors()}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold">{activity.type}</div>
                              {activity.status === 'completed' && (
                                <Check size={14} className="flex-shrink-0" />
                              )}
                              {activity.status === 'skipped' && (
                                <X size={14} className="flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-xs opacity-90">{activity.detail}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-500 text-xs text-center italic">Rest Day</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleView;

