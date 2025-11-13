import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, HomeIcon, HeartIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/solid';
import { safeApiCall } from '../utils/apiHelpers';

export default function Navbar() {
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(100);

  // Load current zoom level on mount and poll for changes (for View menu sync)
  useEffect(() => {
    const updateZoom = async () => {
      const [currentZoom, error] = await safeApiCall(window.electron.getZoomLevel());
      if (!error && currentZoom !== null) {
        setZoomLevel(currentZoom);
      }
    };

    updateZoom();

    // Poll every 500ms to detect zoom changes from View menu
    const interval = setInterval(updateZoom, 500);

    return () => clearInterval(interval);
  }, []);

  const handleZoomIn = async () => {
    const newZoom = Math.min(zoomLevel + 10, 200);
    setZoomLevel(newZoom);
    await safeApiCall(window.electron.setZoomLevel(newZoom));
  };

  const handleZoomOut = async () => {
    const newZoom = Math.max(zoomLevel - 10, 50);
    setZoomLevel(newZoom);
    await safeApiCall(window.electron.setZoomLevel(newZoom));
  };

  const handleZoomReset = async () => {
    setZoomLevel(100);
    await safeApiCall(window.electron.setZoomLevel(100));
  };

  return (
    <nav className='bg-gray-700 flex justify-between items-center h-16 px-6 text-white shadow-md p-4'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => navigate(-1)}
          aria-label='Go back'
          className='bg-blue-500 hover:bg-blue-600 rounded-md p-1.5 transition'
          type='button'
        >
          <ChevronLeftIcon className='h-8 w-8' />
        </button>
        <button
          onClick={() => navigate('/')}
          aria-label='Go home'
          className='bg-blue-500 hover:bg-blue-600 rounded-md p-1.5 transition'
          type='button'
        >
          <HomeIcon className='h-8 w-8' />
        </button>
      </div>

      <p className='font-extrabold text-2xl select-none'>BracketBuddy</p>

      {/* Zoom Controls and Heart Donation Button */}
      <div className='flex items-center gap-4'>
        {/* Zoom Controls */}
        <div className='flex items-center gap-2 bg-slate-600 rounded-md p-1'>
          <button
            onClick={handleZoomOut}
            aria-label='Zoom out'
            className='bg-blue-500 hover:bg-blue-600 rounded p-1 transition'
            type='button'
            disabled={zoomLevel <= 50}
          >
            <MagnifyingGlassMinusIcon className='h-5 w-5' />
          </button>
          <button
            onClick={handleZoomReset}
            aria-label='Reset zoom'
            className='text-white hover:text-blue-300 px-2 text-sm font-semibold transition min-w-[3rem]'
            type='button'
          >
            {zoomLevel}%
          </button>
          <button
            onClick={handleZoomIn}
            aria-label='Zoom in'
            className='bg-blue-500 hover:bg-blue-600 rounded p-1 transition'
            type='button'
            disabled={zoomLevel >= 200}
          >
            <MagnifyingGlassPlusIcon className='h-5 w-5' />
          </button>
        </div>

        {/* Heart Donation Button */}
        <button
          onClick={() => window.electron.openUrl('https://yusefwilson.com')}
          aria-label='Donate with heart'
          className='bg-red-500 hover:bg-red-600 rounded-md p-1.5 transition flex items-center gap-1'
          type='button'
        >
          <HeartIcon className='h-6 w-6' />
        </button>
      </div>
    </nav>
  );
}
