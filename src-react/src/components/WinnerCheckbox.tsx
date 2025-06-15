export default function WinnerCheckbox({ toggleWinner, checked }: { toggleWinner: () => void, checked: boolean }) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleWinner();
  }
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <input className='bg-green-400 p-4 rounded-md' type='checkbox' onChange={handleChange} checked={checked} onClick={handleClick} />
  )
}