import React, { useState } from 'react';
import { supabase } from './supabaseClient';  // Make sure supabaseClient is correctly imported

const AddProjectForm = ({ user, fetchProjects, setShowForm }) => {
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'In Progress',
    start_date: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProject = {
      ...projectForm,
      manager_id: user.id,
    };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select();

      if (error) throw error;

      fetchProjects(); // Fetch updated projects list
      setShowForm(false); // Close form after successful submission
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="add-project-form">
      <h3>Create New Project</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Project Name</label>
          <input
            type="text"
            name="name"
            value={projectForm.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={projectForm.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Status</label>
          <select
            name="status"
            value={projectForm.status}
            onChange={handleInputChange}
          >
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Planning">Planning</option>
          </select>
        </div>
        <div>
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={projectForm.start_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Deadline</label>
          <input
            type="date"
            name="deadline"
            value={projectForm.deadline}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Create Project</button>
      </form>
      <button onClick={() => setShowForm(false)}>Cancel</button>
    </div>
  );
};

export default AddProjectForm;
