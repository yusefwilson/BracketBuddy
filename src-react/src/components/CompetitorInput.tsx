export default function CompetitorInput({ competitors, setCompetitors }: { competitors: string[], setCompetitors: (competitors: string[]) => void }) {

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
        <div className='flex flex-col justify-between h-full'>

            <div className='max-h-[80%] overflow-y-auto border p-2 rounded-md'>
                <h2 className='text-md font-semibold mb-2'>{'Enter Competitor Names (' + competitors.length.toString() + ')'}</h2>
                {competitors.length !== 0 && competitors.map((name, index) => (
                    <div key={index} className='flex items-center space-x-2 mb-2'>
                        <input
                            type='text'
                            placeholder={`Competitor ${index + 1}`}
                            value={name}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            className='p-2 border rounded-md w-full'
                        />
                        <button
                            onClick={() => removeCompetitor(index)}
                            className='bg-red-500 text-white px-3 py-1 rounded-md'
                            disabled={competitors.length === 0} // Prevent removing when there are no inputs
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={addCompetitor} className='bg-blue-500 text-white px-4 py-2 rounded-md mt-2'>Add Competitor</button>
        </div>
    );
};
