interface YGuideLinesProps {
    yLevels: number[];
}

// ✅ Use the props interface in the component
export default function YGuideLines({ yLevels }: YGuideLinesProps) {
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