import { format } from "date-fns";
import prettyMapCategory from "../constants/prettyMapCategory";

// For all category
export const getMonthlySpendingData = (transactions) =>  {
    if (!transactions || transactions.length == 0) return [];
    const spendingOnly = transactions.filter(tx => tx.amount < 0)  
    const monthlyTotals = {};   // { {date: MMM d, total: string} }

    spendingOnly.forEach(tx => {
        const date = format(new Date(tx.date), "MMM d");   // "Oct 1"
        monthlyTotals[date] = (monthlyTotals[date] || 0) + tx.amount;
    });

    const sorted = Object.entries(monthlyTotals)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, total]) => ({ date, total: Math.round(total) * -1}));
    return sorted;
}

// For a specific category
export const getMonthlySpendingDataPerCategory = (transactions, category) =>  {
    if (!transactions || transactions.length == 0 || !category) return [];

    const spendingOnly = transactions.filter(tx => tx.amount < 0 && tx.category === category)  
    const monthlyTotals = {};   // { {date: MMM d, total: string} }

    spendingOnly.forEach(tx => {
        const date = format(new Date(tx.date), "MMM d");   // "Oct 1"
        monthlyTotals[date] = (monthlyTotals[date] || 0) + tx.amount;
    });

    const sorted = Object.entries(monthlyTotals)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, total]) => ({ date, total: (total) * -1}));
    return sorted;
}

export const getSpendingDataByCategory = (transactions) => {
    if (!transactions || transactions.length == 0) return [];

    const spendingOnly = transactions.filter(tx => tx.amount < 0)  
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

    totalSpending = totalSpending * -1;

    const sorted = Object.entries(categoriesTotal)    // [[category1, {total, icon, color}], ...]
        .sort((a, b) => b[1].total - a[1].total)
        .map(([category, data]) => ({
            category,
            total: data.total.toFixed(0) * -1,
            percent: Math.round((data.total / totalSpending) * 100) * -1,
            icon: data.icon,
            color: data.color
    }));
    return { totalSpending, sorted };
}

export const getSpendingDataByCategorySorted = (transactions) => {
    if (!transactions || transactions.length == 0) return [];

    const spendingOnly = transactions.filter(tx => tx.amount < 0)  
    const categoriesTotal = {};  // <String: {total, icon, color}>

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
    })

    const sorted = Object.entries(categoriesTotal) // [[category1, {total, icon, color}], ...]
        .sort((a, b) => b[1].total - a[1].total)
        .reduce((acc, [category, data]) => {
            acc[category] = {
                total: (data.total * -1),
                icon: data.icon,
                color: data.color,
            };
            return acc;
    }, {});
    return sorted;
}