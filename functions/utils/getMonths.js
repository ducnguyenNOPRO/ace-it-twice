const getLast3Months = (currentYearMonth, limit) => {
    const [year, month] = currentYearMonth.split("-").map(Number);
    const months = [];

    for (let i = limit; i >= 0; i--) {
        const d = new Date(year, month - 1 - i); // JS month is 0-based
        const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months.push(formatted);
    }

    return months;
}

module.exports = {getLast3Months}