import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';

const DocumentManager = () => {
  const [userRole, setUserRole] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoleAndEmployees = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id);

        if (profileError) throw profileError;

        const role = profile?.role || '';
        if (role === 'HR Manager') {
          setUserRole('HR Manager');
        } else if (role === 'Project Manager') {
          setUserRole('Project Manager');
        } else {
          setUserRole('Employee');
        }

        // Fetch employees for HR Manager and Project Manager
        if (role === 'HR Manager' || role === 'Project Manager') {
          const { data: employeesData, error: employeesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email');

          if (employeesError) throw employeesError;
          setEmployees(employeesData);
        }

      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndEmployees();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Document Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {userRole === 'HR Manager' && (
          <div className="lg:col-span-1">
            <DocumentUpload 
              allowedDocumentTypes={[
                'employee_id',
                'contract',
                'performance_review',
                'policy_document',
                'tax_document',
                'other'
              ]}
              showConfidentialOption={true}
              showEmployeeSelect={true}
              employees={employees || []}
            />
          </div>
        )}

        <div className={userRole === 'HR Manager' || userRole === 'Project Manager' ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <DocumentList 
            userRole={userRole}
            showEmployeeFilter={userRole === 'HR Manager'}
            employees={employees || []}
            allowedActions={{
              delete: userRole === 'HR Manager',
              download: true,
              viewConfidential: userRole === 'HR Manager'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
