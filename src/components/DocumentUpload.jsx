import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { DocumentService } from '../services/documentService';

const DocumentUpload = ({ 
  allowedDocumentTypes = ['employee_id', 'contract', 'performance_review', 'project_report', 'tax_document', 'other'],
  showConfidentialOption = true,
  showEmployeeSelect = true,
  employees = []
}) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('employee_id');
  const [employee, setEmployee] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Only PDF files are allowed.');
        return;
      }

      if (selectedFile.size > maxSize) {
        setError('File is too large. Max size is 5MB.');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || (showEmployeeSelect && !employee)) {
      setError('Please select a file' + (showEmployeeSelect ? ' and an employee' : ''));
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User authentication failed');
      }
      
      await DocumentService.uploadDocument(file, {
        documentType,
        employeeId: employee,
        uploadedBy: user.id,
        confidential: isConfidential
      });
      
      setMessage('Document uploaded successfully!');
      
      setTimeout(() => setMessage(''), 5000);
      
      setFile(null);
      setDocumentType('employee_id');
      setIsConfidential(false);
      setEmployee('');
      
      e.target.reset();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document. Please try again.');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      
      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {employees.length === 0 && showEmployeeSelect && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          No employees available. Employee data may be loading or unavailable.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            disabled={loading}
          >
            {allowedDocumentTypes.map(type => (
              <option key={type} value={type}>
                {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
        
        {showEmployeeSelect && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={loading || employees.length === 0}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name || `${emp.first_name} ${emp.last_name}`} {emp.email ? `(${emp.email})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">Only PDF files up to 5MB are allowed</p>
        </div>
        
        {showConfidentialOption && (
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="confidential"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="mr-2"
              disabled={loading}
            />
            <label htmlFor="confidential" className="text-sm text-gray-700">
              Mark as Confidential
            </label>
          </div>
        )}
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading || (showEmployeeSelect && employees.length === 0)}
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload;