import { useState, useEffect } from 'react';

export default function TournamentInputModal({ setTournamentModalOpen }: { setTournamentModalOpen: (open: boolean) => void; }) {
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const [error, setError] = useState('');

    const invalidChars = /[:<>:'/\\|?*]/g;

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        switch (event.target.name) {
            case 'name':
                setName(event.target.value);
                break;
            case 'date':
                setDate(new Date(event.target.value));
                break;
            default:
                break;
        }
    };

    const onSubmit = async () => {
        if (invalidChars.test(name)) {
            setError(`Tournament name contains invalid characters: :<>:'/\\|?*`);
            return;
        }

        const allTournaments = await window.electron.loadAllTournaments();

        // TODO: should this be some kind of id check instead?
        if (allTournaments.some((t) => t.name === name)) {
            setError(`Tournament with name '${name}' already exists.`);
            return;
        }

        // clear error if valid
        setError('');

        // create and save tournament. TODO: does this update state? (probably)
        await window.electron.createTourament(name, date, []);

        // close modal
        setTournamentModalOpen(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setTournamentModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-slate-700 w-full max-w-md rounded-xl p-6 shadow-lg flex flex-col gap-4'>

                <h1 className='text-xl font-semibold text-white text-center'>Enter Tournament Info</h1>

                {/* Input: Name */}
                <input
                    className='bg-slate-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                    placeholder='Tournament Name'
                    name='name'
                    onChange={onChange}
                />

                {/* Input: Date */}
                <input
                    type='date'
                    name='date'
                    className='bg-slate-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                    value={date.toISOString().split('T')[0]}
                    onChange={onChange}
                />

                {/* Error Message */}
                {error && (
                    <p className='bg-red-500 text-white text-sm px-3 py-2 rounded-md'>{error}</p>
                )}

                {/* Action Buttons */}
                <div className='flex justify-center gap-4 mt-2'>
                    <button
                        className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition'
                        onClick={() => setTournamentModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className='bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-md transition'
                        onClick={onSubmit}
                    >
                        Create Tournament
                    </button>
                </div>
            </div>
        </div>
    );
}
