import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HiChevronLeft as ChevronLeftIcon, HiHome as HomeIcon, HiHeart as HeartIcon, HiMagnifyingGlassMinus as MagnifyingGlassMinusIcon, HiMagnifyingGlassPlus as MagnifyingGlassPlusIcon, HiMinus as MinusIcon, HiXMark as XMarkIcon } from 'react-icons/hi2';
import { VscChromeMaximize, VscChromeRestore } from 'react-icons/vsc';
import { safeApiCall } from '../utils/apiHelpers';

export default function Navbar() {
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isMaximized, setIsMaximized] = useState(false);

  // Load current zoom level on mount and poll for changes (for View menu sync)
  useEffect(() => {
    const updateZoom = async () => {
      const [currentZoom, error] = await safeApiCall(window.electron.getZoomLevel());
      if (!error && currentZoom !== null) {
        setZoomLevel(currentZoom);
      }
    };

    const updateMaximized = async () => {
      const maximized = await window.electron.windowIsMaximized();
      setIsMaximized(maximized);
    };

    updateZoom();
    updateMaximized();

    // Poll every 500ms to detect zoom changes from View menu and window state
    const interval = setInterval(() => {
      updateZoom();
      updateMaximized();
    }, 500);

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
    <nav className='bg-slate-900/95 backdrop-blur-sm flex justify-between items-center h-12 px-4 text-white shadow-lg border-b border-slate-700/50 select-none' style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* Left section with navigation buttons and title */}
      <div className='flex items-center gap-3'>
        <button
          onClick={() => navigate(-1)}
          aria-label='Go back'
          className='bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg p-1.5 transition-all duration-200 hover:border-slate-600'
          type='button'
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <ChevronLeftIcon className='h-5 w-5' />
        </button>
        <button
          onClick={() => navigate('/')}
          aria-label='Go home'
          className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg p-1.5 transition-all duration-200 shadow-md hover:shadow-lg'
          type='button'
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <HomeIcon className='h-5 w-5' />
        </button>
        <h1 className='font-extrabold text-xl'>
          <span className='bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'>BracketBuddy</span>
        </h1>
      </div>

      {/* Center section - draggable title bar */}
      <div className='flex-1'>
      </div>

      {/* Right section with zoom controls, heart button, and window controls */}
      <div className='flex items-center gap-3' style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {/* Zoom Controls */}
        <div className='flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700/50 shadow-md'>
          <button
            onClick={handleZoomOut}
            aria-label='Zoom out'
            className='bg-slate-700 hover:bg-slate-600 rounded p-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed'
            type='button'
            disabled={zoomLevel <= 50}
          >
            <MagnifyingGlassMinusIcon className='h-4 w-4' />
          </button>
          <button
            onClick={handleZoomReset}
            aria-label='Reset zoom'
            className='text-white hover:text-blue-400 px-3 text-sm font-semibold transition min-w-[3rem]'
            type='button'
          >
            {zoomLevel}%
          </button>
          <button
            onClick={handleZoomIn}
            aria-label='Zoom in'
            className='bg-slate-700 hover:bg-slate-600 rounded p-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed'
            type='button'
            disabled={zoomLevel >= 200}
          >
            <MagnifyingGlassPlusIcon className='h-4 w-4' />
          </button>
        </div>

        {/* Heart Donation Button */}
        <button
          onClick={() => window.electron.openUrl('https://yusefwilson.com')}
          aria-label='Donate with heart'
          className='bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg p-1.5 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1'
          type='button'
        >
          <HeartIcon className='h-4 w-4' />
        </button>

        {/* Window Control Buttons */}
        <div className='flex items-center ml-2'>
          <button
            onClick={() => window.electron.windowMinimize()}
            aria-label='Minimize window'
            className='hover:bg-slate-700 p-2 transition-colors'
            type='button'
          >
            <MinusIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => {
              window.electron.windowMaximize();
              setIsMaximized(!isMaximized);
            }}
            aria-label='Maximize window'
            className='hover:bg-slate-700 p-2 transition-colors'
            type='button'
          >
            {isMaximized ? (
              <VscChromeRestore className='h-4 w-4' />
            ) : (
              <VscChromeMaximize className='h-4 w-4' />
            )}
          </button>
          <button
            onClick={() => window.electron.windowClose()}
            aria-label='Close window'
            className='hover:bg-red-600 p-2 transition-colors'
            type='button'
          >
            <XMarkIcon className='h-4 w-4' />
          </button>
        </div>
      </div>
    </nav>
  );
}
