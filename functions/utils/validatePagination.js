const { HttpsError } = require("firebase-functions/https");

// Future used if put pagination in URL 
const validatePagination = ({ page, pageSize }) => {
    const pageSizeOption = [5, 10, 25]
    if (isNaN(page)) {
        throw new HttpsError("invalid-argument", "page must be a number in range 0-50");
    }
    if (isNaN(pageSize)) {
        throw new HttpsError("invalid-argument", "page size must be a number in range [5,10,25]");
    }
    page = Math.max(0, Math.min(parseInt(page) || 0, 50)); // Limit to 50
    pageSize = pageSizeOption.includes(pageSize) ? pageSize : 5;
    return { page, pageSize };
}
module.exports = { validatePagination };