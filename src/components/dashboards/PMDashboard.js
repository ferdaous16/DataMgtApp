import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import DocumentList from '../../components/DocumentList';
import LeaveRequestForm from '../LeaveRequestForm';
import LeaveCalendar from '../LeaveCalendar';
import AddTeamMemberModal from '../AddTeamMemberModal';
import AnnouncementTab from '../AnnouncementTab';
import AnnouncementWidget from '../AnnouncementWidget';



const PMDashboard = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [projectForm, setProjectForm] = useState({});
  const [taskForm, setTaskForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projectOverview');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

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

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status, start_date, deadline, created_at, updated_at')
        .eq('manager_id', user.id);

      if (error) throw error;
      
      setProjects(data || []);
      
      if (data && data.length > 0) {
        fetchTasksForProjects(data.map(p => p.id));
        fetchTeamMembersForProjects(data.map(p => p.id));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasksForProjects = async (projectIds) => {
    if (!projectIds.length) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('project_id', projectIds);

      if (error) throw error;
      
      const tasksWithEmployees = [...data];
      
      const employeeIds = data
        .map(task => task.assigned_to)
        .filter(id => id);
      
      if (employeeIds.length) {
        const { data: employeeData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', employeeIds);
          
        if (employeeData) {
          tasksWithEmployees.forEach(task => {
            if (task.assigned_to) {
              const employee = employeeData.find(emp => emp.id === task.assigned_to);
              if (employee) {
                task.assigned_to_employee = employee;
              }
            }
          });
        }
      }
      
      setTasks(tasksWithEmployees);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchTeamMembersForProjects = async (projectIds) => {
    if (!projectIds.length) return;
    
    try {
      const { data: memberData, error } = await supabase
        .from('project_members')
        .select('project_id, profile_id')
        .in('project_id', projectIds)
        .limit(100); 

      if (error) throw error;
      
      if (memberData && memberData.length) {
        const profileIds = memberData.map(m => m.profile_id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role')
          .in('id', profileIds);
          
        if (profileError) throw profileError;
        
        const teamMembersWithInfo = memberData.map(member => {
          const profile = profileData.find(p => p.id === member.profile_id);
          return {
            ...member,
            profile
          };
        });
        
        setTeamMembers(teamMembersWithInfo);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role');

      if (error) throw error;
      
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchEmployees();
    }
  }, [user]);

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

  const handleCreateProject = async () => {
    const newProject = {
      name: 'New Project',
      description: 'Project description',
      status: 'In Progress',
      start_date: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      manager_id: user.id
    };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select();

      if (error) throw error;
      
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', id);
      
      const { error: membersError } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', id);
        
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setProjectForm({...project});
  };

  const handleUpdateProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(projectForm)
        .eq('id', editingProjectId);

      if (error) throw error;
      
      setEditingProjectId(null);
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleCreateTask = async (projectId) => {
    const newTask = {
      title: 'New Task',
      description: 'Task description',
      priority: 'medium',
      status: 'pending',
      due_date: new Date().toISOString().split('T')[0],
      project_id: projectId
    };

    try {
      const { error } = await supabase
        .from('tasks')
        .insert(newTask);

      if (error) throw error;
      
      fetchTasksForProjects([projectId]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (id, projectId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchTasksForProjects([projectId]);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({...task});
  };

  const handleUpdateTask = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(taskForm)
        .eq('id', editingTaskId);

      if (error) throw error;
      
      setEditingTaskId(null);
      const projectId = taskForm.project_id;
      if (projectId) {
        fetchTasksForProjects([projectId]);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddTeamMember = async (projectId) => {
    setSelectedProjectId(projectId);
    setShowMemberModal(true);
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
      .select('leave_type, balance')
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

  const getProjectMembers = (projectId) => {
    return teamMembers
      .filter(member => member.project_id === projectId)
      .map(member => member.profile)
      .filter(profile => profile); // Filter out any undefined profiles
  };

  const getTasksForProject = (projectId) => {
    return tasks.filter(task => task.project_id === projectId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const tabs = [
    { id: 'projectOverview', label: 'Project Overview' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'documents', label: 'My Documents' },
    { id: 'leaves', label: 'Leave Management' }
  ];

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
              <div className="p-6">
                 <div className="mb-6">
                  <AnnouncementWidget limit={3} />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">My Projects & Tasks</h2>
                  <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={handleCreateProject}
                  >
                    Add New Project
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No projects found. Create your first project to get started.</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="border p-6 mb-6 bg-white shadow rounded-lg">
                      {editingProjectId === project.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Project Name</label>
                            <input
                              value={projectForm.name || ''}
                              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                              className="border rounded p-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                              value={projectForm.description || ''}
                              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                              className="border rounded p-2 w-full"
                              rows="3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                              value={projectForm.status || ''}
                              onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                              className="border rounded p-2 w-full"
                            >
                              <option value="planning">Planning</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="on_hold">On Hold</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Start Date</label>
                              <input
                                type="date"
                                value={projectForm.start_date || ''}
                                onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                                className="border rounded p-2 w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Deadline</label>
                              <input
                                type="date"
                                value={projectForm.deadline || ''}
                                onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                                className="border rounded p-2 w-full"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={handleUpdateProject} 
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingProjectId(null)} 
                              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold">{project.name}</h3>
                              <p className="text-gray-600 mt-1">{project.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditProject(project)} 
                                className="text-blue-500 hover:text-blue-700"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteProject(project.id)} 
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Status</p>
                              <p className="font-semibold capitalize">{project.status || 'Not set'}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Start Date</p>
                              <p className="font-semibold">{formatDate(project.start_date)}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Deadline</p>
                              <p className="font-semibold">{formatDate(project.deadline)}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Team Members</p>
                              <p className="font-semibold">{getProjectMembers(project.id).length || 0}</p>
                            </div>
                          </div>
                        </>
                      )}
      
                      {/* Project Team Members */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-lg">Team Members</h4>
                          <button 
                            className="text-blue-500 text-sm"
                            onClick={() => handleAddTeamMember(project.id)}
                          >
                            + Add Member
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getProjectMembers(project.id).map((member) => (
                            <div key={member.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              {member.first_name} {member.last_name}
                            </div>
                          ))}
                          {getProjectMembers(project.id).length === 0 && (
                            <p className="text-gray-500 text-sm">No team members assigned yet</p>
                          )}
                        </div>
                      </div>
                      {showMemberModal && (
                        <AddTeamMemberModal
                          employees={employees}
                          selectedEmployeeId={selectedEmployeeId}
                          setSelectedEmployeeId={setSelectedEmployeeId}
                          onAdd={async () => {
                            if (!selectedEmployeeId) return;
                            const { error } = await supabase.from('project_members').insert({
                              project_id: selectedProjectId,
                              profile_id: selectedEmployeeId,
                            });
                            if (!error) {
                              fetchTeamMembersForProjects([selectedProjectId]);
                              setShowMemberModal(false);
                              setSelectedEmployeeId('');
                            } else {
                              console.error('Error adding team member:', error);
                            }
                          }}
                          onCancel={() => setShowMemberModal(false)}
                        />
                      )}

      
                      {/* Tasks for this project */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-lg">Tasks</h4>
                          <button 
                            onClick={() => handleCreateTask(project.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            + Add Task
                          </button>
                        </div>
                        
                        {getTasksForProject(project.id).length === 0 ? (
                          <p className="text-gray-500 text-sm">No tasks created for this project yet</p>
                        ) : (
                          <div className="space-y-3">
                            {getTasksForProject(project.id).map((task) => (
                              <div key={task.id} className="border p-4 rounded-lg bg-gray-50">
                                {editingTaskId === task.id ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">Title</label>
                                      <input
                                        value={taskForm.title || ''}
                                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                        className="border rounded p-2 w-full"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">Description</label>
                                      <textarea
                                        value={taskForm.description || ''}
                                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                        className="border rounded p-2 w-full"
                                        rows="2"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <select
                                          value={taskForm.status || ''}
                                          onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                                          className="border rounded p-2 w-full"
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="in_progress">In Progress</option>
                                          <option value="completed">Completed</option>
                                          <option value="blocked">Blocked</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                          value={taskForm.priority || ''}
                                          onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                          className="border rounded p-2 w-full"
                                        >
                                          <option value="low">Low</option>
                                          <option value="medium">Medium</option>
                                          <option value="high">High</option>
                                          <option value="urgent">Urgent</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                        <input
                                          type="date"
                                          value={taskForm.due_date || ''}
                                          onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                          className="border rounded p-2 w-full"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                                        <select
                                          value={taskForm.assigned_to || ''}
                                          onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                                          className="border rounded p-2 w-full"
                                        >
                                          <option value="">-- Not Assigned --</option>
                                          {employees.map(employee => (
                                            <option key={employee.id} value={employee.id}>
                                              {employee.first_name} {employee.last_name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={handleUpdateTask} 
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                      >
                                        Save
                                      </button>
                                      <button 
                                        onClick={() => setEditingTaskId(null)} 
                                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <div>
                                        <h5 className="font-medium">{task.title}</h5>
                                        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => handleEditTask(task)} 
                                          className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                          Edit
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteTask(task.id, project.id)} 
                                          className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                      <div>
                                        <p className="text-xs text-gray-500">Status</p>
                                        <p className={`text-sm font-medium capitalize ${
                                          task.status === 'completed' ? 'text-green-600' :
                                          task.status === 'blocked' ? 'text-red-600' :
                                          task.status === 'in_progress' ? 'text-blue-600' :
                                          'text-gray-600'
                                        }`}>
                                          {task.status || 'Not set'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Priority</p>
                                        <p className={`text-sm font-medium capitalize ${
                                          task.priority === 'urgent' ? 'text-red-600' :
                                          task.priority === 'high' ? 'text-orange-600' :
                                          task.priority === 'medium' ? 'text-yellow-600' :
                                          'text-green-600'
                                        }`}>
                                          {task.priority || 'Not set'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Due Date</p>
                                        <p className="text-sm">{formatDate(task.due_date)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Assigned To</p>
                                        {task.assigned_to_employee ? (
                                          <p className="text-sm">
                                            {task.assigned_to_employee.first_name} {task.assigned_to_employee.last_name}
                                          </p>
                                        ) : (
                                          <p className="text-sm text-gray-500">Not assigned</p>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            ) : activeTab === 'announcements' ? (
              <AnnouncementTab userRole={user?.role} />
            ) : activeTab === 'documents' ? (
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
            ) : (
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