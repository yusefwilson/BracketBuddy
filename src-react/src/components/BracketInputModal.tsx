import { useState, useContext, useEffect } from 'react';

import { UserIcon, AcademicCapIcon, HandRaisedIcon, ScaleIcon, } from '@heroicons/react/24/outline';

import { Gender, Hand, ExperienceLevel } from '../../../src-shared/types';
import CompetitorInput from './CompetitorInput';
import Dropdown from './Dropdown';
import { CURRENT_STATE } from './App';

export default function BracketInputModal({ setBracketModalOpen, }: { setBracketModalOpen: (open: boolean) => void; }) {

    const [gender, setGender] = useState<Gender>('Male');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Novice');
    const [hand, setHand] = useState<Hand>('Right');
    const [weightLimit, setWeightLimit] = useState<number>(0);
    const [competitorNames, setCompetitorNames] = useState<string[]>([]);

    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};

    const addCompetitor = async (name: string) => {
        setCompetitorNames([...competitorNames, name]);
    };

    const removeCompetitor = async (name: string) => {
        setCompetitorNames(competitorNames.filter(c => c !== name));
    };

    const onSubmit = async () => {

        if (!tournament) throw new Error('Cannot create bracket without a tournament in state.');

        // add bracket to tournament
        const newTournament = await window.electron.addBracketToTournament(tournament.id, gender, experienceLevel, hand, weightLimit, competitorNames);

        // trigger refresh
        setTournament(newTournament);

        // close modal
        setBracketModalOpen(false);
    };

    useEffect(() => {

        // register a function to close the modal on escape
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setBracketModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // unregister the function on component unmount
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-slate-700 w-full max-w-lg p-6 rounded-xl shadow-lg flex flex-col gap-6'>

                <h1 className='text-xl font-semibold text-white text-center'>Enter Bracket Info</h1>

                {/* Form Row: Gender */}
                <div className='flex items-center gap-4'>
                    <UserIcon className='h-6 w-6 text-blue-400 flex-shrink-0' />
                    <div className='w-64'>
                        <Dropdown
                            options={['Male', 'Female', 'Mixed']}
                            label=''
                            value={gender}
                            onChange={setGender}
                        />
                    </div>
                </div>

                {/* Form Row: Experience Level */}
                <div className='flex items-center gap-4'>
                    <AcademicCapIcon className='h-6 w-6 text-green-400 flex-shrink-0' />
                    <div className='w-64'>
                        <Dropdown
                            options={[
                                'Youth',
                                'Novice',
                                'Amateur',
                                'Semipro',
                                'Pro',
                                'Master',
                                'Grandmaster',
                                'Senior Grandmaster',
                            ]}
                            label=''
                            value={experienceLevel}
                            onChange={setExperienceLevel}
                        />
                    </div>
                </div>

                {/* Form Row: Hand */}
                <div className='flex items-center gap-4'>
                    <HandRaisedIcon className='h-6 w-6 text-yellow-400 flex-shrink-0' />
                    <div className='w-64'>
                        <Dropdown
                            options={['Right', 'Left']}
                            label=''
                            value={hand}
                            onChange={setHand}
                        />
                    </div>
                </div>

                {/* Form Row: Weight Limit */}
                <div className='flex items-center gap-4'>
                    <ScaleIcon className='h-6 w-6 text-purple-400 flex-shrink-0' />
                    <input
                        className='bg-slate-600 text-white px-4 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-400'
                        placeholder='Weight Limit'
                        name='weightLimit'
                        type='number'
                        onChange={(e) => setWeightLimit(parseInt(e.target.value))}
                    />
                </div>


                {/* Competitor Input - full width */}
                <CompetitorInput
                    competitors={competitorNames}
                    addCompetitor={addCompetitor}
                    removeCompetitor={removeCompetitor}
                />

                {/* Action Buttons */}
                <div className='flex justify-center gap-4 mt-4'>
                    <button
                        className='bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md transition'
                        onClick={() => setBracketModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className='bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-5 py-2 rounded-md transition'
                        onClick={onSubmit}
                    >
                        Create Bracket
                    </button>
                </div>

            </div>
        </div>
    );
}
