// src/App.tsx

import React from 'react';
import HomePage from './pages/HomePage'; 
import MainLayout from './components/MainLayout'; // <-- NEW IMPORT
import './App.css'; 

const App: React.FC = () => {
  return (
    // Wrap the HomePage inside the MainLayout
    <MainLayout> 
      <HomePage /> 
    </MainLayout>
  );
};

export default App;