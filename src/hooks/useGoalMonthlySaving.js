import { useMemo } from "react";

export default function useGoalMonthlySaving(goalItem) {
    return useMemo(() => {
        if (!goalItem) return 0;
        const now = new Date();
        const end = new Date(goalItem.target_date);

        const monthsLeft =
            (end.getFullYear() - now.getFullYear()) * 12 +
            (end.getMonth() - now.getMonth());
        
        if (monthsLeft <= 0) return 0; // passed target Date

        return Math.round((goalItem.target_amount - goalItem.saved_amount) / monthsLeft);
    }, [goalItem])
}