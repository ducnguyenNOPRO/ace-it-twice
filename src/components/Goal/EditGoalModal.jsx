import { useEffect, useRef, useState } from "react"
import { RiSparkling2Fill } from "react-icons/ri";
import useGoalMonthlySaving from "../../hooks/useGoalMonthlySaving";

export default function EditGoalModal({ goalItem, setEditMode }) {
    const nameRef = useRef(null);
    const targetAmountRef = useRef(null);
    const savedAmountRef = useRef(null);
    const dateRef = useRef(null);
    const [formValues, setFormValues] = useState(goalItem);
    const [errors, setErrors] = useState({});
    const goalMonthlySaving = useGoalMonthlySaving(formValues);
    useEffect(() => {
        setFormValues(goalItem);
    }, [goalItem])

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

        if (!formValues.saved_amount) {
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
    const handleSave = (e) => {
        e.preventDefault();

        if (validateInput()) {
            setEditMode(false);
        }
    }
    return (
        <>
            <form onSubmit={handleSave}>
                <div className="flex items-center gap-1">
                    <input
                        ref={nameRef}
                        name="goal_name"
                        maxLength="50"
                        value={formValues.goal_name}
                        placeholder="e. Dream Vacation"
                        onMouseOver={() => nameRef.current?.focus()}
                        onChange={(e) => setFormValues({...formValues, goal_name: e.target.value})}
                        className="text-[1.75rem] p-2 font-medium"
                        required
                    />
                    {errors.goal_name}
                    <button
                        className="ml-auto text-blue-500 cursor-pointer"
                        type="submit"
                    >
                        Save
                    </button>
                </div>
                <div className="px-4 py-2">
                    <div>
                        <span className="font-bold">Summary</span>
                        <div className="flex flex-col gap-1 mt-2 ">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={targetAmountRef}
                                    type="number"
                                    min={1}
                                    name="target_amount"
                                    value={formValues.target_amount}
                                    placeholder="Target Amount"
                                    onMouseOver={() => targetAmountRef.current?.focus()}
                                    onChange={(e) => setFormValues({...formValues, target_amount: e.target.value})}
                                    className="w-[40%] p-2 font-bold"
                                    required
                                />
                                <span>by</span>
                                <input
                                    ref={dateRef}
                                    name="target_date"
                                    type="date"
                                    value={formValues.target_date}
                                    placeholder="Target Date"
                                    onMouseOver={() => dateRef.current?.focus()}
                                    onChange={(e) => setFormValues({...formValues, target_date: e.target.value})}
                                    className="w-[40%] p-2 font-bold"
                                    required
                                />
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: `${(formValues.progress)}%` }}
                                ></div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
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
                                    className="w-[40%] p-2 font-bold"
                                    required
                                />
                                <span>Saved ({(formValues.saved_amount / formValues.target_amount * 100).toFixed(2)}%)</span>

                                <p>Started {formValues.start_date}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <div className="px-4">
                <div className="flex items-center justify-center gap-2 mt-5 hover:scale-125 transition-scale duration-500">
                    <RiSparkling2Fill className="text-blue-500"/>
                    <span>You need to save <b>${goalMonthlySaving}</b> this month</span>
                </div>
                <span className="inline-block h-px w-full bg-gray-400"></span>
            </div>
            {/* Errors Section */}
            <div>
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