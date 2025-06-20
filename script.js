/**
 * Fidelity Investment Portfolio Builder
 * JavaScript Logic for Portfolio Calculations and Visualization
 */

// Portfolio Configuration Constants
const RISK_LEVELS = {
    1: { name: 'Conservative', multiplier: 100 },
    2: { name: 'Balanced', multiplier: 120 },
    3: { name: 'Aggressive', multiplier: 140 }
};

// Fund definitions for different complexity levels
const FUNDS = {
    // Level 1 - Simple
    simple: {
        stocks: [
            { name: 'Fidelity ZERO Total Market Index Fund', ticker: 'FZROX', percentage: 100 }
        ],
        bonds: [
            { name: 'Fidelity® US Bond Index Fund', ticker: 'FXNAX', percentage: 100 }
        ]
    },
    // Level 2 - Moderate (adds international)
    moderate: {
        stocks: [
            { name: 'Fidelity ZERO Total Market Index Fund', ticker: 'FZROX', percentage: 75 },
            { name: 'Fidelity ZERO International Index Fund', ticker: 'FZILX', percentage: 25 }
        ],
        bonds: [
            { name: 'Fidelity® US Bond Index Fund', ticker: 'FXNAX', percentage: 100 }
        ]
    },
    // Level 3 - Diversified (adds real estate and inflation-protected bonds)
    diversified: {
        stocks: [
            { name: 'Fidelity ZERO Total Market Index Fund', ticker: 'FZROX', percentage: 60 },
            { name: 'Fidelity ZERO International Index Fund', ticker: 'FZILX', percentage: 25 },
            { name: 'Fidelity® Real Estate Index Fund', ticker: 'FSRNX', percentage: 15 }
        ],
        bonds: [
            { name: 'Fidelity® US Bond Index Fund', ticker: 'FXNAX', percentage: 67 },
            { name: 'Fidelity Inflation-Protected Bond Fund', ticker: 'FIPSX', percentage: 33 }
        ]
    }
};

// Global variables for DOM elements and chart
let portfolioChart;
const ageInput = document.getElementById('age');
const simplicitySlider = document.getElementById('simplicity');
const riskLevelSlider = document.getElementById('riskLevel');
const stockPercentageDisplay = document.getElementById('stockPercentage');
const bondPercentageDisplay = document.getElementById('bondPercentage');
const fundListContainer = document.getElementById('fundList');

/**
 * Calculate stock percentage based on age and risk level
 * Formula: RISK_LEVEL - age = % of stocks
 * @param {number} age - User's age
 * @param {number} riskLevel - Risk level (1-3)
 * @returns {number} Stock percentage (0-100)
 */
function calculateStockPercentage(age, riskLevel) {
    const riskMultiplier = RISK_LEVELS[riskLevel].multiplier;
    let stockPercentage = riskMultiplier - age;
    
    // Ensure stock percentage doesn't exceed 100%
    return Math.min(Math.max(stockPercentage, 0), 100);
}

/**
 * Get fund configuration based on simplicity level
 * @param {number} simplicityLevel - Simplicity level (1-3)
 * @returns {object} Fund configuration object
 */
function getFundConfiguration(simplicityLevel) {
    switch (simplicityLevel) {
        case 1: return FUNDS.simple;
        case 2: return FUNDS.moderate;
        case 3: return FUNDS.diversified;
        default: return FUNDS.simple;
    }
}

/**
 * Calculate detailed portfolio breakdown
 * @param {number} stockPercentage - Total stock allocation percentage
 * @param {number} bondPercentage - Total bond allocation percentage
 * @param {object} fundConfig - Fund configuration object
 * @returns {array} Array of fund allocations
 */
function calculatePortfolioBreakdown(stockPercentage, bondPercentage, fundConfig) {
    const breakdown = [];
    
    // Calculate stock fund allocations
    fundConfig.stocks.forEach(fund => {
        const allocation = (stockPercentage * fund.percentage) / 100;
        breakdown.push({
            name: fund.name,
            ticker: fund.ticker,
            allocation: allocation,
            type: 'stock'
        });
    });
    
    // Calculate bond fund allocations
    fundConfig.bonds.forEach(fund => {
        const allocation = (bondPercentage * fund.percentage) / 100;
        breakdown.push({
            name: fund.name,
            ticker: fund.ticker,
            allocation: allocation,
            type: 'bond'
        });
    });
    
    return breakdown;
}

/**
 * Update the portfolio display with new calculations
 */
function updatePortfolio() {
    // Get current input values
    const age = parseInt(ageInput.value);
    const simplicityLevel = parseInt(simplicitySlider.value);
    const riskLevel = parseInt(riskLevelSlider.value);
    
    // Validate age input
    if (isNaN(age) || age < 18 || age > 100) {
        return; // Don't update if age is invalid
    }
    
    // Calculate stock and bond percentages
    const stockPercentage = calculateStockPercentage(age, riskLevel);
    const bondPercentage = 100 - stockPercentage;
    
    // Update percentage displays
    stockPercentageDisplay.textContent = `${stockPercentage}%`;
    bondPercentageDisplay.textContent = `${bondPercentage}%`;
    
    // Get fund configuration and calculate breakdown
    const fundConfig = getFundConfiguration(simplicityLevel);
    const portfolioBreakdown = calculatePortfolioBreakdown(stockPercentage, bondPercentage, fundConfig);
    
    // Update fund list display
    updateFundList(portfolioBreakdown);
    
    // Update pie chart
    updatePieChart(portfolioBreakdown);
}

/**
 * Update the fund list display
 * @param {array} portfolioBreakdown - Array of fund allocations
 */
function updateFundList(portfolioBreakdown) {
    fundListContainer.innerHTML = '';
    
    portfolioBreakdown.forEach(fund => {
        if (fund.allocation > 0) { // Only show funds with allocation > 0
            const fundElement = document.createElement('div');
            fundElement.className = `fund-item ${fund.type}`;
            
            fundElement.innerHTML = `
                <div class="fund-info">
                    <div class="fund-name">${fund.name}</div>
                    <div class="fund-ticker">${fund.ticker}</div>
                </div>
                <div class="fund-allocation">${fund.allocation.toFixed(1)}%</div>
            `;
            
            fundListContainer.appendChild(fundElement);
        }
    });
}

/**
 * Update the pie chart with new portfolio data
 * @param {array} portfolioBreakdown - Array of fund allocations
 */
function updatePieChart(portfolioBreakdown) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    
    // Prepare data for chart
    const labels = [];
    const data = [];
    const colors = [];
    
    // Color palette for different fund types
    const stockColors = ['#3498db', '#2980b9', '#1f77b4'];
    const bondColors = ['#e74c3c', '#c0392b', '#d62728'];
    
    let stockColorIndex = 0;
    let bondColorIndex = 0;
    
    portfolioBreakdown.forEach(fund => {
        if (fund.allocation > 0) {
            labels.push(`${fund.ticker}`);
            data.push(fund.allocation);
            
            if (fund.type === 'stock') {
                colors.push(stockColors[stockColorIndex % stockColors.length]);
                stockColorIndex++;
            } else {
                colors.push(bondColors[bondColorIndex % bondColors.length]);
                bondColorIndex++;
            }
        }
    });
    
    // Destroy existing chart if it exists
    if (portfolioChart) {
        portfolioChart.destroy();
    }
    
    // Create new chart
    portfolioChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const fund = portfolioBreakdown[context.dataIndex];
                            return `${fund.name}: ${context.parsed.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Add event listeners to all input controls
 */
function initializeEventListeners() {
    // Age input listener
    ageInput.addEventListener('input', updatePortfolio);
    
    // Simplicity slider listener
    simplicitySlider.addEventListener('input', updatePortfolio);
    
    // Risk level slider listener
    riskLevelSlider.addEventListener('input', updatePortfolio);
    
    // Also listen for change events to ensure all interactions are captured
    ageInput.addEventListener('change', updatePortfolio);
    simplicitySlider.addEventListener('change', updatePortfolio);
    riskLevelSlider.addEventListener('change', updatePortfolio);
}

/**
 * Initialize the application
 */
function initializeApp() {
    // Set up event listeners
    initializeEventListeners();
    
    // Calculate and display initial portfolio
    updatePortfolio();
    
    console.log('Fidelity Portfolio Builder initialized successfully');
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);