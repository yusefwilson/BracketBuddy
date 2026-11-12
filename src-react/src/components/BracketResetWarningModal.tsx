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
            className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 cursor-default'
            // Prevent the modal from being draggable
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-md p-6 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-5'>
                <h1 className='text-white text-xl font-bold text-center'>
                    <span className='bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'>Warning: Bracket Reset</span>
                </h1>

                <p className='text-gray-300 text-sm text-center'>
                    {message}
                </p>

                <p className='text-red-400 text-sm font-semibold text-center'>
                    This action cannot be undone.
                </p>

                <div className='flex justify-center gap-3 mt-4'>
                    <button
                        className='bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg border border-slate-600/50 transition-all duration-200 hover:border-slate-500'
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className='bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
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
