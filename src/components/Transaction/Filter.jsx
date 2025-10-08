import {useState } from "react";
import { useQuery} from "@tanstack/react-query"
import { IoIosOptions } from "react-icons/io";
import { createAccountsQueryOptions } from "../../util/createQueryOptions";
import prettyMapCategory from "../../constants/prettyMapCategory";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoSend } from "react-icons/io5";
import useTransactionFilters from "../../hooks/useTransactionFilters";
import { format } from "date-fns/format";
import { subDays } from "date-fns/subDays";
import { subMonths } from "date-fns/subMonths";

function AccountMenu({accounts, menu, toggleMenu, handleSetFilters}) {
    return (
        <>
            <button
                className="flex w-full px-1 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleMenu("account")}
            >
                <span className="text-black">Account</span>
                <span className="ml-auto">&gt;</span>
            </button>
            {menu === "account" && (
                <div className="absolute w-70 left-full top-0 ml-1 shadow-lg rounded-md bg-white text-black p-1 z-9999">
                    <ul className="list-none py-1">
                        {accounts.map((account) => {
                            const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
                            return (
                                <li
                                    key={account.name}
                                    className="flex items-center gap-2 px-3 py-1 hover:bg-blue-50 hover:text-blue-500 cursor-pointer"
                                    onClick={() => handleSetFilters("account", account.name)}
                                >
                                {/* Circle */}
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: randomColor }}
                                />
                                {/* Text */}
                                <span>{account.name} - {account.mask}</span>
                            </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </>
    )
}

function CategoryMenu({menu, toggleMenu, handleSetFilters}) {
    return (
        <>
            <button
                className="flex w-full px-1 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleMenu("category")}
            >
                <span className="text-black">Category</span>
                <span className="ml-auto">&gt;</span>
            </button>
            {menu === "category" && (
                <div className="absolute w-50 h-80 overflow-auto left-full top-0 ml-1 shadow-lg rounded-md bg-white text-black p-1 z-9999">
                    <ul className="list-none py-1">
                        {Object.entries(prettyMapCategory).map(([category, details]) => (
                            <li
                                key={category}
                                title={category}
                                className={`flex items-center gap-2 px-3 py-1
                                    ${details.hover}`}
                                onClick={() => handleSetFilters("category", category)}
                            >
                                <img
                                    src={details.icon}
                                    alt="Category Icon"
                                />
                                <span>{category}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}

function AmountMenu({ menu, toggleMenu, handleSetFilters }) {
    const [amountInputs, setAmountInputs] = useState({
        minAmount: "",
        maxAmount: ""
    })
    const [errors, setErrors] = useState();
    const isInputValidated = () => {        
        let newError = "";
        const minAmount = parseFloat(amountInputs.minAmount);
        const maxAmount = parseFloat(amountInputs.maxAmount);
        if (minAmount > maxAmount
            && maxAmount
        ) {
            newError = "Minimum amount is greater than maximum amount";
        }
        setErrors(newError);
        return newError.length === 0;
    } 
    const getInputValues = () => {
        let newInputs = { ...amountInputs };
        if (amountInputs.minAmount && amountInputs.maxAmount) {
            return newInputs;
        }
        if (amountInputs.minAmount) {
            newInputs.maxAmount = amountInputs.minAmount;
        } else if (amountInputs.maxAmount) {
            newInputs.minAmount = amountInputs.maxAmount;
        }
        setAmountInputs(newInputs);
        return newInputs;
    }
    return (
        <>
            <button
                className="flex w-full px-1 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleMenu("amount")}
            >
                <span className="text-black">Amount</span>
                <span className="ml-auto">&gt;</span>
            </button>
            {menu === "amount" && (
                <div className="absolute flex flex-col left-full top-0 ml-1 p-1 shadow-lg rounded-md bg-white text-black z-9999">
                    <div className="flex gap-2">
                        <TextField
                            type="number"
                            margin="dense"
                            label="Min"
                            name="minAmount"
                            value={amountInputs.minAmount}
                            onChange={(e) =>
                                setAmountInputs((prev) => ({ ...prev, minAmount: e.target.value }))}
                            size="small"
                            sx={{ width: '100px' }}
                            error={!!errors}
                            helperText={errors}
                        />
                        <TextField
                            type="number"
                            margin="dense"
                            label="Max"
                            name="maxAmount"
                            value={amountInputs.maxAmount}
                            onChange={(e) =>
                                setAmountInputs((prev) => ({ ...prev, maxAmount: e.target.value }))}
                            size="small"
                            sx={{
                                width: '100px'
                            }}
                        />
                    </div>

                    <Button
                        variant="outlined"
                        size="small"
                        endIcon={<IoSend />}
                        className="self-center"
                        sx={{
                            textTransform: "none", // disable all-caps
                        }}
                        onClick={() => {
                            if (isInputValidated()) {
                                const validatedInput = getInputValues();
                                handleSetFilters("amount", validatedInput);
                            }
                        }}
                    >
                        Filter
                    </Button>
                </div>
            )}
        </>
    )
}

function DateMenu({ menu, toggleMenu, handleSetFilters }) {
    const getDateRange = (dateOption) => {
        const now = new Date();
        let startDate;
        switch (dateOption) {
            case "7 days":
                startDate = subDays(now, 7);
                break;
            case "1 month":
                startDate = subMonths(now, 1);
                break;
            case "3 months":
                startDate = subMonths(now, 3);
                break;
            default:
                startDate = now;
        }
        return {
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(now, "yyyy-MM-dd")
        };
    }
    return (
        <>
            <button
                className="flex w-full px-1 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleMenu("date")}
            >
                <span className="text-black">Date</span>
                <span className="ml-auto">&gt;</span>
            </button>
            {menu === "date" && (
                <div className="absolute w-30 left-full top-0 ml-1 p-1 shadow-lg rounded-md bg-white text-black z-9999">
                    <ul className="list-none">
                        <li
                            className="p-2 hover:bg-blue-50 hover:text-blue-500"
                            onClick={() => {
                                let dateObject = getDateRange("7 days")
                                handleSetFilters("date", dateObject)
                            }}
                        >
                            Last 7 days
                        </li>
                        <li
                            className="p-2 hover:bg-blue-50 hover:text-blue-500"
                            onClick={() => {
                                let dateObject = getDateRange("1 month")
                                handleSetFilters("date", dateObject)
                            }}
                        >
                            Last 1 month
                        </li>
                        <li
                            className="p-2 hover:bg-blue-50 hover:text-blue-500"
                            onClick={() => {
                                let dateObject = getDateRange("3 months")
                                handleSetFilters("date", dateObject)
                            }}
                        >
                            Last 3 months
                        </li>
                    </ul>
                </div>
            )}
        </>
    )
}

export default function FilterTransaction({itemId, setAddFilterToUI, setPaginationModel, setLastDocumentIds, page, pageSize}) {
    const [isOpen, setIsOpen] = useState(false);
    const { setFilters } = useTransactionFilters();
    const [menu, setMenu] = useState(null);
    const { data: accounts = []} = useQuery(
        createAccountsQueryOptions({ itemId },
            {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false
    }))

    const toggleMenu = (menu) => {
        setMenu((prev) => (prev === menu ? null : menu))
    }

    // Add filter to display in the UI
    const addFilters = (type, value) => {
        setAddFilterToUI((prev) => {
            // Replace old filter type with new value
            const exist = prev.find(f => f.type === type)
            if (exist) {
                return prev.map(f => f.type === type ? { ...f, value } : f)
            } 
            
            // Add new filters
            return [...prev, { type, value }];
        })
    }
    const handleSetFiltersHelper = (type, value) => {
        if (type === "amount") {
            let minAmount = value.minAmount;
            let maxAmount = value.maxAmount;
            setFilters({ minAmount, maxAmount });
            return;
        } else if (type === "date") {
            let startDate = value.startDate;
            let endDate = value.endDate;
            setFilters({ startDate, endDate });
            return;
        }

        // For account, category
        setFilters({ [type]: value });
    }

    // Change filters in URL params
    const handleSetFilters = (type, value) => {
        // Remove amount filter from filter state if 
        // minAmount and maxAmount input are empty
        if (type === "amount") {
            if (!value.minAmount && !value.maxAmount) {
                setAddFilterToUI((prev) => prev.filter(f => f.type !== type));
                handleSetFiltersHelper(type, value);
                return;
            }
        }
        // Reset to page 0
        // If in any page rather then first page
        if (page > 0) {
            setPaginationModel({ page: 0, pageSize });
            setLastDocumentIds();
        }
        addFilters(type, value);
        handleSetFiltersHelper(type, value);
    }

    return (
        <div className="relative">
            {/* Main Button */}
            <button
                className="flex items-center gap-2 py-1 px-2 font-medium bg-black text-white cursor-pointer shadow-md rounded-md hover:opacity-70"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span>
                    <IoIosOptions />
                </span>
                <span>
                    Filters
                </span>
            </button>

            {/* Main Drop down */}
            {isOpen && (
                <div className="w-32 shadow-lg rounded-md bg-white text-left py-2 px-1 mt-0.5 absolute z-9999">
                    <ul className="list-none">
                        <li className="relative">
                            <AccountMenu
                                accounts={accounts}
                                menu={menu}
                                toggleMenu={toggleMenu}
                                handleSetFilters={handleSetFilters}
                            />
                        </li>
                        <li className="relative mt-1">
                            <CategoryMenu
                                menu={menu}
                                toggleMenu={toggleMenu}
                                handleSetFilters={handleSetFilters}
                            />
                        </li>
                        <li className="relative mt-1">
                            <AmountMenu
                                menu={menu}
                                toggleMenu={toggleMenu}
                                handleSetFilters={handleSetFilters}
                            />
                        </li>
                        <li className="relative mt-1">
                            <DateMenu
                                menu={menu}
                                toggleMenu={toggleMenu}
                                handleSetFilters={handleSetFilters}
                            />
                        </li>
                    </ul>
                </div>
            )}

        </div>
    )
}