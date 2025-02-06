export default function WinnerCheckbox({ toggleWinner, checked, disabled }: { toggleWinner: () => void, checked: boolean, disabled: boolean }) {

  return (
    <input className='bg-green-400 p-4 rounded-md' type='checkbox' onClick={toggleWinner} checked={checked} disabled={disabled}></input>
  )
}