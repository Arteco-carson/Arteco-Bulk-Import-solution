// bulk-import-portal/src/pages/HomePage.tsx

import React from 'react';
import BulkImportForm from '../components/BulkImportForm'; 

const API_BASE_URL = '/api'; 

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">
        Bulk Data Import Dashboard
      </h1>
      
      {/* 5 columns for large screens to accommodate the new card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        
        <BulkImportForm 
          importType="Company Members"
          apiEndpoint={`${API_BASE_URL}/BulkImportCompanyMembers`}
        />

        <BulkImportForm 
          importType="Events"
          apiEndpoint={`${API_BASE_URL}/BulkImportEvents`}
        />

        <BulkImportForm 
          importType="Individual Members"
          apiEndpoint={`${API_BASE_URL}/BulkImportIndividualMembers`}
        />

        <BulkImportForm 
          importType="Resources"
          apiEndpoint={`${API_BASE_URL}/BulkImportResources`}
        />

        {/* 5th Import Card for Company Contacts */}
        <BulkImportForm 
          importType="Company Contacts"
          apiEndpoint={`${API_BASE_URL}/BulkImportCompanyContacts`}
        />

      </div>
    </div>
  );
};

export default HomePage;