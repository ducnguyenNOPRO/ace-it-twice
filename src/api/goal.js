import showToastDuringAsync from "../util/showToastDuringAsync";
import { functions } from "../firebase/firebase";
import { httpsCallable } from "firebase/functions";
export async function getGoals(params = {}) {
    const getGoals = httpsCallable(functions, "getGoals");
    try {
        const { data } = await getGoals(params);
        return data;
    } catch (error) {
        console.error('Firebase function error:', error);
        throw error;
    }
}

export async function addGoal(goalData, linkedAccount, onClose) {
    if (!goalData) throw new Error("Frontend: Missing goal to add");
    if (!linkedAccount) throw new Error("Frontend: Missing account to add");

    const addGoal = httpsCallable(functions, "addGoal");
    await showToastDuringAsync(
        addGoal({ goalData, linkedAccount }),
        {
            loadingMessage: "Adding goal...",
            successMessage: "Goal added successfully",
            errorMessage: "Failed to add goal. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function addGoalFund(goalToUpdateId, goalData, onClose) {
    if (!goalToUpdateId) throw new Error("Frontend: Missing goalId");
    if (!goalData) throw new Error("Frontend: Missing goal to add fund");

    const addGoalFund = httpsCallable(functions, "addGoalFund");
    await showToastDuringAsync(
        addGoalFund({ goalToUpdateId, goalData }),
        {
            loadingMessage: "Saving goal...",
            successMessage: "Fund added successfully",
            errorMessage: "Failed to add fund to goal. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function withdrawalGoalFund(goalToUpdateId, goalData, onClose) {
    if (!goalToUpdateId) throw new Error("Frontend: Missing goalId");
    if (!goalData) throw new Error("Frontend: Missing goal to withdrawal");

    const withdrawalGoalFund = httpsCallable(functions, "withdrawalGoalFund");
    await showToastDuringAsync(
        withdrawalGoalFund({ goalToUpdateId, goalData }),
        {
            loadingMessage: "Saving goal...",
            successMessage: "Fund withdrawal successfully",
            errorMessage: "Failed to withdrawal fund from goal. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function editGoalById(goalToUpdateId, goalData, onClose) {
    if (!goalToUpdateId) throw new Error("Frontend: Missing goalId");
    if (!goalData) throw new Error("Frontend: Missing goal to update");

    console.log("ID", goalToUpdateId);
    console.log("Data", goalData);

    const editGoalById = httpsCallable(functions, "editGoalById");
    await showToastDuringAsync(
        editGoalById({ goalToUpdateId, goalData }),
        {
            loadingMessage: "Saving goal...",
            successMessage: "goal updated successfully",
            errorMessage: "Failed to update goal. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}