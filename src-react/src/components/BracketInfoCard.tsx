import Bracket from '../lib/Bracket';

export default function BracketInfoCard({ bracket, onClick, onRemoveClick }: { bracket: Bracket, onClick: () => void, onRemoveClick: () => void }) {

    return (
        <div className='bg-purple-600 p-2 rounded-md gap-2 flex flex-row items-center' onClick={onClick}>

            {/* Bracket Info */}
            <h1>{'Gender: ' + bracket.gender.toString()}</h1>
            <h1>{'Level: ' + bracket.experienceLevel.toString()}</h1>
            <h1>{'Weight: ' + bracket.weightLimit.toString()}</h1>

            {/* Close Button (X) */}
            <button className='bg-red-500 text-white p-1 rounded-md' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation(); // Prevents the click from reaching the parent div
                onRemoveClick();
            }}>Remove</button>
        </div>
    );
}