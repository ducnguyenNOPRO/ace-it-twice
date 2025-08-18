import { IoSearchSharp } from "react-icons/io5"
import {useEffect, useState } from "react";

function useDebounce(value, delay = 400) {
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

export default function SearchTransaction({ onSearch }) {
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch);
  
    // Whenever the debounced value changes, pass it up
  useEffect(() => {
    onSearch(debouncedSearch.trim().toLowerCase());
  }, [debouncedSearch, onSearch]);
    
    return (
        <div className="relative grow">
            <IoSearchSharp className="absolute top-1/2 left-2 transform -translate-y-1/2" />
            <input 
                id="searchTransaction"
                value={localSearch ?? ''}
                placeholder="Search for a transaction"
                className="w-full pl-8 py-1 tracking-wider text-md text-black bg-white border-2 border-gray-300 rounded-md "
                onChange={(e) => setLocalSearch(e.target.value)}
            />
        </div>
    )
}