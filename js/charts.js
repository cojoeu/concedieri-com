// Chart rendering functions
let timelineChartInstance = null;
let companyChartInstance = null;

// Initialize charts
function initCharts(layoffData) {
    renderTimelineChart(layoffData);
    renderCompanyChart(layoffData, 'year'); // Default to year view
}

// Render timeline chart
function renderTimelineChart(layoffData, viewMode = 'months') {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;

    let labels, data;
    
    if (viewMode === 'years') {
        // Group data by year
        const yearlyData = {};
        layoffData.forEach(layoff => {
            const year = layoff.date.substring(0, 4); // YYYY
            if (!yearlyData[year]) {
                yearlyData[year] = 0;
            }
            yearlyData[year] += layoff.employeesAffected;
        });
        
        // Sort by year
        const sortedYears = Object.keys(yearlyData).sort();
        labels = sortedYears;
        data = sortedYears.map(year => yearlyData[year]);
    } else {
        // Group data by month
        const monthlyData = {};
        layoffData.forEach(layoff => {
            const month = layoff.date.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month] += layoff.employeesAffected;
        });

        // Sort by date
        const sortedMonths = Object.keys(monthlyData).sort();
        labels = sortedMonths.map(month => {
            const date = new Date(month + '-01');
            const lang = getCurrentLanguage();
            return date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { month: 'short', year: 'numeric' });
        });
        data = sortedMonths.map(month => monthlyData[month]);
    }

    // Destroy existing chart
    if (timelineChartInstance) {
        timelineChartInstance.destroy();
    }

    timelineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: t('employeesAffected'),
                data: data,
                borderColor: 'rgba(147, 51, 234, 1)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(147, 51, 234, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: 'rgba(147, 51, 234, 1)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    borderColor: 'rgba(147, 51, 234, 0.5)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString() + ' ' + t('affected');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 10
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Render company chart (now supports multiple view modes)
function renderCompanyChart(layoffData, viewMode = 'year') {
    const ctx = document.getElementById('companyChart');
    if (!ctx) return;

    let labels, data, sorted;
    
    if (viewMode === 'year') {
        // Group by year - total employees affected (confirmed + potential combined)
        const yearlyData = {};
        
        layoffData.forEach(layoff => {
            const year = new Date(layoff.date).getFullYear();
            if (!yearlyData[year]) {
                yearlyData[year] = 0;
            }
            
            const confirmedCount = layoff.employeesAffected || 0;
            const potentialCount = layoff.employeesPotential || 0;
            
            // Add both confirmed and potential to total
            yearlyData[year] += confirmedCount;
            yearlyData[year] += potentialCount;
        });
        
        // Sort by year and take all years
        sorted = Object.entries(yearlyData)
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year.localeCompare(b.year));
        
        labels = sorted.map(item => item.year);
        data = sorted.map(item => item.count);
    } else if (viewMode === 'category') {
        // Group by category
        const categoryData = {};
        layoffData.forEach(layoff => {
            const category = layoff.category || 'Other';
            if (!categoryData[category]) {
                categoryData[category] = 0;
            }
            categoryData[category] += layoff.employeesAffected || 0;
        });
        
        // Sort by count and take top 10
        sorted = Object.entries(categoryData)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        labels = sorted.map(item => item.category);
        data = sorted.map(item => item.count);
    } else if (viewMode === 'location') {
        // Group by county (or location if no county)
        const locationData = {};
        layoffData.forEach(layoff => {
            const location = layoff.county || layoff.location || 'Other';
            if (!locationData[location]) {
                locationData[location] = 0;
            }
            locationData[location] += layoff.employeesAffected || 0;
        });
        
        // Sort by count and take top 10
        sorted = Object.entries(locationData)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        labels = sorted.map(item => item.location);
        data = sorted.map(item => item.count);
    } else {
        // Default: by company
        sorted = [...layoffData]
            .sort((a, b) => (b.employeesAffected || 0) - (a.employeesAffected || 0))
            .slice(0, 10);
        labels = sorted.map(item => item.company);
        data = sorted.map(item => item.employeesAffected || 0);
    }
    
    const colors = generateGradientColors(data.length);

    // Destroy existing chart
    if (companyChartInstance) {
        companyChartInstance.destroy();
    }

    companyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: t('employeesAffected'),
                data: data,
                backgroundColor: colors.map(c => `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`),
                borderColor: colors.map(c => `rgba(${c.r}, ${c.g}, ${c.b}, 1)`),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1.5,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    borderColor: 'rgba(147, 51, 234, 0.5)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.x.toLocaleString() + ' ' + t('affected');
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                y: {
                    grid: {
                        display: false,
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Generate gradient colors
function generateGradientColors(count) {
    const colors = [];
    const startColor = { r: 99, g: 102, b: 241 }; // indigo-500
    const endColor = { r: 147, g: 51, b: 234 }; // purple-600
    
    for (let i = 0; i < count; i++) {
        const ratio = i / (count - 1);
        colors.push({
            r: Math.round(startColor.r + (endColor.r - startColor.r) * ratio),
            g: Math.round(startColor.g + (endColor.g - startColor.g) * ratio),
            b: Math.round(startColor.b + (endColor.b - startColor.b) * ratio)
        });
    }
    
    return colors;
}

// Update charts with new data
function updateCharts(layoffData) {
    // Get current timeline view mode
    const timelineToggle = document.getElementById('timelineToggle');
    const timelineViewMode = timelineToggle ? timelineToggle.getAttribute('data-view') || 'months' : 'months';
    
    // Get current chart view mode
    const chartViewToggle = document.getElementById('chartViewToggle');
    const chartViewMode = chartViewToggle ? chartViewToggle.getAttribute('data-view') || 'year' : 'year';
    
    renderTimelineChart(layoffData, timelineViewMode);
    renderCompanyChart(layoffData, chartViewMode);
}

// Export timeline chart function for external use
window.updateTimelineChart = renderTimelineChart;

// Export company chart function for external use
window.updateCompanyChart = renderCompanyChart;

// Make functions globally available
window.renderCharts = function(data) {
    if (data) {
        updateCharts(data);
    } else if (window.layoffData) {
        updateCharts(window.layoffData);
    }
};

// Also export updateCharts directly for direct calls
window.updateChartsData = updateCharts;

