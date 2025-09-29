import { IoSearchSharp } from "react-icons/io5"
import {useEffect, useState } from "react";
import useTransactionFilters from "../../hooks/useTransactionFilters";

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchTransaction() {
  const { search, setFilters } = useTransactionFilters();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch);
  
  useEffect(() => {
    setFilters({ name: debouncedSearch });
  }, [debouncedSearch])
  
  return (
    <div className="relative">
        <IoSearchSharp className="absolute top-1/2 left-2 transform -translate-y-1/2" />
    <input
      id="searchTransaction"
      value={localSearch || ''}
      placeholder="Search or filter"
      className="w-full pl-8 py-1 tracking-wider text-md text-black bg-white border-2 border-gray-300 rounded-md "
      onChange={(e) => setLocalSearch(e.target.value)}
        />
    </div>
  )
}