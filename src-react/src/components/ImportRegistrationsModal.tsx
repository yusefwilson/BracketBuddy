import { useState, useEffect, useContext, useRef } from 'react';

import type { BracketType, ImportRegistrationsResult, RegistrationField } from '../../../src-shared/types';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';

interface ImportRegistrationsModalProps {
    onClose: () => void;
}

const COLUMNS: RegistrationField[] = ['name', 'gender', 'weight', 'classes'];

export default function ImportRegistrationsModal({ onClose }: ImportRegistrationsModalProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};
    const { showError, ErrorToastContainer } = useErrorToast();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [bracketType, setBracketType] = useState<BracketType>('DoubleEliminationBracket');
    const [fileName, setFileName] = useState<string | null>(null);
    const [csv, setCsv] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportRegistrationsResult | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!tournament) {
        return null;
    }

    const handleFileChosen = async (file: File | undefined) => {
        if (!file) return;
        setFileName(file.name);
        setCsv(await file.text());
        setResult(null);
    };

    const handleImport = async () => {
        if (csv === null) return;

        setImporting(true);
        const [data, error] = await safeApiCall(
            window.electron.importRegistrations({ tournamentId: tournament.id, bracketType, csv })
        );
        setImporting(false);

        if (error) {
            showError(error);
            return;
        }

        if (data) {
            setTournament(data.tournament);
            setResult(data);
        }
    };

    const typeButton = (type: BracketType, label: string) => (
        <button
            type='button'
            onClick={() => setBracketType(type)}
            className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${bracketType === type
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/30'
                : 'bg-slate-700 text-gray-300 border-slate-600/50 hover:bg-slate-600'}`}
        >
            {label}
        </button>
    );

    return (
        <>
            <ErrorToastContainer />

            <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-2'>
                <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-3xl p-6 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-5 max-h-[90%] overflow-y-auto'>

                    <h1 className='text-2xl font-bold text-white text-center'>
                        <span className='bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'>Upload Registrations</span>
                    </h1>

                    <p className='text-sm text-gray-400'>
                        CSV columns: <span className='text-gray-200'>NAME, GENDER (MALE/FEMALE), WEIGHT, CLASSES</span>.
                        CLASSES is a comma separated list of hand and experience level, e.g. "Right Amateur, Left Pro".
                    </p>

                    <div className='flex flex-col gap-2'>
                        <label className='text-gray-300 text-sm font-medium'>Type for newly created classes</label>
                        <div className='flex gap-3'>
                            {typeButton('DoubleEliminationBracket', 'Double Elimination')}
                            {typeButton('RoundRobinBracket', 'Round Robin')}
                        </div>
                    </div>

                    <div className='flex items-center gap-3'>
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='.csv,text/csv'
                            className='hidden'
                            onChange={(e) => {
                                handleFileChosen(e.target.files?.[0]);
                                e.target.value = ''; // allow re-selecting the same file
                            }}
                        />
                        <button
                            type='button'
                            onClick={() => fileInputRef.current?.click()}
                            className='bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg border border-slate-600/50 transition-all duration-200 hover:border-slate-500'
                        >
                            Choose CSV
                        </button>
                        <span className='text-sm text-gray-400 truncate'>{fileName ?? 'No file selected'}</span>
                    </div>

                    {result && (
                        <div className='flex flex-col gap-3'>
                            <div className='rounded-xl bg-slate-800/40 border border-slate-700/50 p-4 text-sm text-gray-200 flex flex-col gap-1'>
                                <div>{result.added} competitor entries added</div>
                                <div>{result.alreadyPresent} already registered (no change)</div>
                                <div>{result.classesCreated} new classes created</div>
                                <div className={result.invalidRows.length > 0 ? 'text-amber-400 font-semibold' : ''}>
                                    {result.invalidRows.length} rows skipped
                                </div>
                            </div>

                            {result.invalidRows.length > 0 && (
                                <div className='flex flex-col gap-2'>
                                    <div className='text-gray-300 text-sm font-medium'>Skipped rows</div>
                                    {result.invalidRows.map(row => (
                                        <div key={row.rowNumber} className='rounded-xl bg-slate-800/40 border border-amber-500/40 p-3 flex flex-col gap-2'>
                                            <div className='flex gap-2 text-sm items-center flex-wrap'>
                                                <span className='text-gray-500 w-14'>Row {row.rowNumber}</span>
                                                {row.raw.length === COLUMNS.length ? (
                                                    COLUMNS.map((col, i) => (
                                                        <span
                                                            key={col}
                                                            className={`px-2 py-0.5 rounded ${row.fields.includes(col)
                                                                ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                                                                : 'text-gray-300'}`}
                                                        >
                                                            {row.raw[i] || <em className='opacity-60'>empty</em>}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className='px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/50'>
                                                        {row.raw.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                            <ul className='text-xs text-amber-300 list-disc pl-5'>
                                                {row.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className='flex justify-center gap-3 mt-2'>
                        <button
                            className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                            onClick={handleImport}
                            disabled={csv === null || importing}
                        >
                            {importing ? 'Importing...' : 'Import'}
                        </button>
                        <button
                            className='bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-lg border border-slate-600/50 transition-all duration-200 hover:border-slate-500'
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
