import { format } from "date-fns";
import prettyMapCategory from "../constants/prettyMapCategory";
export const getMonthlySpendingData = (transactions) =>  {
    // Positive amount = money out, spending
    // Negative amound = money in, income, refund, etc.
    const spendingOnly = transactions.filter(tx => tx.amount > 0)  
    const monthlyTotals = {};   // { {month1: totalAmount}, {month2: totalAmount}}

    spendingOnly.forEach(tx => {
        const month = format(new Date(tx.date), "MMM yyyy");   // "Jul 2025"
        monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
    });

    const sorted = Object.entries(monthlyTotals)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([month, total]) => ({ month, total: total.toFixed(0)}));
    
    return sorted;
}

export const getSpendingDataByCategory = (transactions) => {
    // Positive amount = money out, spending
    // Negative amound = money in, income, refund, etc.
    const spendingOnly = transactions.filter(tx => tx.amount > 0)  
    const categoriesTotal = {};  // <String: {total, icon, color}>
    let totalSpending = 0;

    spendingOnly.forEach(tx => {
        const category = tx.category;
        const mapped = prettyMapCategory[category];   // {icon, color}

        const icon = mapped.icon;
        const color = mapped.color;
        
        // If it's tracked, just add the total
        if (categoriesTotal[category]) {
            categoriesTotal[category].total += tx.amount
        } else {
            categoriesTotal[category] = {
                total: tx.amount,
                icon,
                color
            }
        }
        totalSpending += tx.amount
    })

    const sorted = Object.entries(categoriesTotal)    // [[category1, {total, icon, color}], ...]
        .sort((a, b) => b[1].total - a[1].total)
        .map(([category, data]) => ({
            category,
            total: data.total.toFixed(0),
            percent: Math.round((data.total / totalSpending) * 100),
            icon: data.icon,
            color: data.color
    }));
    return { totalSpending, sorted };
}