// src/components/BulkImportForm.tsx

import React, { useState, FormEvent } from 'react';

interface BulkImportFormProps {
  apiEndpoint: string; 
  importType: string; 
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const BulkImportForm: React.FC<BulkImportFormProps> = ({ apiEndpoint, importType }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setStatus('idle');
      setMessage(`Selected file: ${event.target.files[0].name}`);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!file) {
      setMessage('Please select a file before submitting.');
      return;
    }

    setStatus('uploading');
    setMessage('Reading file and starting import...');

    try {
      // 1. Read the file content as raw text instead of using FormData
      // This matches the req.text() expectation on the backend
      const csvText = await file.text();

      // 2. Send the raw string in the body
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv', // Explicitly set the content type
        },
        body: csvText,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message || 'Import completed successfully.');
      } else {
        setStatus('error');
        setMessage(result.message || result.error || 'Import failed.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const renderStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return <p className="text-blue-600 animate-pulse">Processing import... please wait.</p>;
      case 'success':
        return <p className="text-green-600 font-bold">{message}</p>;
      case 'error':
        return <p className="text-red-500 font-bold">{message}</p>;
      case 'idle':
      default:
        return message ? <p className="text-gray-600 text-sm italic">{message}</p> : null;
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{importType}</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor={`csvFile-${importType}`} className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV Data
          </label>
          <input
            id={`csvFile-${importType}`}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              cursor-pointer"
            disabled={status === 'uploading'}
          />
        </div>

        <div className="min-h-[24px] mb-4">
          {renderStatusMessage()}
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
            !file || status === 'uploading'
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#246A73] hover:bg-[#1A4B51]'
          }`}
          disabled={!file || status === 'uploading'}
        >
          {status === 'uploading' ? 'Importing...' : 'Start Bulk Import'}
        </button>
      </form>
    </div>
  );
};

export default BulkImportForm;