export default function Dropdown<T extends string>({ options, label, value, onChange }: { options: T[]; label?: string; value: T; onChange: (value: T) => void; }) {
    return (
        <div>
            {label && <label className="block font-medium mb-1">{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="p-2 border rounded-md"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};