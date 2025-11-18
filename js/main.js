// Main application logic
let allLayoffs = [];
let filteredLayoffs = [];
let totalEmployeesAffected = 0;
let currentViewMode = 'grid'; // 'grid' or 'list'

// Initialize application
async function init() {
    try {
        let data;
        
        // Try to use embedded data first (for local file:// protocol)
        if (window.layoffDataJSON) {
            data = window.layoffDataJSON;
        } else {
            // Fallback to fetching JSON (works in production with HTTP server)
            const response = await fetch('data/layoffs.json');
            data = await response.json();
        }
        
        allLayoffs = data.layoffs;
        filteredLayoffs = [...allLayoffs];
        
        // Store globally for charts
        window.layoffData = allLayoffs;
        
        // Calculate total
        calculateTotal();
        
        // Initialize UI
        setupFilters();
        renderCompanyCards();
        // Initialize charts after a brief delay to ensure charts.js is loaded
        if (document.readyState === 'complete') {
            setTimeout(() => {
                updateMainCharts();
                updateYearlyStats();
            }, 50);
        } else {
            window.addEventListener('load', () => setTimeout(() => {
                updateMainCharts();
                updateYearlyStats();
            }, 50));
        }
        
        // Setup search
        setupSearch();
        
        // Setup modal
        setupModal();
        
        // Setup view mode toggle
        setupViewToggle();
        
        // Setup timeline toggle
        setupTimelineToggle();
        
        // Setup chart view toggle
        setupChartViewToggle();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load layoff data. Please refresh the page.');
    }
}

// Calculate total employees affected and dashboard stats
function calculateTotal() {
    // Only count confirmed layoffs (not potential)
    totalEmployeesAffected = allLayoffs
        .filter(layoff => !layoff.isPotential)
        .reduce((sum, layoff) => sum + (layoff.employeesAffected || 0), 0);
    updateTotalDisplay();
    updateDashboardStats();
    updateYearlyStats();
}

// Update dashboard statistics (removed - stats boxes removed)
function updateDashboardStats() {
    // Stats boxes removed, only keeping totals in header
    // Update results count
    updateResultsCount();
}

// Update yearly statistics (now just updates header totals)
function updateYearlyStats() {
    // Group by year
    const yearlyData = {};
    const yearlyPotential = {};
    
    allLayoffs.forEach(layoff => {
        const year = new Date(layoff.date).getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = 0;
            yearlyPotential[year] = 0;
        }
        
        // Handle confirmed vs potential
        const confirmedCount = layoff.employeesAffected || 0;
        const potentialCount = layoff.employeesPotential || 0;
        
        if (layoff.isPotential) {
            // If marked as potential, add to potential
            yearlyPotential[year] += confirmedCount;
            yearlyPotential[year] += potentialCount;
        } else {
            // Confirmed goes to confirmed
            yearlyData[year] += confirmedCount;
            // Potential count (if exists) goes to potential
            yearlyPotential[year] += potentialCount;
        }
    });
    
    // Calculate totals
    const totalConfirmed = Object.values(yearlyData).reduce((sum, val) => sum + val, 0);
    const totalPotential = Object.values(yearlyPotential).reduce((sum, val) => sum + val, 0);
    
    // Update header stats (compact form in nav)
    const totalConfirmedEl = document.getElementById('totalConfirmedNav');
    const totalPotentialEl = document.getElementById('totalPotentialNav');
    
    if (totalConfirmedEl) animateNumber(totalConfirmedEl, 0, totalConfirmed, 1500);
    if (totalPotentialEl) animateNumber(totalPotentialEl, 0, totalPotential, 1500);
    
    // Yearly chart now part of main chart, no separate update needed
}

// Update results count
function updateResultsCount() {
    const resultsCountEl = document.getElementById('resultsCount');
    if (resultsCountEl) {
        const count = filteredLayoffs.length;
        const label = count === 1 ? t('result') : t('results');
        resultsCountEl.textContent = `${count} ${label}`;
    }
}

// Update total display with animation
function updateTotalDisplay() {
    const totalElement = document.getElementById('totalLayoffs');
    if (!totalElement) return;
    
    animateNumber(totalElement, 0, totalEmployeesAffected, 2000);
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const lang = getCurrentLanguage();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = current.toLocaleString(lang === 'ro' ? 'ro-RO' : 'en-US');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Setup filters
function setupFilters() {
    const countryFilter = document.getElementById('countryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    // Setup country filter listener
    if (countryFilter) {
        countryFilter.addEventListener('change', () => {
            updateLocationFilter();
            applyFilters();
        });
    }
    
    // Update location filter based on country
    updateLocationFilter();
    
    // Setup category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    // Setup compensation filter
    const compensationFilter = document.getElementById('compensationFilter');
    if (compensationFilter) {
        compensationFilter.addEventListener('change', applyFilters);
    }
    
    // Setup filter event listeners
    if (locationFilter) {
        locationFilter.addEventListener('change', applyFilters);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
}

// Update location filter based on selected country
function updateLocationFilter() {
    const countryFilter = document.getElementById('countryFilter');
    const locationFilter = document.getElementById('locationFilter');
    if (!countryFilter || !locationFilter) return;
    
    const selectedCountry = countryFilter.value;
    
    // Clear existing options except "All Locations"
    locationFilter.innerHTML = '<option value="" data-i18n="allLocations">All Locations</option>';
    
    if (selectedCountry === 'Romania') {
        // Show Romanian cities and counties
        const romaniaLocations = getRomaniaLocations();
        romaniaLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    } else {
        // Show all locations from data
        const locations = [...new Set(allLayoffs.map(l => l.location || l.country || '').filter(l => l))].sort();
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }
    
    // Translate the "All Locations" option
    const allLocationsOption = locationFilter.querySelector('option[value=""]');
    if (allLocationsOption) {
        allLocationsOption.textContent = t('allLocations');
    }
}

// Apply filters
function applyFilters() {
    const countryFilter = document.getElementById('countryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const dateFilter = document.getElementById('dateFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const compensationFilter = document.getElementById('compensationFilter');
    const searchInput = document.getElementById('searchInput');
    
    const countryValue = countryFilter ? countryFilter.value : '';
    const locationValue = locationFilter ? locationFilter.value : '';
    const dateValue = dateFilter ? dateFilter.value : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const compensationValue = compensationFilter ? compensationFilter.value : '';
    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    filteredLayoffs = allLayoffs.filter(layoff => {
        // Country filter
        if (countryValue) {
            const layoffCountry = layoff.country || (layoff.location === 'Romania' ? 'Romania' : '');
            if (layoffCountry !== countryValue && !isRomaniaLocation(layoff.location || '')) {
                return false;
            }
        }
        
        // Location filter
        if (locationValue) {
            const layoffLocation = layoff.location || layoff.county || '';
            if (!layoffLocation.toLowerCase().includes(locationValue.toLowerCase()) &&
                !locationValue.toLowerCase().includes(layoffLocation.toLowerCase())) {
                return false;
            }
        }
        
        // Date filter
        if (dateValue) {
            const layoffYear = new Date(layoff.date).getFullYear().toString();
            if (layoffYear !== dateValue) {
                return false;
            }
        }
        
        // Category filter
        if (categoryValue && layoff.category !== categoryValue) {
            return false;
        }
        
        // Compensation filter
        if (compensationValue) {
            const hasCompensation = layoff.compensation && (
                layoff.compensation.severancePay || 
                layoff.compensation.bonusPackage || 
                layoff.compensation.support
            );
            if (compensationValue === 'with' && !hasCompensation) {
                return false;
            }
            if (compensationValue === 'without' && hasCompensation) {
                return false;
            }
        }
        
        // Search filter
        if (searchValue && !layoff.company.toLowerCase().includes(searchValue)) {
            return false;
        }
        
        return true;
    });
    
    renderCompanyCards();
    updateMainCharts();
    updateYearlyStats();
    updateResultsCount();
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300); // Debounce
    });
}

// Render company cards
function renderCompanyCards() {
    const grid = document.getElementById('companyGrid');
    const list = document.getElementById('companyList');
    
    if (!grid || !list) return;
    
    if (filteredLayoffs.length === 0) {
        const emptyMsg = `
            <div class="col-span-full glass-card p-6 rounded-xl text-center">
                <p class="text-white/70 text-base">${t('noResults')}</p>
            </div>
        `;
        if (currentViewMode === 'grid') {
            grid.innerHTML = emptyMsg;
            list.innerHTML = '';
            list.classList.add('hidden');
            grid.classList.remove('hidden');
        } else {
            list.innerHTML = emptyMsg;
            grid.innerHTML = '';
            grid.classList.add('hidden');
            list.classList.remove('hidden');
        }
        return;
    }
    
    // Sort by date (newest first)
    const sorted = [...filteredLayoffs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (currentViewMode === 'grid') {
        // Clear and show grid, hide list
        grid.innerHTML = '';
        list.classList.add('hidden');
        grid.classList.remove('hidden');
        
        sorted.forEach((layoff, index) => {
            const card = createCompanyCard(layoff, index);
            grid.appendChild(card);
        });
    } else {
        // Clear and show list, hide grid
        list.innerHTML = '';
        grid.classList.add('hidden');
        list.classList.remove('hidden');
        
        sorted.forEach((layoff, index) => {
            const listItem = createCompanyListItem(layoff, index);
            list.appendChild(listItem);
        });
    }
}

// Calculate percentage helper
function calculatePercentage(affected, total) {
    if (!total || total === 0) return null;
    return ((affected / total) * 100).toFixed(1);
}

// Create company card element
function createCompanyCard(layoff, index) {
    const card = document.createElement('div');
    card.className = 'company-card p-3 rounded-xl fade-in';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const lang = getCurrentLanguage();
    const formattedDate = formatDate(layoff.date, lang);
    const notes = lang === 'ro' ? (layoff.notesRO || layoff.notes) : layoff.notes;
    const comp = layoff.compensation;
    const hasCompensation = comp && (comp.severancePay || comp.bonusPackage || comp.support);
    const companyName = lang === 'ro' ? (layoff.companyRO || layoff.company) : layoff.company;
    const sources = layoff.sources || (layoff.source ? [{url: layoff.source, name: layoff.sourceName || 'Source'}] : []);
    const primarySource = sources[0] || {};
    
    // Calculate percentages
    const localPercentage = layoff.totalEmployees ? calculatePercentage(layoff.employeesAffected, layoff.totalEmployees) : null;
    const groupPercentage = layoff.totalGroupEmployees ? calculatePercentage(layoff.employeesAffected, layoff.totalGroupEmployees) : null;
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-white mb-1.5 truncate">${companyName}</h3>
                <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="badge text-white text-xs">${layoff.location || ''}</span>
                    ${layoff.category ? `<span class="badge text-blue-300 bg-blue-500/20 text-xs">${layoff.category}</span>` : ''}
                    ${(layoff.isPotential || false) ? `<span class="badge text-purple-300 bg-purple-500/20 text-xs">${t('potential')}</span>` : `<span class="badge text-green-300 bg-green-500/20 text-xs">${t('confirmed')}</span>`}
                    ${hasCompensation ? `<span class="badge text-green-300 bg-green-500/20 text-xs">✓</span>` : ''}
                </div>
            </div>
            ${primarySource.url ? `
            <a 
                href="${primarySource.url}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="link-icon text-white/70 hover:text-white transition-all flex-shrink-0 ml-1.5 relative"
                onclick="event.stopPropagation()"
                title="${sources.length > 1 ? `${sources.length} sources` : 'Source'}"
            >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                ${sources.length > 1 ? `<span class="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none pt-0.5">${sources.length}</span>` : ''}
            </a>
            ` : ''}
        </div>
        
        <div class="mb-2">
            <div class="flex items-baseline space-x-1.5 mb-1">
                <span class="text-2xl font-bold text-white number-counter">${layoff.employeesAffected.toLocaleString()}</span>
                <span class="text-white/70 text-xs">${t('employees')}</span>
            </div>
            ${localPercentage || groupPercentage ? `
            <div class="flex items-center gap-2 text-white/60 text-xs mt-1">
                ${localPercentage ? `<span class="text-white/70">${localPercentage}% ${t('ofLocal')}</span>` : ''}
                ${groupPercentage ? `<span class="text-white/70">${groupPercentage}% ${t('ofGroup')}</span>` : ''}
            </div>
            ` : ''}
            <div class="text-white/60 text-xs">
                ${formattedDate}
            </div>
        </div>
        
        ${notes ? `
            <div class="mb-2 text-xs text-white/60 line-clamp-2">
                ${notes}
            </div>
        ` : ''}
        
        ${hasCompensation ? `
            <div class="mb-2 p-1.5 rounded-lg bg-white/5 border border-white/10">
                <div class="text-xs text-white/70 space-y-0.5">
                    ${comp.severancePay ? `<div class="truncate">✓ ${t('severancePay')}${comp.severanceMonths ? `: ${comp.severanceMonths} ${t('months')}` : ''}</div>` : ''}
                    ${comp.bonusPackage ? `<div class="truncate">✓ ${t('bonusPackage')}${comp.bonusAmountRO || comp.bonusAmount ? `: ${lang === 'ro' ? (comp.bonusAmountRO || comp.bonusAmount) : comp.bonusAmount}` : ''}</div>` : ''}
                    ${comp.support ? `<div class="truncate">✓ ${t('support')}</div>` : ''}
                </div>
            </div>
        ` : ''}
    `;
    
    // Add click handler
    card.addEventListener('click', () => {
        showCompanyModal(layoff);
    });
    
    return card;
}

// Create company list item element
function createCompanyListItem(layoff, index) {
    const item = document.createElement('div');
    item.className = 'company-card p-4 rounded-xl fade-in cursor-pointer hover:bg-white/10 transition-all';
    item.style.animationDelay = `${index * 0.05}s`;
    
    const lang = getCurrentLanguage();
    const formattedDate = formatDate(layoff.date, lang);
    const notes = lang === 'ro' ? (layoff.notesRO || layoff.notes) : layoff.notes;
    const comp = layoff.compensation;
    const hasCompensation = comp && (comp.severancePay || comp.bonusPackage || comp.support);
    const companyName = lang === 'ro' ? (layoff.companyRO || layoff.company) : layoff.company;
    const sources = layoff.sources || (layoff.source ? [{url: layoff.source, name: layoff.sourceName || 'Source'}] : []);
    const primarySource = sources[0] || {};
    
    // Calculate percentages
    const localPercentage = layoff.totalEmployees ? calculatePercentage(layoff.employeesAffected, layoff.totalEmployees) : null;
    const groupPercentage = layoff.totalGroupEmployees ? calculatePercentage(layoff.employeesAffected, layoff.totalGroupEmployees) : null;
    
    item.innerHTML = `
        <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-base font-bold text-white truncate">${companyName}</h3>
                    <span class="badge text-white text-xs">${layoff.location || ''}</span>
                    ${layoff.category ? `<span class="badge text-blue-300 bg-blue-500/20 text-xs">${layoff.category}</span>` : ''}
                    ${(layoff.isPotential || false) ? `<span class="badge text-purple-300 bg-purple-500/20 text-xs">${t('potential')}</span>` : `<span class="badge text-green-300 bg-green-500/20 text-xs">${t('confirmed')}</span>`}
                    ${hasCompensation ? `<span class="badge text-green-300 bg-green-500/20 text-xs">✓</span>` : ''}
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-xl font-bold text-white">${layoff.employeesAffected.toLocaleString()}</span>
                        <span class="text-white/70 text-xs">${t('employees')}</span>
                    </div>
                    ${localPercentage || groupPercentage ? `
                    <div class="flex items-center gap-2 text-white/60 text-xs">
                        ${localPercentage ? `<span>${localPercentage}% ${t('ofLocal')}</span>` : ''}
                        ${groupPercentage ? `<span>${groupPercentage}% ${t('ofGroup')}</span>` : ''}
                    </div>
                    ` : ''}
                    <span class="text-white/60 text-xs">${formattedDate}</span>
                </div>
                ${notes ? `
                    <div class="mt-2 text-xs text-white/60 line-clamp-1">
                        ${notes}
                    </div>
                ` : ''}
            </div>
            ${primarySource.url ? `
            <a 
                href="${primarySource.url}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="link-icon text-white/70 hover:text-white transition-all flex-shrink-0 relative"
                onclick="event.stopPropagation()"
                title="${sources.length > 1 ? `${sources.length} sources` : 'Source'}"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                ${sources.length > 1 ? `<span class="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none pt-0.5">${sources.length}</span>` : ''}
            </a>
            ` : ''}
        </div>
    `;
    
    // Add click handler
    item.addEventListener('click', () => {
        showCompanyModal(layoff);
    });
    
    return item;
}

// Setup modal
function setupModal() {
    const modal = document.getElementById('companyModal');
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('closeModal');
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// Show company modal
function showCompanyModal(layoff) {
    const modal = document.getElementById('companyModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    const lang = getCurrentLanguage();
    const formattedDate = formatDate(layoff.date, lang);
    const notes = lang === 'ro' ? (layoff.notesRO || layoff.notes) : layoff.notes;
    const companyName = lang === 'ro' ? (layoff.companyRO || layoff.company) : layoff.company;
    const sources = layoff.sources || (layoff.source ? [{url: layoff.source, name: layoff.sourceName || 'Source'}] : []);
    
    // Calculate percentages
    const localPercentage = layoff.totalEmployees ? calculatePercentage(layoff.employeesAffected, layoff.totalEmployees) : null;
    const groupPercentage = layoff.totalGroupEmployees ? calculatePercentage(layoff.employeesAffected, layoff.totalGroupEmployees) : null;
    
    modalContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-4xl font-bold text-white mb-2">${companyName}</h2>
            <div class="flex items-center space-x-4 text-white/70">
                <span class="badge">${layoff.location}</span>
                <span>${formattedDate}</span>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="glass-stat-card p-6 rounded-2xl">
                <div class="text-sm text-white/70 mb-2">${t('employeesAffected')}</div>
                <div class="text-4xl font-bold text-white mb-2">${layoff.employeesAffected.toLocaleString()}</div>
                ${localPercentage || groupPercentage ? `
                <div class="flex flex-col gap-1 mt-3 pt-3 border-t border-white/10">
                    ${localPercentage ? `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-white/70">${t('localEmployees')}</span>
                        <span class="text-white font-semibold">${localPercentage}%</span>
                    </div>
                    ` : ''}
                    ${groupPercentage ? `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-white/70">${t('groupEmployees')}</span>
                        <span class="text-white font-semibold">${groupPercentage}%</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            ${layoff.totalEmployees || layoff.totalGroupEmployees ? `
                <div class="glass-stat-card p-6 rounded-2xl">
                    <div class="text-sm text-white/70 mb-3">${t('totalEmployees')}</div>
                    ${layoff.totalEmployees ? `
                    <div class="mb-2">
                        <div class="text-lg text-white/70 mb-1">${t('localEmployees')}</div>
                        <div class="text-3xl font-bold text-white">${layoff.totalEmployees.toLocaleString()}</div>
                    </div>
                    ` : ''}
                    ${layoff.totalGroupEmployees ? `
                    <div class="${layoff.totalEmployees ? 'mt-3 pt-3 border-t border-white/10' : ''}">
                        <div class="text-lg text-white/70 mb-1">${t('groupEmployees')}</div>
                        <div class="text-3xl font-bold text-white">${layoff.totalGroupEmployees.toLocaleString()}</div>
                    </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        
        ${notes ? `
            <div class="mb-6">
                <h3 class="text-xl font-semibold text-white mb-3">${t('notes')}</h3>
                <p class="text-white/80 leading-relaxed">${notes}</p>
            </div>
        ` : ''}
        
        ${layoff.compensation && (layoff.compensation.severancePay || layoff.compensation.bonusPackage || layoff.compensation.support) ? `
            <div class="mb-6">
                <h3 class="text-xl font-semibold text-white mb-3">${t('compensationDetails')}</h3>
                <div class="glass-card p-4 rounded-xl space-y-3">
                    ${layoff.compensation.severancePay ? `
                        <div class="flex items-start gap-3">
                            <span class="text-green-400 text-xl">✓</span>
                            <div>
                                <div class="text-white font-semibold">${t('severancePay')}</div>
                                ${layoff.compensation.severanceMonths ? `
                                    <div class="text-white/70 text-sm">${layoff.compensation.severanceMonths} ${t('months')}</div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    ${layoff.compensation.bonusPackage ? `
                        <div class="flex items-start gap-3">
                            <span class="text-green-400 text-xl">✓</span>
                            <div>
                                <div class="text-white font-semibold">${t('bonusPackage')}</div>
                                ${layoff.compensation.bonusAmountRO || layoff.compensation.bonusAmount ? `
                                    <div class="text-white/70 text-sm">${lang === 'ro' ? (layoff.compensation.bonusAmountRO || layoff.compensation.bonusAmount) : layoff.compensation.bonusAmount}</div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    ${layoff.compensation.support ? `
                        <div class="flex items-start gap-3">
                            <span class="text-green-400 text-xl">✓</span>
                            <div>
                                <div class="text-white font-semibold">${t('support')}</div>
                                ${layoff.compensation.supportDetailsRO || layoff.compensation.supportDetails ? `
                                    <div class="text-white/70 text-sm">${lang === 'ro' ? (layoff.compensation.supportDetailsRO || layoff.compensation.supportDetails) : layoff.compensation.supportDetails}</div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : ''}
        
        <div class="flex items-start justify-between pt-6 border-t border-white/20 flex-col sm:flex-row gap-4">
            <div class="flex-1">
                <div class="text-sm text-white/70 mb-2">${sources.length > 1 ? t('sources') : t('source')}</div>
                <div class="flex flex-col gap-2">
                    ${sources.map(source => `
                        <a 
                            href="${source.url}" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-2 text-sm"
                        >
                            <span>${source.name}</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                        </a>
                    `).join('')}
                </div>
            </div>
            <button onclick="closeModal()" class="glass-btn px-6 py-2 rounded-lg text-white hover:bg-white/20 transition-all self-start">
                ${t('close')}
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('companyModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

// Make closeModal globally available
window.closeModal = closeModal;

// Update charts with filtered data
function updateMainCharts() {
    // Call the charts.js updateCharts function directly to avoid recursion
    if (window.updateChartsData) {
        window.updateChartsData(filteredLayoffs);
    } else if (window.renderCharts && typeof window.renderCharts === 'function') {
        // Fallback to wrapper function
        window.renderCharts(filteredLayoffs);
    }
}

// Show error message
function showError(message) {
    const grid = document.getElementById('companyGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="col-span-full glass-card p-8 rounded-2xl text-center">
                <p class="text-red-400 text-lg">${message}</p>
            </div>
        `;
    }
}


// Setup view mode toggle
function setupViewToggle() {
    const viewToggle = document.getElementById('viewToggle');
    const viewToggleText = document.getElementById('viewToggleText');
    const viewToggleIcon = document.getElementById('viewToggleIcon');
    
    if (!viewToggle) return;
    
    viewToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        currentViewMode = currentViewMode === 'grid' ? 'list' : 'grid';
        viewToggle.setAttribute('data-view', currentViewMode);
        
        if (viewToggleText) {
            viewToggleText.textContent = currentViewMode === 'grid' ? t('gridView') : t('listView');
        }
        
        if (viewToggleIcon) {
            viewToggleIcon.textContent = currentViewMode === 'grid' ? '⊞' : '☰';
        }
        
        renderCompanyCards();
    });
}

// Setup timeline toggle
function setupTimelineToggle() {
    const timelineToggle = document.getElementById('timelineToggle');
    const timelineToggleText = document.getElementById('timelineToggleText');
    
    if (!timelineToggle) return;
    
    // Get initial view mode from data attribute
    let timelineView = timelineToggle.getAttribute('data-view') || 'months';
    
    // Set initial button text
    if (timelineToggleText) {
        timelineToggleText.textContent = timelineView === 'months' ? t('viewByYears') : t('viewByMonths');
    }
    
    timelineToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        timelineView = timelineView === 'months' ? 'years' : 'months';
        timelineToggle.setAttribute('data-view', timelineView);
        
        if (timelineToggleText) {
            timelineToggleText.textContent = timelineView === 'months' ? t('viewByYears') : t('viewByMonths');
        }
        
        // Re-render chart with new view
        if (window.updateChartsData && filteredLayoffs.length > 0) {
            window.updateTimelineChart(filteredLayoffs, timelineView);
        }
    });
}

// Setup chart view toggle
function setupChartViewToggle() {
    const toggle1 = document.getElementById('chartViewToggle');
    const toggle2 = document.getElementById('chartViewToggle2');
    const toggle3 = document.getElementById('chartViewToggle3');
    const chartTitle = document.getElementById('chartTitle');
    const toggleText = document.getElementById('chartViewToggleText');
    
    if (!toggle1 || !toggle2 || !toggle3) return;
    
    let currentView = toggle1.getAttribute('data-view') || 'year';
    
    const updateActiveButton = (activeView) => {
        [toggle1, toggle2, toggle3].forEach(toggle => {
            const view = toggle.getAttribute('data-view');
            if (view === activeView) {
                toggle.classList.remove('text-white/70');
                toggle.classList.add('text-white', 'bg-white/10');
            } else {
                toggle.classList.remove('text-white', 'bg-white/10');
                toggle.classList.add('text-white/70');
            }
        });
        
        // Update title
        if (chartTitle) {
            if (activeView === 'year') {
                chartTitle.setAttribute('data-i18n', 'yearlyStats');
                chartTitle.textContent = t('yearlyStats');
            } else if (activeView === 'category') {
                chartTitle.setAttribute('data-i18n', 'categoryChart');
                chartTitle.textContent = t('categoryChart');
            } else if (activeView === 'location') {
                chartTitle.setAttribute('data-i18n', 'locationChart');
                chartTitle.textContent = t('locationChart');
            }
        }
    };
    
    const handleToggle = (view) => {
        currentView = view;
        toggle1.setAttribute('data-view', view);
        toggle2.setAttribute('data-view', view);
        toggle3.setAttribute('data-view', view);
        updateActiveButton(view);
        
        // Re-render chart with new view
        if (window.updateCompanyChart && filteredLayoffs.length > 0) {
            window.updateCompanyChart(filteredLayoffs, view);
        }
    };
    
    toggle1.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle('year');
    });
    
    toggle2.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle('category');
    });
    
    toggle3.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle('location');
    });
    
    // Set initial state
    updateActiveButton(currentView);
}

// Make renderCompanyCards globally available
window.renderCompanyCards = renderCompanyCards;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

