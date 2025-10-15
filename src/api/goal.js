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

export async function addGoal(goalData, onClose) {
    if (!goalData) throw new Error("Frontend: Missing goal to add");

    const addGoal = httpsCallable(functions, "addGoal");
    await showToastDuringAsync(
        addGoal({ goalData }),
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

export async function editGoalById(goalToUpdateId, goalData, onClose) {
    if (!goalToUpdateId) throw new Error("Frontend: Missing goalId");
    if (!goalData) throw new Error("Frontend: Missing goal to update");

    const editgoalById = httpsCallable(functions, "editgoalById");
    await showToastDuringAsync(
        editgoalById({ goalToUpdateId, goalData }),
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