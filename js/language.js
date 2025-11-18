// Language management system
const translations = {
    en: {
        title: "Layoff Tracker",
        heroTitle: "Corporate Layoff Monitor",
        heroSubtitle: "Tracking workforce restructuring across the technology sector",
        totalAffected: "Total Employees Affected",
        timelineChart: "Layoffs Over Time",
        companyChart: "Top Companies by Layoffs",
        searchPlaceholder: "Search companies...",
        allLocations: "All Locations",
        allDates: "All Dates",
        companiesTitle: "Recent Layoffs",
        company: "Company",
        date: "Date",
        employeesAffected: "Employees Affected",
        location: "Location",
        totalEmployees: "Total Employees",
        source: "Source",
        notes: "Notes",
        viewDetails: "View Details",
        close: "Close",
        noResults: "No companies found matching your search criteria.",
        affected: "affected",
        employees: "employees",
        readMore: "Read more",
        country: "Country",
        allCountries: "All Countries",
        selectCountry: "Select Country",
        viewMode: "View Mode",
        gridView: "Grid",
        listView: "List",
        severancePay: "Severance Pay",
        bonusPackage: "Bonus Package",
        support: "Support",
        months: "months",
        hasCompensation: "With Compensation",
        noCompensation: "No Compensation",
        compensationDetails: "Compensation Details",
        filterByCompensation: "Filter by Compensation",
        totalCompanies: "Total Companies",
        allCompensation: "All Compensation",
        yearlyStats: "Romanian Employees by Year",
        totalConfirmed: "Total Confirmed",
        totalPotential: "Potentially Affected Employees",
        yearlyAverage: "Yearly Average",
        confirmed: "Confirmed",
        potential: "Potential",
        results: "results",
        result: "result",
        viewByMonths: "View by Months",
        viewByYears: "View by Years",
        company: "Company",
        employees: "Employees",
        date: "Date",
        location: "Location",
        compensation: "Compensation",
        category: "Category",
        allCategories: "All Categories",
        sources: "Sources",
        source: "Source",
        ofLocal: "of local",
        ofGroup: "of group",
        localEmployees: "Local Employees",
        groupEmployees: "Group Employees",
        percentage: "Percentage",
        categoryChart: "Top Categories by Layoffs",
        companyChart: "Top Companies by Layoffs",
        locationChart: "Top Locations by Layoffs",
        viewByCategory: "By Category",
        viewByCompany: "By Company",
        viewByLocation: "By Location",
        viewByYear: "By Year"
    },
    ro: {
        title: "Concedieri Romania",
        heroTitle: "Concedieri Romania",
        heroSubtitle: "Urmărirea restructurărilor forței de muncă în sectorul tehnologic",
        totalAffected: "Total Angajați Afectați",
        timelineChart: "Concedieri în Timp",
        companyChart: "Top Companii după Concedieri",
        searchPlaceholder: "Caută companii...",
        allLocations: "Toate Locațiile",
        allDates: "Toate Datele",
        companiesTitle: "Concedieri Recente",
        company: "Companie",
        date: "Data",
        employeesAffected: "Angajați Afectați",
        location: "Locație",
        totalEmployees: "Total Angajați",
        source: "Sursă",
        notes: "Note",
        viewDetails: "Vezi Detalii",
        close: "Închide",
        noResults: "Nu s-au găsit companii care să corespundă criteriilor de căutare.",
        affected: "afectați",
        employees: "angajați",
        readMore: "Citește mai mult",
        country: "Țară",
        allCountries: "Toate Țările",
        selectCountry: "Selectează Țara",
        viewMode: "Mod Vizualizare",
        gridView: "Grilă",
        listView: "Listă",
        severancePay: "Salarii Compensatorii",
        bonusPackage: "Pachet Bonus",
        support: "Sustinere",
        months: "luni",
        hasCompensation: "Cu Compensare",
        noCompensation: "Fără Compensare",
        compensationDetails: "Detalii Compensare",
        filterByCompensation: "Filtrează după Compensare",
        totalCompanies: "Total Companii",
        allCompensation: "Toate Compensările",
        yearlyStats: "Angajați Români pe Ani",
        totalConfirmed: "Total Confirmate",
        totalPotential: "Angajați Posibil Afectați",
        yearlyAverage: "Medie Anuală",
        confirmed: "Confirmate",
        potential: "Potențiale",
        results: "rezultate",
        result: "rezultat",
        viewByMonths: "Vezi pe Luni",
        viewByYears: "Vezi pe Ani",
        company: "Companie",
        employees: "Angajați",
        date: "Data",
        location: "Locație",
        compensation: "Compensare",
        category: "Categorie",
        allCategories: "Toate Categoriile",
        sources: "Surse",
        source: "Sursă",
        ofLocal: "din local",
        ofGroup: "din grup",
        localEmployees: "Angajați Local",
        groupEmployees: "Angajați Grup",
        percentage: "Procentaj",
        categoryChart: "Top Categorii după Concedieri",
        companyChart: "Top Companii după Concedieri",
        locationChart: "Top Locații după Concedieri",
        viewByCategory: "Pe Categorie",
        viewByCompany: "Pe Companie",
        viewByLocation: "Pe Locație",
        viewByYear: "Pe Ani"
    }
};

let currentLanguage = 'ro';

// Initialize language system
function initLanguage() {
    // Check for saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'en' || savedLang === 'ro')) {
        currentLanguage = savedLang;
    } else {
        // Default to Romanian if no preference saved
        currentLanguage = 'ro';
    }
    
    updateLanguageUI();
    translatePage();
    
    // Setup language toggle
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
}

// Toggle between languages
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ro' : 'en';
    localStorage.setItem('preferredLanguage', currentLanguage);
    updateLanguageUI();
    translatePage();
    
    // Re-render charts and cards if they exist
    if (window.updateChartsData && window.layoffData) {
        window.updateChartsData(window.layoffData);
    } else if (window.renderCharts) {
        window.renderCharts();
    }
    if (window.renderCompanyCards) {
        window.renderCompanyCards();
    }
    
    // Update timeline toggle text
    const timelineToggle = document.getElementById('timelineToggle');
    const timelineToggleText = document.getElementById('timelineToggleText');
    if (timelineToggle && timelineToggleText) {
        const viewMode = timelineToggle.getAttribute('data-view') || 'months';
        timelineToggleText.textContent = viewMode === 'months' ? t('viewByYears') : t('viewByMonths');
    }
}

// Update language UI elements
function updateLanguageUI() {
    const langText = document.getElementById('langText');
    const langFlag = document.getElementById('langFlag');
    
    if (langText) {
        langText.textContent = currentLanguage === 'en' ? 'RO' : 'EN';
    }
    
    if (langFlag) {
        langFlag.textContent = currentLanguage === 'en' ? '🇷🇴' : '🇬🇧';
    }
}

// Translate all elements with data-i18n attribute
function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });
}

// Get translation for a key
function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Get current language
function getCurrentLanguage() {
    return currentLanguage;
}

// Format date based on language
function formatDate(dateString, lang = currentLanguage) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    
    if (lang === 'ro') {
        return date.toLocaleDateString('ro-RO', options);
    }
    return date.toLocaleDateString('en-US', options);
}

// Make functions globally available
window.t = t;
window.getCurrentLanguage = getCurrentLanguage;
window.formatDate = formatDate;

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}

