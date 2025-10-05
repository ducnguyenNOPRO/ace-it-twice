const { HttpsError } = require('firebase-functions/v2/https');

// Ignore filter instead of throw error
const validateDate = (dateStr, fieldName) => {
    if (!dateStr) return;
    if (typeof dateStr !== 'string') {
        console.error(`${fieldName} must be a string`);
        return dateStr = null;
    }

    // format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
        console.error(`${fieldName} must be in YYYY-MM-DD format`);
        return dateStr = null;
    }

    // Validate it's a real date
    const date = new Date(dateStr + 'T00:00:00.000Z'); // Add time to avoid timezone issues
    if (isNaN(date.getTime())) {
        console.error(`Invalid ${fieldName} date`);
        return dateStr = null;
    }

    // Optional
    const year = parseInt(dateStr.split('-')[0]);
    if (year < 1900 || year > 2100) {
        console.error("invalid-argument", `${fieldName} year must be between 1900 and 2100`);
        return dateStr = null;
    }

    return dateStr; // Original string
}

const validateFilters = (filters) => {
    let {
        name,
        account,
        startDate,
        endDate,
        category,
        minAmount,
        maxAmount
    } = filters;

    // Always passed as empty string
    name = name || null;
    account = account || null;
    category = category || null;
    startDate = startDate || null;
    endDate = endDate || null;
    minAmount = minAmount || null;
    maxAmount = maxAmount || null;

    // merchant name
    if (name) {
        if (typeof name !== 'string') {
            name = null;
            console.error("name must be a string")
        }
        name = name.trim().slice(0, 30).toLowerCase(); // Auto-fix length
        if (!name) name = null;
    }

    // Account name
    if (account) {
        if (typeof account !== 'string') {
            account = null;
            console.error("Account must be a string");
        }
        account = account.trim().slice(0, 50);
        if (!account) account = null;
    }

    startDate = validateDate(startDate, 'startDate');
    endDate = validateDate(endDate, 'endDate')

    // date range
    if (startDate && endDate && startDate > endDate) {
        throw new HttpsError("invalid-argument", "startDate cannot be after endDate");
    }

    // Category 
    if (category) {
        if (typeof category !== 'string') {
            category = null;
            console.error("Category must be a string");
        }
        category = category.trim().slice(0, 20);
        if (!category) category = null;
    }

    if (minAmount) {
        minAmount = parseFloat(minAmount);
        if (isNaN(minAmount)) {
            minAmount = null;
            console.error("Minimum Amount must be a number")
        }
    }

    if (maxAmount) {
        maxAmount = parseFloat(maxAmount);
        if (isNaN(maxAmount)) {
            maxAmount = null;
            console.error("Maximum Amount must be a number")
        }
    }

    if (minAmount && maxAmount && minAmount > maxAmount) {
        throw new HttpsError("invalid-argument", "Minimum amount cannot be greater than maximum amount");
    }

    return {
        name,
        account,
        startDate,
        endDate,
        category,
        minAmount,
        maxAmount
    };
};

module.exports = { validateFilters };