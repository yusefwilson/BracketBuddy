import { useNavigate } from 'react-router-dom';

export default function Navbar() {

  const navigate = useNavigate();

  return (
    <nav className='bg-red-400 flex flex-row p-4 gap-4 '>
      <button className='bg-black p-2 rounded-md' onClick={() => { navigate(-1); }}>Back</button>
      <a href='/' className='bg-black p-2 rounded-md'>Home</a>
    </nav>
  );
}