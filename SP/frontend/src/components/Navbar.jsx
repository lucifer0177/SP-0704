import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MarketDataService from '../services/MarketDataService';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();


  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const result = await MarketDataService.searchStocks(query);
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectStock = (symbol) => {
    navigate(`/stock/${symbol}`);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-500">
              StockPredict
            </span>
            <sup className="ml-1 text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full">
              LIVE
            </sup>
          </Link>
          
          <div className="relative flex items-center flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder="Search stocks..."
              className="w-full p-2 pl-8 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
            />
            <svg 
              className="absolute left-2.5 w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-400">
                    <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(stock => (
                    <div 
                      key={stock.symbol}
                      className="p-3 hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleSelectStock(stock.symbol)}
                    >
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-sm text-gray-400">{stock.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-400">
                    No stocks found
                  </div>
                )}
              </div>
            )}
          </div>
          

            </div>
          </div>
      
    </nav>
  );
};

export default Navbar;