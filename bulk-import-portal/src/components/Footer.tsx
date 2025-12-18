import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#246A73] text-white p-3 text-center text-sm mt-auto">
      &copy; {new Date().getFullYear()} Arteco System. All rights reserved.
    </footer>
  );
};

export default Footer;