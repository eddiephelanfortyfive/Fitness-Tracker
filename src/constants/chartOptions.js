// Chart.js configuration options

// Main chart options for line and bar charts
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0
  },
  plugins: {
    legend: {
      labels: { color: '#e2e8f0' }
    }
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.1)' }
    },
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.1)' }
    }
  }
};

// Weight training chart options (smaller charts)
export const weightChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0
  },
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8', font: { size: 10 } },
      grid: { color: 'rgba(148, 163, 184, 0.1)' }
    },
    y: {
      ticks: { color: '#94a3b8', font: { size: 10 } },
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
      title: {
        display: true,
        text: 'Weight (kg)',
        color: '#94a3b8',
        font: { size: 11 }
      },
      beginAtZero: true
    }
  }
};

