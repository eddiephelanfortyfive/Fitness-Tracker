import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Check } from 'lucide-react';
import { calculateOverallProgress, calculateWeekProgress } from '../utils/calculations';
import { chartOptions, weightChartOptions } from '../constants/chartOptions';

const ProgressView = ({
  runningData,
  cyclingData,
  weightData,
  yogaData,
  weightLogData,
  targetWeight,
  workoutDays,
  activeLevel,
  maxWeeks,
  runningDistanceData,
  runningPaceData,
  cyclingDistanceData,
  cyclingPaceData,
  bodyWeightTrendData,
  bodyWeightWeeklyData,
  getWeightChartData,
  coldExposureData,
  coldExposureDurationData,
  coldExposureMethodData,
  yogaDurationData
}) => {
  const overallProgress = calculateOverallProgress(runningData, cyclingData, weightData, yogaData);
  const weeklyProgressData = [...Array(maxWeeks)].map((_, i) => {
    const week = i + 1;
    const weekProgress = calculateWeekProgress(week, runningData, cyclingData, weightData, yogaData);
    return weekProgress.completionRate;
  });

  return (
    <div className="space-y-6">
      {/* Overall Progress Stats */}
      <>
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
            <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">{overallProgress.completed}</div>
            <div className="text-sm sm:text-base text-slate-400">Completed</div>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
            <div className="text-3xl sm:text-4xl font-bold text-red-400 mb-2">{overallProgress.skipped}</div>
            <div className="text-sm sm:text-base text-slate-400">Skipped</div>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
            <div className="text-3xl sm:text-4xl font-bold text-slate-400 mb-2">{overallProgress.notDone}</div>
            <div className="text-sm sm:text-base text-slate-400">Remaining</div>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
            <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">{overallProgress.completionRate}%</div>
            <div className="text-sm sm:text-base text-slate-400">Complete</div>
          </div>
        </div>

        {/* Completion Percentage Chart */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Weekly Completion Rate</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <Bar
              data={{
                labels: [...Array(maxWeeks)].map((_, i) => `Week ${i + 1}`),
                datasets: [{
                  label: 'Completion %',
                  data: weeklyProgressData,
                  backgroundColor: weeklyProgressData.map(rate => 
                    rate === 100 ? 'rgba(34, 197, 94, 0.8)' : 
                    rate >= 50 ? 'rgba(59, 130, 246, 0.8)' : 
                    rate > 0 ? 'rgba(251, 191, 36, 0.8)' : 
                    'rgba(148, 163, 184, 0.5)'
                  ),
                  borderColor: weeklyProgressData.map(rate => 
                    rate === 100 ? 'rgb(34, 197, 94)' : 
                    rate >= 50 ? 'rgb(59, 130, 246)' : 
                    rate > 0 ? 'rgb(251, 191, 36)' : 
                    'rgb(148, 163, 184)'
                  ),
                  borderWidth: 2
                }]
              }}
              options={{
                ...chartOptions,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Completion %',
                      color: '#94a3b8'
                    }
                  }
                }
              }}
              redraw={false}
            />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Activity Timeline</h2>
          <div className="space-y-4">
            {[...Array(maxWeeks)].map((_, weekIndex) => {
              const week = weekIndex + 1;
              const weekRunning = runningData.filter(r => r && r.week === week && r.status === 'completed');
              const weekCycling = cyclingData.filter(c => c && c.week === week);
              const cyclingDay = activeLevel === 1 ? 'Friday' : 'Thursday';
              const cyclingStatus = weekCycling.find(c => c.day === cyclingDay)?.status;
              const weekWeights = weightData.filter(w => w && w.week === week);
              const weightWorkouts = [...new Set(weekWeights.map(w => `${w.day}-${w.workoutName}`))];
              const completedWeights = weightWorkouts.filter(key => {
                const [day, workoutName] = key.split('-');
                const workout = weekWeights.find(w => w.day === day && w.workoutName === workoutName);
                return workout?.status === 'completed';
              });
              const weekYoga = yogaData?.filter(y => y && y.week === week && y.status === 'completed') || [];
              
              const hasCompleted = weekRunning.length > 0 || cyclingStatus === 'completed' || completedWeights.length > 0 || weekYoga.length > 0;
              
              if (!hasCompleted) return null;
              
              return (
                <div key={week} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-3">Week {week}</h3>
                  <div className="space-y-2">
                    {weekRunning.map((run, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check size={16} className="text-green-400 flex-shrink-0" />
                        <span className="text-slate-300">
                          <span className="font-semibold text-blue-400">Running:</span> {run.day} - Run {run.run} ({run.distance}km {run.type})
                        </span>
                      </div>
                    ))}
                    {cyclingStatus === 'completed' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check size={16} className="text-green-400 flex-shrink-0" />
                        <span className="text-slate-300">
                          <span className="font-semibold text-green-400">Cycling:</span> {cyclingDay} - {activeLevel === 1 ? '40min' : '45-60min'} Cycle
                        </span>
                      </div>
                    )}
                    {completedWeights.map((key, idx) => {
                      const [day, workoutName] = key.split('-');
                      return (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check size={16} className="text-green-400 flex-shrink-0" />
                          <span className="text-slate-300">
                            <span className="font-semibold text-purple-400">Weights:</span> {day} - {workoutName}
                          </span>
                        </div>
                      );
                    })}
                    {weekYoga.map((yoga, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check size={16} className="text-green-400 flex-shrink-0" />
                        <span className="text-slate-300">
                          <span className="font-semibold text-indigo-400">Yoga:</span> {yoga.day} {yoga.duration ? `(${yoga.duration})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {[...Array(maxWeeks)].every((_, weekIndex) => {
              const week = weekIndex + 1;
              const weekRunning = runningData.filter(r => r && r.week === week && r.status === 'completed');
              const weekCycling = cyclingData.filter(c => c && c.week === week);
              const cyclingDay = activeLevel === 1 ? 'Friday' : 'Thursday';
              const cyclingStatus = weekCycling.find(c => c.day === cyclingDay)?.status;
              const weekWeights = weightData.filter(w => w && w.week === week);
              const weightWorkouts = [...new Set(weekWeights.map(w => `${w.day}-${w.workoutName}`))];
              const completedWeights = weightWorkouts.filter(key => {
                const [day, workoutName] = key.split('-');
                const workout = weekWeights.find(w => w.day === day && w.workoutName === workoutName);
                return workout?.status === 'completed';
              });
              const weekYoga = yogaData?.filter(y => y && y.week === week && y.status === 'completed') || [];
              return weekRunning.length === 0 && cyclingStatus !== 'completed' && completedWeights.length === 0 && weekYoga.length === 0;
            }) && (
              <div className="text-center text-slate-500 py-8">
                <p className="text-lg">No completed workouts yet</p>
                <p className="text-sm mt-2">Complete workouts to see them here!</p>
              </div>
            )}
          </div>
        </div>
      </>

      {/* Running Progress */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Running Progress</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Running Distance Chart */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Distance Over Time</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <Line
                data={runningDistanceData}
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
                        text: 'Distance (km)',
                        color: '#94a3b8'
                      }
                    }
                  }
                }}
                redraw={false}
              />
            </div>
          </div>

          {/* Running Pace Chart */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Pace Over Time</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <Line
                data={runningPaceData}
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
                        text: 'Pace (min/km)',
                        color: '#94a3b8'
                      }
                    }
                  }
                }}
                redraw={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cycling Progress */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Cycling Progress</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cycling Distance Chart */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Distance Over Time</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <Bar
                data={cyclingDistanceData}
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
                        text: 'Distance (km)',
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

          {/* Cycling Pace Chart */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Average Pace Over Time</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <Line
                data={cyclingPaceData}
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
                        text: 'Pace (min/km)',
                        color: '#94a3b8'
                      }
                    }
                  }
                }}
                redraw={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weight Training Progress */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Weight Training Progress - Progressive Overload</h2>
        <div className="space-y-6">
          {workoutDays.map((workout, workoutIndex) => {
            const exercises = workout.exercises;
            return (
              <div key={workoutIndex} className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-4">{workout.day} - {workout.name}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {exercises.map((exercise, exerciseIndex) => {
                    const chartData = getWeightChartData(exercise.name, workout.day);
                    
                    // Only show chart if there's data
                    const hasData = chartData.datasets[0].data.some(w => w !== null);
                    
                    if (!hasData) return null;
                    
                    return (
                      <div key={exerciseIndex} className="bg-slate-600 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-white mb-3">{exercise.name}</h4>
                        <div style={{ height: '200px', width: '100%' }}>
                          <Line
                            data={chartData}
                            options={{
                              ...weightChartOptions,
                              responsive: true,
                              maintainAspectRatio: false
                            }}
                            redraw={false}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body Weight Progress */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Body Weight Progress</h2>
        {weightLogData.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p>No weight entries yet. Log your weight in the Weight Log tab to see progress here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Trend Line Chart */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Weight Trend Over Time</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <Line
                  data={bodyWeightTrendData}
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
                          text: 'Weight (kg)',
                          color: '#94a3b8'
                        }
                      }
                    },
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          color: '#94a3b8',
                          usePointStyle: true
                        }
                      }
                    }
                  }}
                  redraw={false}
                />
              </div>
            </div>

            {/* Average Weight Per Week Bar Chart */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Average Weight Per Week</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <Bar
                  data={bodyWeightWeeklyData}
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
                          text: 'Weight (kg)',
                          color: '#94a3b8'
                        }
                      }
                    },
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          color: '#94a3b8',
                          usePointStyle: true
                        }
                      }
                    }
                  }}
                  redraw={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Yoga Progress */}
      {yogaData && yogaData.length > 0 && (
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Yoga Progress</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duration Trend Bar Chart */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Total Duration Per Week</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <Bar
                  data={yogaDurationData}
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
          </div>
        </div>
      )}

      {/* Cold Exposure Progress */}
      {coldExposureData && coldExposureData.length > 0 && (
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Cold Exposure Progress</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duration Trend Line Chart */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Duration Over Time</h3>
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

            {/* Method Distribution Bar Chart */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Method Distribution</h3>
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
    </div>
  );
};

export default ProgressView;

