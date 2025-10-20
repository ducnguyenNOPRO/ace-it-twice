import useGoalMonthlySaving from "../../hooks/useGoalMonthlySaving";
import { RiSparkling2Fill } from "react-icons/ri";
import { useEffect, useRef, useState } from "react"
import { editGoalById } from "../../api/goal";
import { useQueryClient } from "@tanstack/react-query";

export default function EditGoalModal({ selectedGoalItem, setSelectedGoalItem, setEditMode }) {
    const queryClient = useQueryClient();
    const nameRef = useRef(null);
    const targetAmountRef = useRef(null);
    const savedAmountRef = useRef(null);
    const dateRef = useRef(null);
    const [formValues, setFormValues] = useState(selectedGoalItem);
    const [errors, setErrors] = useState({});
    const goalMonthlySaving = useGoalMonthlySaving(formValues);
    useEffect(() => {
        setFormValues(selectedGoalItem);
    }, [selectedGoalItem])

    const validateInput = () => {
        const newErrors = {};
        if (!formValues.goal_name) {
            newErrors.goal_name = "Goal name is required";
        }

        if (!formValues.target_date) {
            newErrors.target_date = "Date is required";
        }

        // if (!formValues.linked_account) {
        //     newErrors.linked_account = "Please choose an account";
        // }

        if (!formValues.target_amount) {
            newErrors.target_amount = "Target amount is required";
        } else if (isNaN(Number(formValues.target_amount))) {
            newErrors.target_amount = "Amount must be a number";
        } else if (Number(formValues.target_amount) <= 0) {
            newErrors.target_amount = "Amount must be greater than 0";
        }

        if (formValues.saved_amount === "" || formValues.saved_amount === null || formValues.saved_amount === undefined) {
            newErrors.saved_amount = "Saved amount is required";
        } else if (isNaN(Number(formValues.saved_amount))) {
            newErrors.saved_amount = "Saved amount must be a number";
        } else if ((Number(formValues.saved_amount) > Number(formValues.target_amount))) {
            newErrors.saved_amount = "Saved amount should not exceed target amount"
        } else if (Number(formValues.saved_amount) < 0) {
            newErrors.saved_amount = "Saved amount must be greated than 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    
    const refetchGoalsItem = () => {
        queryClient.invalidateQueries({
            queryKey: ["goals"]
        })
    }

    const handleSave = async (e) => {
        e.preventDefault();

        if (!validateInput()) {
            return;
        }

        // Get local date not UTC
        const [year, month, day] = formValues.target_date.split("-");
        const targetDate = new Date(year, month - 1, day); // months are 0-indexed
        const targetDateFormatted = targetDate.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        // Get local date not UTC
        const now = new Date();
        const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        const targetAmount = Number(formValues.target_amount);
        const savedAmount = Number(formValues.saved_amount);

        let contributionArray = formValues.contributions;

        // reset contribution array when saved amount changed
        if (formValues.saved_amount !== selectedGoalItem.saved_amount) {
            contributionArray.length = 0;
            contributionArray.push({ date: startDate, amount: formValues.saved_amount }); 
        }

        const goalToUpdate = {
            ...formValues,
            saved_amount: savedAmount,
            target_amount: targetAmount,
            target_date_formatted: targetDateFormatted,
            progress: savedAmount / targetAmount * 100,
            contribution: contributionArray
        }

        await editGoalById(formValues.goal_id, goalToUpdate, () => setEditMode(false));
        
        refetchGoalsItem();
        setSelectedGoalItem(goalToUpdate);
    }
    return (
        <>
            <form onSubmit={handleSave}>
                <div className="flex-1">
                    <div className="flex items-center h-12 px-10 border-b border-gray-300 p-2">
                        <h1 className="text-2xl text-black font-medium">
                            Goal
                        </h1>
                        <div className="ml-auto">
                            <button
                                className="border py-1 px-3 text-blue-500 cursor-pointer mr-2"
                                type="submit"
                            >
                                Save
                            </button>
                            <button
                                className=" border py-1 px-3 text-blue-500 cursor-pointer"
                                onClick={() => setEditMode(false)}
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                    <div className="px-4 py-2 text-black">
                        <input
                            ref={nameRef}
                            name="goal_name"
                            maxLength="50"
                            value={formValues.goal_name}
                            placeholder="e. Dream Vacation"
                            onMouseOver={() => nameRef.current?.focus()}
                            onChange={(e) => setFormValues({...formValues, goal_name: e.target.value})}
                            className="text-3xl p-2 font-bold "
                            required
                        />
                        {errors.goal_name}

                        <div className="flex flex-col gap-1 my-5">
                            <p>Progress ({(formValues.progress).toFixed(2)}%)</p>
                            <div className="bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: `${(formValues.progress)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-5 hover:scale-125 transition-scale duration-500">
                            <RiSparkling2Fill className="text-blue-500"/>
                            <span className="text-black">You need to save <b>${goalMonthlySaving}</b> this month</span>
                        </div>

                        <span className="inline-block h-px w-full bg-gray-300 my-5"></span>

                        <div className="mb-5">
                            <h3 className="text-xl font-bold mb-2">Summary</h3>
                            <div className="grid grid-cols-2 gap-y-1">
                                <span className="text-gray-400 font-medium">Target Amount</span>
                                <input
                                    ref={targetAmountRef}
                                    type="number"
                                    min={1}
                                    name="target_amount"
                                    value={formValues.target_amount}
                                    placeholder="Target Amount"
                                    onMouseOver={() => targetAmountRef.current?.focus()}
                                    onChange={(e) => setFormValues({...formValues, target_amount: e.target.value})}
                                    className=" w-[50%] ml-auto p-1 font-medium"
                                    required
                                />

                                <span className="text-gray-400 font-medium">Saved Amount</span>
                                <input
                                    ref={savedAmountRef}
                                    type="number"
                                    min={0}
                                    max={formValues.target_amount}
                                    name="saved_amount"
                                    value={formValues.saved_amount}
                                    placeholder="Saved Amount"
                                    onMouseOver={() => savedAmountRef.current?.focus()}
                                    onChange={(e) => setFormValues({...formValues, saved_amount: e.target.value})}
                                    className="ml-auto w-[50%] p-1 font-medium"
                                    required
                                />

                                <span className="text-gray-400 font-medium">Start Date</span>
                                <span className="text-right font-medium">{selectedGoalItem.start_date}</span>   

                                <span className="text-gray-400 font-medium">Target Date</span>
                                 <input
                                    ref={dateRef}
                                    name="target_date"
                                    type="date"
                                    value={formValues.target_date}
                                    placeholder="Target Date"
                                    onMouseOver={() => dateRef.current?.focus()}
                                    onChange={(e) => setFormValues({...formValues, target_date: e.target.value})}
                                    className="ml-auto w-auto p-1 font-medium"
                                    required
                                />                          
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            {/* Errors Section */}
            <div className="px-4 py-2">
                {errors.goal_name && 
                    <span className="text-red-500">{errors.goal_name}</span>
                }
                {errors.target_amount && 
                    <span className="text-red-500">{errors.target_amount}</span>
                }
                {errors.saved_amount && 
                    <span className="text-red-500">{errors.saved_amount}</span>
                }
                {errors.target_date && 
                    <span className="text-red-500">{errors.target_date}</span>
                }
            </div>
        </>
    )
}