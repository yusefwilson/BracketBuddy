import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DropdownProps<T extends string> {
    options: T[];
    label?: string;
    value: T;
    onChange: (value: T) => void;
}

export default function Dropdown<T extends string>({ options, label, value, onChange, }: DropdownProps<T>) {
    return (
        <div className='w-full'>
            {label && (
                <label className='block mb-1 text-sm font-semibold text-gray-200'>
                    {label}
                </label>
            )}

            <div className='relative'>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as T)}
                    className='
            block
            w-full
            appearance-none
            bg-slate-700
            text-white
            px-4
            py-2
            rounded-md
            border
            border-gray-600
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
            hover:border-gray-400
            transition
            duration-200
            ease-in-out
          '
                >
                    {options.map((option) => (
                        <option key={option} value={option} className='bg-slate-700 text-white'>
                            {option}
                        </option>
                    ))}
                </select>

                {/* Heroicon Down Arrow */}
                <div className='pointer-events-none absolute inset-y-0 right-3 flex items-center'>
                    <ChevronDownIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                </div>
            </div>
        </div>
    );
}
