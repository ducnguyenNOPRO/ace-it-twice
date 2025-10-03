import { queryOptions } from "@tanstack/react-query"
import { getTransactionsFilteredPaginated, getRecentTransactions } from "../api/transactions"
import { getAccounts } from "../api/accounts"

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
    const { itemId } = params;
    
    return queryOptions({
        ...options, 
        queryKey: [
            "monthlyTransactions",
            itemId,
        ],
        queryFn: () => getMonthlyTransactions({itemId}),
    })
}

export function createAccountsQueryOptions(params = {}, options = {}) {
    return queryOptions({
        ...options, 
        queryKey: ["accounts", params],
        queryFn: () => getAccounts(params),
    })
}