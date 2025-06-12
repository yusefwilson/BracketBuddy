export default function YGuideLines({ yLevels }: { yLevels: number[] }) {
    return (
        yLevels.map((y, idx) => (
            <div
                key={idx}
                className='absolute left-0 w-full border-t border-dashed border-white text-xs text-white'
                style={{ top: y }}
            >
                Y: {y}
            </div>
        ))
    );
}