import React from 'react';
// 1. UPDATE: Change the import path to reference the new assets folder
import ArtecoLogo from '../assets/Arteco Logo.png'; 

const Header: React.FC = () => {
  return (
    <header className="bg-[#246A73] text-white p-4 shadow-md flex justify-between items-center">
      
      {/* Container for Logo and Title, using flex to align them horizontally */}
      <div className="flex items-center space-x-3">
        
        {/* 2. The Image Tag */}
        <img 
          src={ArtecoLogo} 
          alt="Arteco Logo" 
          // Keep the sizing classes from before
          className="w-8 h-8 object-contain" 
        />
        
        {/* 3. The Project Title */}
        <div className="text-xl font-bold">
          Arteco Bulk Import Portal
        </div>
      </div>
      
      {/* The rest of the header content (now empty) */}
      
    </header>
  );
};

export default Header;