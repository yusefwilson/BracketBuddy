import { useState } from 'react';
import Tournament from '../lib/Tournament';

export default function TournamentInputModal({ setTournamentModalOpen }: { setTournamentModalOpen: (open: boolean) => void }) {

    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());

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
    }

    const onSubmit = () => {

        // create new tournament
        const newTournament = new Tournament(name, date);

        // save tournament
        newTournament.save();

        // close modal
        setTournamentModalOpen(false);
    }

    return (
        <div className='fixed left-0 right-0 top-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center'>
            <div className='bg-purple-600 flex flex-col p-2 rounded-md gap-2 '>
                <h1>Enter Tournament Info:</h1>

                {/* Close Button (X) */}
                <button className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md' onClick={() => setTournamentModalOpen(false)}>X</button>

                {/* Tournament Info */}
                <input className='bg-red-600' placeholder='Name' name='name' onChange={onChange}></input>
                <input className='bg-orange-600' type='date' name='date' onChange={onChange}></input>

                {/* Create Tournament Button */}
                <button className='bg-yellow-500 p-4 rounded-md flex-shrink' onClick={onSubmit}>Create Tournament</button>
            </div>
        </div>
    );
}