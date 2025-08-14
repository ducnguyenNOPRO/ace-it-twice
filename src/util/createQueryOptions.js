import { queryOptions } from "@tanstack/react-query"
import { getTransactions } from "../api/transactions"
import { getAccounts } from "../api/accounts"
export function createTransactionsQueryOptions(params = {}, options = {}) {
    return queryOptions({
        ...options, 
        queryKey: ["transactions", params],
        queryFn: () => getTransactions(params),
    })
}

export function createAccountsQueryOptions(params = {}, options = {}) {
    return queryOptions({
        ...options, 
        queryKey: ["accounts", params],
        queryFn: () => getAccounts(params),
    })
}