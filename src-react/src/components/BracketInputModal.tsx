import { useState, useContext, useEffect } from 'react';
import { UserIcon, AcademicCapIcon, HandRaisedIcon, ScaleIcon, } from '@heroicons/react/24/outline';
import { Gender, Hand, ExperienceLevel, WeightLimit } from '../../../src-shared/types';
import CompetitorInput from './CompetitorInput';
import Dropdown from './Dropdown';
import { CURRENT_STATE } from './App';
import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

interface BracketInputModalProps {
    setBracketModalOpen: (open: boolean) => void;
}

export default function BracketInputModal({ setBracketModalOpen }: BracketInputModalProps) {

    const [gender, setGender] = useState<Gender>('Male');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Novice');
    const [hand, setHand] = useState<Hand>('Right');
    const [weightLimit, setWeightLimit] = useState<WeightLimit>(0);
    const [competitorNames, setCompetitorNames] = useState<string[]>([]);

    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};
    const { showError, ErrorToastContainer } = useErrorToast();

    const addCompetitor = async (name: string) => {
        setCompetitorNames([...competitorNames, name]);
    };

    const removeCompetitor = async (name: string) => {
        setCompetitorNames(competitorNames.filter(c => c !== name));
    };

    const onSubmit = async () => {

        if (!tournament) {
            showError('Cannot create bracket without a tournament in state.');
            return;
        }

        // add bracket to tournament
        const [newTournament, error] = await safeApiCall(
            window.electron.addBracketToTournament({
                tournamentId: tournament.id,
                brackets: [{ gender, experienceLevel, hand, weightLimit, competitorNames }]
            })
        );

        if (error) {
            showError(error);
            return;
        }

        // trigger refresh
        if (newTournament) {
            setTournament(newTournament);
        }

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
        <>
            <ErrorToastContainer />
            <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                <div className='bg-slate-700 w-full max-w-lg p-6 rounded-xl shadow-lg flex flex-col gap-6 h-3/4 overflow-y-auto'>

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
                        className={`block w-64 appearance-none bg-slate-700 text-white px-4 py-2 rounded-md border border-gray-600 shadow-sm
                                    focus:outline-none transition duration-200 ease-in-out
                                    ${weightLimit !== 'Superheavyweight' ?
                                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400' : 'cursor-not-allowed opacity-70'}
                        `}
                        placeholder={weightLimit === 'Superheavyweight' ? 'Superheavyweight' : 'Weight Limit'}
                        name='weightLimit'
                        type='number'
                        inputMode='numeric' // mobile shows number keypad
                        pattern='\d*'       // restrict to digits
                        maxLength={3}       // hard cap 3 chars
                        onChange={(e) => setWeightLimit(parseInt(e.target.value))}
                        onInput={(e) => {
                            const val = e.currentTarget.value.replace(/\D/g, '').slice(0, 3);
                            e.currentTarget.value = val;
                            setWeightLimit(val ? parseInt(val, 10) : 0);
                        }}
                        disabled={weightLimit === 'Superheavyweight'}
                        aria-disabled={weightLimit === 'Superheavyweight'}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            if (weightLimit === 'Superheavyweight') {
                                setWeightLimit(0);
                            } else {
                                setWeightLimit('Superheavyweight');
                            }
                        }}
                        className={`p-1 rounded-md font-semibold transition  text-2xl
                                ${weightLimit === 'Superheavyweight'
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                    >
                        🥞
                    </button>
                </div>


                {/* Competitor Input - full width */}
                <CompetitorInput
                    competitors={competitorNames}
                    addCompetitor={addCompetitor}
                    removeCompetitor={removeCompetitor}
                    randomizeCompetitors={async () => {
                        const shuffled = [...competitorNames].sort(() => Math.random() - 0.5);
                        setCompetitorNames(shuffled);
                    }}
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
        </>
    );
}
