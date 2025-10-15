export const getTotalGoalsSaving = (goalsList) => {
    if (!goalsList || goalsList.length == 0) return 0;
    return goalsList
        .map(goal => goal.saved_amount)
        .reduce((accumulator, current) => accumulator + current, 0);
}
