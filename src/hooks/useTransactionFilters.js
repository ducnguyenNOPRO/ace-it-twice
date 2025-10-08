import { useSearchParams } from "react-router-dom";

export default function useTransactionFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const name = searchParams.get("name") || '';
    const account = searchParams.get("account") || '';
    const startDate = searchParams.get("startDate") || '';
    const endDate = searchParams.get("endDate") || '';
    const category = searchParams.get("category") || '';
    const minAmount = searchParams.get("minAmount") || '';
    const maxAmount = searchParams.get("maxAmount") || '';

    const setFilters = (filters) => {
        setSearchParams((params) => {
            // Create a new URLSearchParams object to avoid mutation issues
            const newParams = new URLSearchParams(params);
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    newParams.set(key, value);
                } else {
                    newParams.delete(key);
                }
            });          
            return newParams;
        });
    }

    return {
        name,
        account,
        startDate,
        endDate,
        category,
        minAmount,
        maxAmount,
        setFilters
    }
}