import { useState } from 'react';

import { Gender, Hand, ExperienceLevel } from '../lib/types';
import CompetitorInput from './CompetitorInput';
import Dropdown from './Dropdown';

export default function BracketInputModal({ setBracketModalOpen }: { setBracketModalOpen: (open: boolean) => void }) {

    const [gender, setGender] = useState<Gender>('Male');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Novice');
    const [hand, setHand] = useState<Hand>('Right');
    const [weightLimit, setWeightLimit] = useState<number>(0);
    const [competitorNames, setCompetitorNames] = useState<string[]>([]);


    const onSubmit = () => {

        // create new tournament
        //const newBracket = new Bracket(gender, experienceLevel, hand, weightLimit, competitorNames);

        // close modal
        setBracketModalOpen(false);
    }

    return (
        <div className='fixed left-0 right-0 top-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center'>
            <div className='bg-purple-600 flex flex-col p-2 rounded-md gap-2 '>
                <h1>Enter Tournament Info:</h1>

                <Dropdown options={['Male', 'Female', 'Mixed']} label='Select Gender' value={gender} onChange={setGender} />
                <Dropdown options={['Youth', 'Novice', 'Amateur', 'Semipro', 'Pro', 'Master', 'Grandmaster', 'Senior Grandmaster']} label='Select Experience Level' value={experienceLevel} onChange={setExperienceLevel} />
                <Dropdown options={['Right', 'Left']} label='Select Hand' value={hand} onChange={setHand} />
                <CompetitorInput competitors={competitorNames} setCompetitors={setCompetitorNames} />
                <input className='bg-red-600' placeholder='Weight Limit' name='weightLimit' type='number' onChange={(e) => setWeightLimit(parseInt(e.target.value))} />

                <button className='bg-yellow-500 p-4 rounded-md flex-shrink' onClick={onSubmit}>Create Bracket</button>
            </div>
        </div>
    );
}