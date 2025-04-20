import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { DocumentService } from '../../services/documentService';
import DocumentList from '../../components/DocumentList';
import LeaveRequestForm from '../LeaveRequestForm';
import LeaveCalendar from '../LeaveCalendar';

const PMDashboard = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([
    { id: 1, name: 'Website Redesign', status: 'In Progress', members: 5, deadline: '2025-06-01' },
    { id: 2, name: 'Mobile App Development', status: 'Planning', members: 3, deadline: '2025-08-15' },
    { id: 3, name: 'Database Migration', status: 'Completed', members: 2, deadline: '2025-03-30' },
  ]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchInitialData = async () => {
      if (user) {
        await Promise.all([
          fetchLeaveRequests(),
          fetchLeaveBalance(), 
          fetchLeaveTypes()
        ]);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user]);
  const fetchLeaveRequests = async () => {
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', user.id);
    setLeaveRequests(data || []);
  };
  const fetchLeaveBalance = async () => {
    const { data: balances } = await supabase
      .from('leave_balances')
      .select('leave_type, balance', 'leave_types(name)')
      .eq('employee_id', user.id)
      .eq('year', new Date().getFullYear());
    const balanceMap = {};
    balances?.forEach(entry => {
      balanceMap[entry.leave_type] = entry.balance;
    });
  
    setLeaveBalance(balanceMap);
  };
  const fetchLeaveTypes = async () => {
    const { data } = await supabase.from('leave_types').select('*');
    setLeaveTypes(data || []);
  };
  const tabs = [
    { id: 'projectOverview', label: 'Project Overview' },
    { id: 'documents', label: 'My Documents' },
    { id: 'leaves', label: 'Leave Management' }
  ];
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Project Manager Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome,</p>
              <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="px-4 py-6 sm:px-0">
          {activeTab === 'projectOverview' ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Project Overview</h2>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600">
                  Add Project
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Members
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                              project.status === 'Planning' ? 'bg-blue-100 text-blue-800' : 
                                'bg-green-100 text-green-800'}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{project.members}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{project.deadline}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
          
        ) : activeTab === 'documents' ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">My Documents</h2>
              {user && (
                <DocumentList
                  userRole="PM"
                  showEmployeeFilter={false}
                  defaultFilters={{
                    employeeId: user.id,
                    documentType: ''
                  }}
                  allowedActions={{
                    delete: false,
                    download: true,
                    viewConfidential: false
                  }}
                  hideColumns={['employee']}
                />
              )}
            </div>
          </div>
        ):(
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="space-y-6">
                
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">New Leave Request</h2>
                    <LeaveRequestForm 
                      onSuccess={fetchLeaveRequests}
                      balance={leaveBalance}
                    />
                  </div>

                
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">My Requests</h2>
                    {leaveRequests.length === 0 ? (
                      <p className="text-gray-600">No leave requests submitted yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {leaveRequests.map((req, index) => (
                          <div key={index} className="border p-3 rounded-md">
                            <p className="text-sm text-gray-600">
                              Type: {leaveTypes.find(t => t.id === req.leave_type)?.name || 'Unknown'}
                            </p>
                            <p className="text-sm">
                              From: {new Date(req.start_date).toLocaleDateString()} To: {new Date(req.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm">Reason: {req.reason}</p>
                            <p className={`text-sm font-semibold ${
                              req.status === 'approved' ? 'text-green-600' :
                              req.status === 'rejected' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              Status: {req.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                  
                
            <div className="space-y-6">
                
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Leave Calendar</h2>
                  <LeaveCalendar userId={user.id} />
                </div>
                
              
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Leave Balance</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {leaveTypes.map(type => (
                      <div key={type.id} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">{type.name}</p>
                        <p className="text-2xl font-bold">{leaveBalance[type.id] || 0} days</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PMDashboard;
