import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DocumentService } from '../services/documentService';

const DocumentList = ({ 
  userRole = 'Employee',
  showEmployeeFilter = false,
  employees = [],
  
  allowedActions = {
    download: true,
    delete: false,
    viewConfidential: false
  },
  hideColumns = []
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const [searchParams, setSearchParams] = useState({
    fileName: '',
    documentType: '',
    employeeId: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    const fetchUserAndDocuments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        await fetchDocuments();
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load documents. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await DocumentService.getDocuments(searchParams);
      setDocuments(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments();
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDownload = async (doc) => {
    if (!allowedActions.download) return;
    
    try {
      const url = await DocumentService.getDocumentUrl(doc.file_path);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document. Please try again.');
    }
  };
  
  const confirmDelete = (document) => {
    if (!allowedActions.delete) return;
    
    setDocumentToDelete(document);
    setShowDeleteConfirm(true);
  };
  
  const handleDelete = async () => {
    if (!documentToDelete || !allowedActions.delete) return;
    
    try {
      await DocumentService.deleteDocument(documentToDelete.id);
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getDocumentTypeLabel = (type) => {
    const types = {
      employee_id: 'Employee ID',
      contract: 'Contract',
      performance_review: 'Performance Review',
      project_report: 'Project Report',
      tax_document: 'Tax Document',
      other: 'Other'
    };
    return types[type] || type;
  };
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Document Library</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSearch} className="mb-6 p-4 bg-gray-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name
            </label>
            <input
              type="text"
              name="fileName"
              value={searchParams.fileName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              name="documentType"
              value={searchParams.documentType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">All Types</option>
              <option value="employee_id">Employee ID</option>
              <option value="contract">Contract</option>
              <option value="performance_review">Performance Review</option>
              <option value="project_report">Project Report</option>
              <option value="tax_document">Tax Document</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {showEmployeeFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                name="employeeId"
                value={searchParams.employeeId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || `${emp.first_name} ${emp.last_name}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              name="dateFrom"
              value={searchParams.dateFrom}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              name="dateTo"
              value={searchParams.dateTo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div className="mt-4 text-right">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {loading ? (
        <div className="flex justify-center p-4">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center p-4 text-gray-500">No documents found matching your criteria.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">File Name</th>
                <th className="py-2 px-4 border-b">Document Type</th>
                <th className="py-2 px-4 border-b">Employee full name</th>
                <th className="py-2 px-4 border-b">Upload Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id} className={document.confidential && !allowedActions.viewConfidential ? 'bg-gray-100' : ''}>
                  <td className="py-2 px-4 border-b">
                    {document.file_name}
                    {document.confidential && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Confidential</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">{getDocumentTypeLabel(document.document_type)}</td>
                  <td className="py-2 px-4 border-b">
                    {document.profiles?.first_name && document.profiles?.last_name
                        ? `${document.profiles.first_name} ${document.profiles.last_name}`
                        : 'Unknown'}
                  </td>
                  <td className="py-2 px-4 border-b">{formatDate(document.created_at)}</td>
                  <td className="py-2 px-4 border-b">
                    {(!document.confidential || allowedActions.viewConfidential) && allowedActions.download && (
                      <button
                        onClick={() => handleDownload(document)}
                        className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                      >
                        Download
                      </button>
                    )}
                    {allowedActions.delete && (
                      <button
                        onClick={() => confirmDelete(document)}
                        className="ml-2 bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
              <p>Are you sure you want to delete this document?</p>
              <div className="mt-2">
                <button
                  onClick={handleDelete}
                  className="mr-2 bg-red-600 text-white px-4 py-2 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded"
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentList;