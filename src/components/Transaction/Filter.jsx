import { IoSearchSharp } from "react-icons/io5"
import {useState } from "react";
import { useQuery} from "@tanstack/react-query"
import { IoIosOptions } from "react-icons/io";
import { createAccountsQueryOptions } from "../../util/createQueryOptions";


export default function FilterTransaction({itemId}) {
    const [isOpen, setIsOpen] = useState(false);
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
                    <ul className="list-none p-0 m-0">
                        <li className="relative">
                            <button
                                className="flex w-full px-1 cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleMenu("account")}
                            >
                                <span className="text-black">Account</span>
                                <span className="ml-auto">&gt;</span>
                            </button>
                            {menu === "account" && (
                                <div className="absolute w-60 left-full top-0 ml-1 shadow-lg rounded-md bg-white text-black p-1 z-9999">
                                    <ul className="list-none py-1 m-0">
                                        {accounts.map((account) => {
                                            const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
                                            return (
                                            <li className="flex items-center gap-2 text-sm p-2 hover:bg-blue-50 hover:text-blue-500">
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
                        </li>
                    </ul>
                </div>
            )}

        </div>
    )
}