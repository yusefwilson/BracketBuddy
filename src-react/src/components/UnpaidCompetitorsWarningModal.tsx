import { useEffect } from 'react';

interface UnpaidCompetitorsWarningModalProps {
    isOpen: boolean;
    unpaidNames: string[];
    onClose: () => void;
    onConfirm: () => void;
}

// shown when a bracket is about to start while some of its competitors have not paid
export default function UnpaidCompetitorsWarningModal({ isOpen, unpaidNames, onClose, onConfirm }: UnpaidCompetitorsWarningModalProps) {
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
            className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 cursor-default'
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-md p-6 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-5'>
                <h1 className='text-white text-xl font-bold text-center'>
                    <span className='bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'>Warning: Unpaid Competitors</span>
                </h1>

                <p className='text-gray-300 text-sm text-center'>
                    {unpaidNames.length === 1 ? 'This competitor has' : `These ${unpaidNames.length} competitors have`} not paid yet:
                </p>

                <ul className='text-gray-200 text-sm max-h-40 overflow-y-auto bg-slate-900/50 rounded-lg border border-slate-600/30 p-3'>
                    {unpaidNames.map((name, index) => (
                        <li key={index} className='mb-1 last:mb-0'>• {name}</li>
                    ))}
                </ul>

                <p className='text-gray-400 text-xs text-center'>
                    Payment can be updated in the Competitors list.
                </p>

                <div className='flex justify-center gap-3 mt-2'>
                    <button
                        className='bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg border border-slate-600/50 transition-all duration-200 hover:border-slate-500'
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className='bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Start Anyway
                    </button>
                </div>
            </div>
        </div>
    );
}
