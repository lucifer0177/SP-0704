import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RealTimeDataProvider } from './contexts/RealTimeDataContext';
import Navbar from './components/Navbar';
import RealTimeDashboard from './components/RealTimeDashboard';
import StockDetailsPage from './pages/StockDetailsPage';
import './index.css';

function App() {
  return (
    <Router>
      <RealTimeDataProvider>
        <div className="min-h-screen bg-gray-900 text-gray-200">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<RealTimeDashboard />} />
              <Route path="/stock/:symbol" element={<StockDetailsPage />} />
            </Routes>
          </main>
        </div>
      </RealTimeDataProvider>
    </Router>
  );
}

export default App;