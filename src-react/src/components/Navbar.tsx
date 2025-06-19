import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/16/solid';
import { HomeIcon } from '@heroicons/react/16/solid';

export default function Navbar() {

  const navigate = useNavigate();

  return (
    <nav className='bg-gray-400 flex flex-row justify-between items-center h-16 px-4 text-white'>

      <div className='flex flex-row p-4 gap-4'>
        <ChevronLeftIcon className='h-8 w-8 cursor-pointer bg-blue-400 rounded-md' onClick={() => navigate(-1)} />
        <HomeIcon className='h-8 w-8 cursor-pointer bg-blue-400 rounded-md' onClick={() => navigate('/')} />
      </div>

      <p className='font-bold text-2xl'>BracketBuddy</p>

    </nav>
  );
}