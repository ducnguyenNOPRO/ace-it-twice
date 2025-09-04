import { keyframes } from "@emotion/react";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export default function useTransactionFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const name = searchParams.get("name") || '';
    const account = searchParams.get("account") || '';
    const fromDate = searchParams.get("fromDate") || '';
    const toDate = searchParams.get("toDate") || '';
    const category = searchParams.get("category") || '';
    const minAmount = searchParams.get("minAmount") || '';
    const maxAmount = searchParams.get("maxAmount") || '';

    const setFilters = useCallback((filters) => {
        setSearchParams((params) => {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.set(key, value);
                } else {
                    params.delete(key); // Remove empty params from URL
                }
            })
            
            // if (filters.name !== undefined) {
            //     params.set("name", filters.name);
            // }

            // if (filters.account !== undefined) {
            //     params.set("account", filters.account);
            // }

            // if (filters.from !== undefined) {
            //     params.set("from", filters.from);
            // }

            // if (filters.to !== undefined) {
            //     params.set("to", filters.to);
            // }

            // if (filters.category !== undefined) {
            //     params.set("category", filters.category);
            // }

            // if (filters.minAmount !== undefined) {
            //     params.set("minAmount", filters.minAmount);
            // }

            // if (filters.maxAmount !== undefined) {
            //     params.set("maxAmount", filters.maxAmount);
            // }

            return params;
        });
    }, [])

    return {
        name,
        account,
        fromDate,
        toDate,
        category,
        minAmount,
        maxAmount,
        setFilters
    }
}