import Bracket from '../lib/Bracket';

export default function BracketInfoCard({ bracket, onClick, onRemoveClick }: { bracket: Bracket, onClick: () => void, onRemoveClick: () => void }) {

    return (
        <div className='bg-purple-600 p-2 rounded-md gap-2 flex flex-row relative' onClick={onClick}>
            {/* Close Button (X) */}
            <button className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation(); // Prevents the click from reaching the parent div
                onRemoveClick();
            }}>X</button>

            {/* Bracket Info */}
            <h1>{'Gender: ' + bracket.gender.toString()}</h1>
            <h1>{'Level: ' + bracket.experienceLevel.toString()}</h1>
            <h1>{'Weight: ' + bracket.weightLimit.toString()}</h1>
        </div>
    );
}