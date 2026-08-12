import { useEffect, useRef, useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { HiArrowsUpDown as SortIcon, HiBars3 as DragHandleIcon } from 'react-icons/hi2';

import { SortField } from '../utils/bracketSort';
import { SortableList } from '../hooks/useSortableList';

interface BracketSortDropdownProps {
    fields: SortField[];
    onDragEnd: (event: DragEndEvent) => void;
}

export default function BracketSortDropdown({ fields, onDragEnd }: BracketSortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className='relative'>
            <button
                type='button'
                onClick={() => setIsOpen((open) => !open)}
                className='flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600/50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm whitespace-nowrap'
            >
                <SortIcon className='h-4 w-4 text-gray-400' />
                <span>Sort: {fields.map((f) => f.label).join(' → ')}</span>
            </button>

            {isOpen && (
                <div className='absolute right-0 z-10 mt-2 w-64 bg-slate-800 border border-slate-600/50 rounded-lg shadow-2xl p-3'>
                    <p className='text-gray-400 text-xs mb-2'>Drag to set sort priority</p>
                    <SortableList
                        items={fields}
                        onDragEnd={onDragEnd}
                        orientation='vertical'
                        renderItem={(field) => (
                            <div className='flex items-center gap-2 bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600/50 cursor-grab select-none'>
                                <DragHandleIcon className='h-4 w-4 text-gray-400 flex-shrink-0' />
                                <span className='text-sm font-medium'>{field.label}</span>
                            </div>
                        )}
                    />
                </div>
            )}
        </div>
    );
}
