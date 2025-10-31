import { useEffect, useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match the animation duration
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    return (
        <div className={`fixed top-4 right-4 z-[100] ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-md">
                <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="font-semibold text-sm">Error</p>
                    <p className="text-sm mt-1">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 hover:bg-red-700 rounded p-1 transition"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
