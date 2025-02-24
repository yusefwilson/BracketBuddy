import Bracket from "../lib/Bracket";

export default function BracketInfoCard({ bracket }: { bracket: Bracket }) {

    return (
        <div className='bg-purple-600 p-2 rounded-md gap-2'>
            <h1>{'Gender: ' + bracket.gender.toString()}</h1>
            <h1>{'Level: ' + bracket.experienceLevel.toString()}</h1>
            <h1>{'Weight: ' + bracket.weightLimit.toString()}</h1>
        </div>
    );
}