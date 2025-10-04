import {useState } from "react";
import { useQuery} from "@tanstack/react-query"
import { IoIosOptions } from "react-icons/io";
import { createAccountsQueryOptions } from "../../util/createQueryOptions";
import prettyMapCategory from "../../constants/prettyMapCategory";
import TextField from "@mui/material/TextField";
import useTransactionFilters from "../../hooks/useTransactionFilters";
import { CgBookmark } from "react-icons/cg";

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

function AmountMenu({menu, toggleMenu, handleSetFilters}) {
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
                <div className="absolute flex gap-2 overflow-auto left-full top-0 ml-1 p-1 shadow-lg rounded-md bg-white text-black z-9999">
                    <TextField
                        type="number"
                        margin="dense"
                        label="Min Amount"
                        name="min_amount"
                        sx={{width: '150px'}}
                    />
                    <TextField
                        type="number"
                        margin="dense"
                        label="Max Amount"
                        name="max_amount"
                        sx={{
                            width: '150px'
                        }}
                    />
                </div>
            )}
        </>
    )
}

function DateMenu({menu, toggleMenu, handleSetFilters}) {
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
                        <li className="p-2 hover:bg-blue-50 hover:text-blue-500">
                            Last 7 days
                        </li>
                        <li className="p-2 hover:bg-blue-50 hover:text-blue-500">
                            Last 1 month
                        </li>
                        <li className="p-2 hover:bg-blue-50 hover:text-blue-500">
                            Last 3 month
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
            console.log(exist);
            if (exist) {
                return prev.map(f => f.type === type ? { ...f, value } : f)
            } 
            
            // Add new filters
            return [...prev, { type, value }];
        })
    }

    // Change filter and make api call
    const handleSetFilters = (type, value) => {
        // Reset to page 0
        // If in any page rather then first page
        if (page > 0) {
            setPaginationModel({ page: 0, pageSize });
            setLastDocumentIds();
        }
        addFilters(type, value)
        setFilters({[type]: value})
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