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

export default function SearchTransaction({setPaginationModel, page, pageSize, setLastDocumentIds}) {
  const { name, setFilters } = useTransactionFilters();
  const [localSearch, setLocalSearch] = useState(name);
  const debouncedSearch = useDebounce(localSearch);
  
  useEffect(() => {
    if (page > 0) {
      setPaginationModel({ page: 0, pageSize });
      setLastDocumentIds();
    }
    setFilters({ name: debouncedSearch });
  }, [debouncedSearch])
  
  return (
    <div className="relative">
        <IoSearchSharp className="absolute top-1/2 left-2 transform -translate-y-1/2" />
    <input
      id="searchTransaction"
      value={localSearch || ''}
      placeholder="Search merchant name"
      className="w-full pl-8 py-1 tracking-wider text-md text-black bg-white border-2 border-gray-300 rounded-md "
      onChange={(e) => setLocalSearch(e.target.value)}
        />
    </div>
  )
}