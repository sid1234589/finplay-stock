// Initialize user's portfolio and balance
let userBalance = parseFloat(localStorage.getItem("initialInvestment")) || 100000;
let portfolio = [];

// DOM elements
const balanceElement = document.getElementById('userBalance');
const stockList = document.getElementById('stockList');
const portfolioList = document.getElementById('portfolioList');
const stockSelect = document.getElementById('stockSelect');
const shareAmount = document.getElementById('shareAmount');
const portfolioValue = document.getElementById('portfolioValue');
const totalGain = document.getElementById('totalGain');
const stockInfo = document.getElementById('stockInfo');

// Initialize the page
function initializePage() {
    updateStockList();
    populateStockSelect();
    updatePortfolio();
    updatePortfolioSummary();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Update the stock list display
function updateStockList() {
    stockList.innerHTML = '';
    stockData.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'stock-item';
        stockItem.innerHTML = `
            <div>${stock.symbol} - ${stock.name}</div>
            <div>${formatCurrency(stock.price)}</div>
            <div class="${stock.change >= 0 ? 'price-up' : 'price-down'}">
                ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
            </div>
        `;
        stockItem.addEventListener('click', () => selectStock(stock.symbol));
        stockList.appendChild(stockItem);
    });
}

// Select a stock for trading
function selectStock(symbol) {
    stockSelect.value = symbol;
    updateStockInfo(symbol);
}

// Update stock info in trading panel
function updateStockInfo(symbol) {
    const stock = stockData.find(s => s.symbol === symbol);
    if (stock) {
        stockInfo.innerHTML = `
            <div>Current Price: ${formatCurrency(stock.price)}</div>
            <div class="${stock.change >= 0 ? 'price-up' : 'price-down'}">
                Today's Change: ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
            </div>
        `;
    } else {
        stockInfo.innerHTML = '';
    }
}

// Populate the stock select dropdown
function populateStockSelect() {
    stockSelect.innerHTML = '<option value="">Select a stock to trade</option>';
    stockData.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock.symbol;
        option.textContent = `${stock.symbol} - ${stock.name}`;
        stockSelect.appendChild(option);
    });
}

// Calculate total portfolio value and gain/loss
function updatePortfolioSummary() {
    let totalValue = 0;
    let totalCost = 0;

    portfolio.forEach(item => {
        const stock = stockData.find(s => s.symbol === item.symbol);
        totalValue += stock.price * item.shares;
        totalCost += item.avgPrice * item.shares;
    });

    const totalGainValue = totalValue - totalCost;
    const gainPercentage = totalCost > 0 ? (totalGainValue / totalCost) * 100 : 0;

    portfolioValue.textContent = formatCurrency(totalValue);
    totalGain.textContent = `${gainPercentage >= 0 ? '+' : ''}${gainPercentage.toFixed(2)}%`;
    totalGain.className = gainPercentage >= 0 ? 'price-up' : 'price-down';
}

// Update portfolio display
function updatePortfolio() {
    portfolioList.innerHTML = '';
    portfolio.forEach(item => {
        const stock = stockData.find(s => s.symbol === item.symbol);
        const currentValue = stock.price * item.shares;
        const gainLoss = ((stock.price - item.avgPrice) / item.avgPrice) * 100;
        
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.innerHTML = `
            <div>${item.symbol} - ${item.shares} shares</div>
            <div>${formatCurrency(currentValue)}</div>
            <div class="${gainLoss >= 0 ? 'price-up' : 'price-down'}">
                ${gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}%
            </div>
        `;
        portfolioList.appendChild(portfolioItem);
    });
    updatePortfolioSummary();
}

// Buy stock function
function buyStock() {
    const symbol = stockSelect.value;
    const shares = parseInt(shareAmount.value);
    
    if (!symbol || !shares || shares <= 0) {
        alert('Please select a stock and enter a valid number of shares.');
        return;
    }

    const stock = stockData.find(s => s.symbol === symbol);
    const totalCost = stock.price * shares;

    if (totalCost > userBalance) {
        alert('Insufficient funds for this transaction!');
        return;
    }

    userBalance -= totalCost;
    
    const existingPosition = portfolio.find(item => item.symbol === symbol);
    if (existingPosition) {
        const totalShares = existingPosition.shares + shares;
        const totalCostBasis = (existingPosition.shares * existingPosition.avgPrice) + totalCost;
        existingPosition.shares = totalShares;
        existingPosition.avgPrice = totalCostBasis / totalShares;
    } else {
        portfolio.push({
            symbol: symbol,
            shares: shares,
            avgPrice: stock.price
        });
    }

    updateUI();
    shareAmount.value = '';
    stockSelect.value = '';
    stockInfo.innerHTML = '';
}

// Sell stock function
function sellStock() {
    const symbol = stockSelect.value;
    const shares = parseInt(shareAmount.value);
    
    if (!symbol || !shares || shares <= 0) {
        alert('Please select a stock and enter a valid number of shares.');
        return;
    }

    const position = portfolio.find(item => item.symbol === symbol);
    if (!position || position.shares < shares) {
        alert('Not enough shares to sell!');
        return;
    }

    const stock = stockData.find(s => s.symbol === symbol);
    const saleValue = stock.price * shares;

    userBalance += saleValue;
    position.shares -= shares;

    if (position.shares === 0) {
        portfolio = portfolio.filter(item => item.symbol !== symbol);
    }

    updateUI();
    shareAmount.value = '';
    stockSelect.value = '';
    stockInfo.innerHTML = '';
}

// Update UI elements
function updateUI() {
    balanceElement.textContent = formatCurrency(userBalance).slice(1); // Remove the dollar sign as it's in the HTML
    updatePortfolio();
    updateStockList();
}

// Listen for stock selection changes
stockSelect.addEventListener('change', (e) => {
    updateStockInfo(e.target.value);
});

// Simulate price updates with more realistic market behavior
function simulatePriceUpdates() {
    setInterval(() => {
        stockData.forEach(stock => {
            // More realistic price changes based on current price
            const volatility = 0.02; // 2% maximum change
            const change = (Math.random() - 0.5) * volatility * 2;
            stock.price *= (1 + change);
            stock.change = change * 100;
        });
        updateUI();
    }, 5000); // Update every 5 seconds
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    simulatePriceUpdates();
});
