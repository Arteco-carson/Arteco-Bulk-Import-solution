import React from 'react';

// Define simple menu items
const menuItems = [
  { name: 'Dashboard', href: '#dashboard' },
  { name: 'Settings', href: '#settings' },
  { name: 'Reports', href: '#reports' },
];

const Sidebar: React.FC = () => {
  return (
    // The classes h-full and flex flex-col are CORRECT for vertical stretching
    <aside className="bg-[#246A73] text-white w-56 h-full flex flex-col p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-6 border-b border-white/50 pb-2">Navigation</h3>
      
      {/* 1. Main Navigation: Stays at the top */}
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <a 
                href={item.href} 
                className="block p-2 rounded hover:bg-[#1A4B51] transition-colors"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 2. CRITICAL FIX: Spacer element to push everything below it to the bottom */}
      <div className="flex-grow"></div> 

      {/* 3. New Bottom-Aligned Item (Logout) */}
      {/*<div className="pt-4 border-t border-white/20 mt-auto"> 
        <a 
          href="#logout" 
          className="block p-2 rounded hover:bg-[#1A4B51] transition-colors"
        >
          Logout
        </a>
      </div>*/}
    </aside>
  );
};

export default Sidebar;