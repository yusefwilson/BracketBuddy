import { useState, useCallback } from 'react';
import ErrorToast from '../components/ErrorToast';

interface ErrorState {
    message: string;
    id: number;
}

export function useErrorToast() {
    const [errors, setErrors] = useState<ErrorState[]>([]);

    const showError = useCallback((message: string) => {
        const id = Date.now();
        setErrors(prev => [...prev, { message, id }]);
    }, []);

    const removeError = useCallback((id: number) => {
        setErrors(prev => prev.filter(error => error.id !== id));
    }, []);
    return { showError, ErrorToastContainer };
}
