import showToastDuringAsync from "../util/showToastDuringAsync";
import { functions } from "../firebase/firebase";
import { httpsCallable } from "firebase/functions";

export async function getBudgets(params = {}) {
    const getBudgets = httpsCallable(functions, "getBudgets");
    try {
        const { data } = await getBudgets(params);
        return data;
    } catch (error) {
        console.error('Firebase function error:', error);
        throw error;
    }
}

export async function addBudget(budgetData, onClose) {
    if (!budgetData) throw new Error("Frontend: Missing budget to add");

    const addBudget = httpsCallable(functions, "addBudget");
    await showToastDuringAsync(
        addBudget({ budgetData }),
        {
            loadingMessage: "Adding budget...",
            successMessage: "Budget added successfully",
            errorMessage: "Failed to add Budget. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function editBudgetById(budgetToUpdateId, budgetData, onClose) {
    if (!budgetToUpdateId) throw new Error("Frontend: Missing BudgetId");
    if (!budgetData) throw new Error("Frontend: Missing Budget to update");

    const editBudgetById = httpsCallable(functions, "editBudgetById");
    await showToastDuringAsync(
        editBudgetById({ budgetToUpdateId, budgetData }),
        {
            loadingMessage: "Saving Budget...",
            successMessage: "Budget updated successfully",
            errorMessage: "Failed to update Budget. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}