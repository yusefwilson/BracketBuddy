import { useState, useContext, useEffect } from 'react';

import { Gender, Hand, ExperienceLevel } from '../lib/types';
import Bracket from '../lib/Bracket';
import CompetitorInput from './CompetitorInput';
import Dropdown from './Dropdown';

import { CURRENT_STATE } from './App';
import Tournament from '../lib/Tournament';

export default function BracketInputModal({ setBracketModalOpen }: { setBracketModalOpen: (open: boolean) => void }) {

    const [gender, setGender] = useState<Gender>('Male');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Novice');
    const [hand, setHand] = useState<Hand>('Right');
    const [weightLimit, setWeightLimit] = useState<number>(0);
    const [competitorNames, setCompetitorNames] = useState<string[]>([]);

    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};

    const onSubmit = async () => {

        // create new bracket
        const newBracket = new Bracket(gender, experienceLevel, hand, weightLimit, competitorNames);

        // add bracket to tournament
        await tournament?.addBracket(newBracket);

        // update tournament in context to trigger relevant refreshes
        setTournament(tournament?.markUpdated() as Tournament);

        // close modal
        setBracketModalOpen(false);
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setBracketModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className='fixed left-0 right-0 top-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center'>
            <div className='bg-purple-600 flex flex-col p-2 rounded-md gap-2 relative'>
                <h1>Enter Tournament Info:</h1>

                {/* Close Button (X) */}
                <button className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md' onClick={() => setBracketModalOpen(false)}>X</button>

                {/* Tournament Info */}
                <Dropdown options={['Male', 'Female', 'Mixed']} label='Select Gender' value={gender} onChange={setGender} />
                <Dropdown options={['Youth', 'Novice', 'Amateur', 'Semipro', 'Pro', 'Master', 'Grandmaster', 'Senior Grandmaster']} label='Select Experience Level' value={experienceLevel} onChange={setExperienceLevel} />
                <Dropdown options={['Right', 'Left']} label='Select Hand' value={hand} onChange={setHand} />
                <CompetitorInput competitors={competitorNames} setCompetitors={setCompetitorNames} />
                <input className='bg-red-600' placeholder='Weight Limit' name='weightLimit' type='number' onChange={(e) => setWeightLimit(parseInt(e.target.value))} />

                {/* Submit Button */}
                <button className='bg-yellow-500 p-4 rounded-md flex-shrink' onClick={onSubmit}>Create</button>
            </div>
        </div>
    );
}