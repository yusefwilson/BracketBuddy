export default function WinnerCheckbox({ toggleWinner, checked }: { toggleWinner: () => void, checked: boolean }) {

  return (
    <input className='bg-green-400 p-4 rounded-md' type='checkbox' onChange={toggleWinner} checked={checked}></input>
  )
}