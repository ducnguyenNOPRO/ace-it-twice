import { queryOptions } from "@tanstack/react-query"
import { getTransactionsFilteredPaginated } from "../api/transactions"
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

export function createAccountsQueryOptions(params = {}, options = {}) {
    return queryOptions({
        ...options, 
        queryKey: ["accounts", params],
        queryFn: () => getAccounts(params),
    })
}