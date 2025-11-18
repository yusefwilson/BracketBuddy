import { useEffect } from 'react';

interface BracketResetWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

export default function BracketResetWarningModal({ isOpen, onClose, onConfirm, message }: BracketResetWarningModalProps) {
    // Close modal when escape key is pressed
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            // override cursor to default since drag and drop stuff still sets cursor to grab here without the override
            className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 cursor-default'
            // Prevent the modal from being draggable
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className='bg-slate-700 w-full max-w-md p-6 rounded-xl shadow-lg flex flex-col gap-4'>
                <h1 className='text-white text-lg font-semibold text-center'>
                    Warning: Bracket Reset
                </h1>

                <p className='text-gray-300 text-sm text-center'>
                    {message}
                </p>

                <p className='text-red-400 text-sm font-semibold text-center'>
                    This action cannot be undone.
                </p>

                <div className='flex justify-center gap-4 mt-4'>
                    <button
                        className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition'
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className='bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition'
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Confirm Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
