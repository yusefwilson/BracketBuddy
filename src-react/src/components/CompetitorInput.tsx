export default function CompetitorInput({ competitors, setCompetitors, }: { competitors: string[]; setCompetitors: (competitors: string[]) => void; }) {

    // Handle input change
    const handleInputChange = (index: number, value: string) => {
        const newCompetitors = [...competitors];
        newCompetitors[index] = value;
        setCompetitors(newCompetitors);
    };

    // Add a new empty competitor
    const addCompetitor = () => {
        setCompetitors([...competitors, '']);
    };

    // Remove a competitor by index
    const removeCompetitor = (index: number) => {
        const newCompetitors = competitors.filter((_, i) => i !== index);
        setCompetitors(newCompetitors);
    };

    return (
        <div className='flex flex-col h-full justify-between'>
            <div className='overflow-y-scroll border border-gray-600 rounded-md p-4 bg-slate-700'>
                <h2 className='text-lg font-semibold text-white mb-4'>
                    Enter Competitor Names ({competitors.length})
                </h2>

                {competitors.length === 0 && (
                    <p className='text-gray-400 italic'>No competitors added yet.</p>
                )}

                {competitors.map((name, index) => (
                    <div key={index} className='flex items-center space-x-3 mb-3'>
                        <input
                            type='text'
                            placeholder={`Competitor ${index + 1}`}
                            value={name}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            className='
                flex-grow
                p-2
                rounded-md
                border
                border-gray-500
                bg-slate-600
                text-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-400
                transition
                duration-200
                ease-in-out
              '
                        />
                        <button
                            onClick={() => removeCompetitor(index)}
                            disabled={competitors.length === 0}
                            className='
                bg-red-600
                hover:bg-red-700
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-white
                px-3
                py-1.5
                rounded-md
                transition
                duration-200
                ease-in-out
                select-none
              '
                            aria-label={`Remove competitor ${index + 1}`}
                            type='button'
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addCompetitor}
                className='
          mt-4
          bg-blue-400
          hover:bg-blue-500
          text-white
          px-5
          py-2
          rounded-md
          font-semibold
          transition
          duration-200
          ease-in-out
          select-none
        '
                type='button'
            >
                Add Competitor
            </button>
        </div>
    );
}
