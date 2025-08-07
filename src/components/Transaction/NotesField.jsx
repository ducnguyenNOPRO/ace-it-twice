import React, { memo, useState, useCallback, useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField';

const NotesField = memo(({ value, onChange }) => {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef(null);

    const handleChange = useCallback((e) => {
        setLocalValue(e.target.value);

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        // Debounce update on parent
        timeoutRef.current = setTimeout(() => {
            onChange(e.target.value);
        }, 1000)
    }, [onChange])

    // cleared previous timeout, prevent multiple delayed updates to parent
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])


    return (
        <TextField
            fullWidth
            margin="normal"
            multiline
            rows={3}
            label="Notes"
            name="notes"
            value={localValue}
            onChange={handleChange}
        />
    )
}, (prevProps, nextProps) => {
    // Only re-render if the value prop actually changed
    return prevProps.value === nextProps.value;
})

export default NotesField