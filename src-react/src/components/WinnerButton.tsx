export default function WinnerButton({ toggleWinner }: { toggleWinner: () => void }) {

  return (
    <button className={'bg-green-400 p-4 rounded-md'} onClick={toggleWinner} >Winner</button>
  )
}