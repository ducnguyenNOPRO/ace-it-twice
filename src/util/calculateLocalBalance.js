export default function calculateBalance(accounts, goals) {
    if (!accounts || accounts.length == 0) return [];

    // Compute allocation fund for each goal item per account
    const allocationsByAccount = {};
    goals.forEach(g => {
        Object.entries(g.contributions || {}).forEach(([accountId, data]) => {
            if (!allocationsByAccount[accountId]) {
                allocationsByAccount[accountId] = 0;
            }
            allocationsByAccount[accountId] += data.amount;
        })})
    
    // Combine with accounts data
    return accounts.map(acc => {
        const allocated = allocationsByAccount[acc.account_id] || 0;

        return {
            accountId: acc.account_id,
            accountName: acc.name,
            availableBalance: acc.balances.available,
            allocatedAmount: allocated,
            computedBalance: acc.balances.available - allocated,
            subtype: acc.subtype,
            mask: acc.mask
        }
    })
}