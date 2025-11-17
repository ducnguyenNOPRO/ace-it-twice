import { queryOptions } from "@tanstack/react-query"
import { getTransactionsFilteredPaginated, getRecentTransactions, getMonthlyTransactions, get3MonthTransactionsPerCategory } from "../api/transactions"
import { getAccounts } from "../api/accounts"
import { getGoals } from "../api/goal";
import { getAverageBudget, getBudgets } from "../api/budget";

export function createTransactionsQueryOptions(
    params = {}, options = {}
) {
    const { itemId, pagination, filters} = params;
    
    return queryOptions({
        ...options, 
        queryKey: [
            "transactions",
            itemId,
            pagination ,
            filters
        ],
        queryFn: () => getTransactionsFilteredPaginated({itemId, pagination, filters}),
    })
}

export function createRecentTransactionsQueryOptions(
    params = {}, options = {}
) {
    const { itemId } = params;
    const limit = 3;
    
    return queryOptions({
        ...options, 
        queryKey: [
            "recentTransactions",
            itemId,
        ],
        queryFn: () => getRecentTransactions({itemId, limit}),
    })
}

export function createMonthlyTransactionsQueryOptions(
    params = {}, options = {}
) {
    const { itemId, date} = params;
    
    return queryOptions({
        ...options, 
        queryKey: [
            "monthlyTransactions",
            itemId,
            date
        ],
        queryFn: () => getMonthlyTransactions({itemId, date}),
    })
}

export function create3MonthTransactionsPerCategoryQueryOptions(
    params = {}, options = {}
) {
    const { itemId, category, date } = params;
    
    return queryOptions({
        ...options, 
        queryKey: [
            "transactionsPerCategory",
            itemId,
            category,
            date
        ],
        queryFn: () => get3MonthTransactionsPerCategory({itemId, category, date}),
    })
}

export function createAccountsQueryOptions(params = {}, options = {}) {
    const { itemId } = params;
    return queryOptions({
        ...options, 
        queryKey: ["accounts", itemId],
        queryFn: () => getAccounts(params),
    })
}

export function createGoalsQueryOptions(
    params = {}, options = {}
) { 
    return queryOptions({
        ...options, 
        queryKey: ["goals", params],
        queryFn: () => getGoals(),
    })
}

export function createBudgetsQueryOptions(
    params = {}, options = {}
) { 
    return queryOptions({
        ...options, 
        queryKey: ["budgets", params],
        queryFn: () => getBudgets(params),
    })
}

export function createAverageBudgetsQueryOptions(
    params = {}, options = {}
) { 
    return queryOptions({
        ...options, 
        queryKey: ["averageBudget", params],
        queryFn: () => getAverageBudget(params),
    })
}