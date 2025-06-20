import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, HomeIcon } from '@heroicons/react/16/solid';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-700 flex justify-between items-center h-16 px-6 text-white shadow-md p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="bg-blue-500 hover:bg-blue-600 rounded-md p-1.5 transition"
          type="button"
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>
        <button
          onClick={() => navigate('/')}
          aria-label="Go home"
          className="bg-blue-500 hover:bg-blue-600 rounded-md p-1.5 transition"
          type="button"
        >
          <HomeIcon className="h-8 w-8" />
        </button>
      </div>

      <p className="font-extrabold text-2xl select-none">BracketBuddy</p>
    </nav>
  );
}
