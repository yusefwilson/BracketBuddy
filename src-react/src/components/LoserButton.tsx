export default function LoserButton({ toggleWinner }: { toggleWinner: () => void }) {

  return (
    <button className='bg-red-400 p-4 rounded-md' onClick={toggleWinner} >Loser</button>
  )
}