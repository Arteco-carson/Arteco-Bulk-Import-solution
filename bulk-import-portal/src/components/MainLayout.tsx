import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    // CRITICAL CHANGE 1: Use h-screen (fixed height) and overflow-hidden
    // This forces the container to fill the viewport and prevents vertical scrolling on the body.
    <div className="flex flex-col h-screen overflow-hidden">
      
      <Header />
      
      {/* Main Content Area: Sidebar and Content Container */}
      {/* CRITICAL CHANGE 2: Use flex-1 instead of flex-grow to explicitly fill vertical space */}
      <div className="flex flex-1">
        <Sidebar />
        
        {/* Page Content: Scrollable main area */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;