import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '@heroicons/react/outline';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // Mock search suggestions
  const suggestions = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' }
  ];

  // Handle input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim().length > 0) {
      setIsSearching(true);
      // Filter suggestions based on input
      const filtered = suggestions.filter(
        item => 
          item.symbol.toLowerCase().includes(value.toLowerCase()) || 
          item.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    } else {
      setIsSearching(false);
      setResults([]);
    }
  };

  // Handle selection or form submission
  const handleSelect = (symbol) => {
    navigate(`/stock/${symbol}`);
    setSearchTerm('');
    setIsSearching(false);
    setResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length > 0) {
      // Try to find exact match first
      const exactMatch = suggestions.find(
        item => item.symbol.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (exactMatch) {
        handleSelect(exactMatch.symbol);
      } else if (results.length > 0) {
        // If no exact match but we have results, select the first one
        handleSelect(results[0].symbol);
      }
    }
  };

  return (
    <div className="relative max-w-xs w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </form>
      
      {isSearching && results.length > 0 && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md z-10 max-h-60 overflow-auto">
          <ul className="py-1">
            {results.map((item) => (
              <li
                key={item.symbol}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => handleSelect(item.symbol)}
              >
                <div className="font-medium text-gray-900 dark:text-white">{item.symbol}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{item.name}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;