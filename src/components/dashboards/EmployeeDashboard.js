import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import DocumentList from '../DocumentList';
import LeaveRequestForm from '../LeaveRequestForm';
import LeaveCalendar from '../LeaveCalendar';
import AnnouncementWidget from '../AnnouncementWidget';
import AnnouncementList from '../AnnouncementList';
import DashboardHeader from '../DashboardHeader';


const EmployeeDashboard = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id, first_name, last_name');
        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

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
          fetchProjects(),
          fetchTasks(),
          fetchLeaveRequests(),
          fetchLeaveBalance(), 
          fetchLeaveTypes()
        ]);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('profile_id', user.id);
      
      if (memberError) throw memberError;
      
      if (memberProjects && memberProjects.length > 0) {
        const projectIds = memberProjects.map(pm => pm.project_id);
        
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*, profiles:manager_id(first_name, last_name)')
          .in('id', projectIds);
        
        if (projectError) throw projectError;
        setProjects(projectData || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects:project_id(name, status)
        `)
        .eq('assigned_to', user.id);
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

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

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const tabs = [
    { id: 'tasks', label: 'My Tasks' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'projects', label: 'My Projects' },
    { id: 'documents', label: 'My Documents' },
    { id: 'leaves', label: 'Leave Management' }
  ];

  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(task => task.project_id.toString() === selectedProject);

  const getTaskMetrics = () => {
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const total = tasks.length;
    const upcomingDeadlines = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const inNextWeek = new Date();
      inNextWeek.setDate(today.getDate() + 7);
      return task.status !== 'Completed' && dueDate > today && dueDate <= inNextWeek;
    }).length;

    // Calculate on-time completion percentage
    const completedTasks = tasks.filter(task => task.status === 'Completed');
    let onTimeCount = 0;
    if (completedTasks.length > 0) {
      onTimeCount = completedTasks.filter(task => {
        const dueDate = new Date(task.due_date);
        const completedDate = new Date(task.updated_at);
        return completedDate <= dueDate;
      }).length;
    }
    const onTimePercentage = completedTasks.length > 0 
      ? Math.round((onTimeCount / completedTasks.length) * 100) 
      : 100;

    return {
      completed,
      total,
      upcomingDeadlines,
      onTimePercentage
    };
  };

  const metrics = getTaskMetrics();
  
  // Handle leave request notifications



  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <DashboardHeader user={user} employees={employees} />

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
            {activeTab === 'tasks' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-6">
                  <AnnouncementWidget limit={3}
                    onViewAll={() => setActiveTab('announcements')}
                  />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">My Tasks</h2>
                  <div>
                    <label htmlFor="project-filter" className="mr-2 text-sm text-gray-600">Filter by Project:</label>
                    <select
                      id="project-filter"
                      className="border border-gray-300 rounded-md p-1 text-sm"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                    >
                      <option value="all">All Projects</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id.toString()}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks found for the selected project.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Task
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTasks.map((task) => (
                          <tr key={task.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{task.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{task.projects?.name || 'N/A'}</div>
                              <div className={`text-xs inline-block px-2 py-1 rounded-full ${
                                task.projects?.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                task.projects?.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {task.projects?.status || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-green-100 text-green-800'}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                  task.status === 'Pending' ? 'bg-gray-100 text-gray-800' : 
                                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'}`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${
                                new Date(task.due_date) < new Date() && task.status !== 'Completed' 
                                  ? 'text-red-600 font-medium' 
                                  : 'text-gray-500'
                              }`}>
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <select 
                                className="text-blue-600 bg-white border border-gray-300 rounded-md p-1"
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-sm font-medium text-gray-500">Tasks Completed</h4>
                        <p className="mt-1 text-2xl font-semibold">{metrics.completed}/{metrics.total}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-sm font-medium text-gray-500">On-time Completion</h4>
                        <p className="mt-1 text-2xl font-semibold">{metrics.onTimePercentage}%</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-sm font-medium text-gray-500">Upcoming Deadlines (7 days)</h4>
                        <p className="mt-1 text-2xl font-semibold">{metrics.upcomingDeadlines} tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'announcements' && (
              <AnnouncementList userRole="Employee" />
            )}
            {activeTab === 'projects' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">My Projects</h2>
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    You're not assigned to any projects yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map(project => (
                      <div key={project.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className={`p-4 ${
                          project.status === 'Active' ? 'bg-green-50 border-b border-green-100' :
                          project.status === 'Completed' ? 'bg-blue-50 border-b border-blue-100' :
                          project.status === 'On Hold' ? 'bg-yellow-50 border-b border-yellow-100' :
                          'bg-gray-50 border-b border-gray-100'
                        }`}>
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium">{project.name}</h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              project.status === 'Active' ? 'bg-green-100 text-green-800' :
                              project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div>
                              <p className="text-gray-500">Manager</p>
                              <p>{project.profiles?.first_name} {project.profiles?.last_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Timeline</p>
                              <p>{new Date(project.start_date).toLocaleDateString()} - {new Date(project.deadline).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button 
                              onClick={() => {
                                setActiveTab('tasks');
                                setSelectedProject(project.id.toString());
                              }}
                              className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md"
                            >
                              View Tasks
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">My Documents</h2>
                <DocumentList 
                  userRole="Employee"
                  showEmployeeFilter={false}
                  defaultFilters={{
                    employeeId: user?.id,
                    documentType: ''
                  }}
                  allowedActions={{
                    delete: false,
                    download: true,
                    viewConfidential: false
                  }}
                  hideColumns={['employee']}
                />
              </div>
            )}

            {activeTab === 'leaves' && (
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

export default EmployeeDashboard;