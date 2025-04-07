import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import SearchBar from '../common/SearchBar';
import { SunIcon, MoonIcon, MenuIcon, XIcon } from '@heroicons/react/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Watchlist', path: '/watchlist' },
    { name: 'Analysis', path: '/analysis' }
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-6" />
              </svg>
              <span className="ml-2 text-xl font-bold text-blue-600">StockPredictAI</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <SearchBar />
          </div>
          
          <div className="hidden md:block">
            <nav className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            </nav>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Main menu"
              aria-expanded="false"
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        <div className="md:hidden">
          {isMenuOpen && (
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <SearchBar />
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={toggleDarkMode}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        <p>Market: {currentDate} | <span className="text-green-500">DOW +1.2%</span> | <span className="text-red-500">NASDAQ -0.5%</span> | <span className="text-green-500">S&P 500 +0.8%</span></p>
      </div>
    </header>
  );
};

export default Header;