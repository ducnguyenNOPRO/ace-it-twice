const groupByCategory = (snapshot, months) => {
    const map = {}; // {category, months: []}

    snapshot.forEach(doc => {
        const data = doc.data();
        const { category, total_spent, year_month } = data;

        if (!map[category]) {
            map[category] = {
                category,
                months: months.map(m => ({
                    yearMonth: m,
                    totalSpent: 0
                }))
            }
        }

        // Find index of this doc's month in the months array
        const idx = months.indexOf(year_month);
        if (idx !== -1) {
            map[category].months[idx].totalSpent = total_spent;
        }
    });

    // Convert to Array + compute averages
    return Object.values(map).map(item => {
        // Filter out months with zero spending
        const filteredMonths = item.months.filter(m => m.totalSpent > 0);
        
        const avg = filteredMonths.length 
            ? filteredMonths.reduce((acc, m) => acc + m.totalSpent, 0) / filteredMonths.length
            : 0
        return {
            ...item,
            average: avg.toFixed(2)
        }
    });
}


module.exports = {groupByCategory}