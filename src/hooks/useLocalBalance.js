import { createAccountsQueryOptions, createGoalsQueryOptions } from "../util/createQueryOptions"
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import calculateBalance from "../util/calculateLocalBalance";
export default function useLocalBalance(itemId) {
    const { data: accountsResponse = [] } = useQuery(
        createAccountsQueryOptions({ itemId },
        {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false
            }))
    const { data: goalsListResponse } = useQuery(
        createGoalsQueryOptions(
            {},
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }));
    
    const goalsList = goalsListResponse?.goals ?? [];
    const accounts = accountsResponse ?? [];

    const localAccountsBalance = useMemo(() => calculateBalance(accounts, goalsList), [accounts, goalsList]);
    return localAccountsBalance;
}