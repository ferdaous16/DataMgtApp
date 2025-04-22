import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AnnouncementForm = ({ onSuccess }) => {
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    important: false,
    expires_at: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const announcementData = {
        ...formData,
        author_id: user.id,
        published_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('announcements')
        .insert(announcementData);
    
        
      if (error) throw error;
      
      setFormData({
        title: '',
        content: '',
        category: 'general',
        important: false,
        expires_at: ''
      });

      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error creating announcement:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring-black"
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows="5"
          className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring-black"
        />
      </div>
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-black focus:ring-black"
        >
          <option value="general">General</option>
          <option value="hr">HR</option>
          <option value="project">Project</option>
          <option value="it">IT</option>
          <option value="office">Office</option>
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="important"
          name="important"
          checked={formData.important}
          onChange={handleChange}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
        />
        <label htmlFor="important" className="ml-2 block text-sm text-gray-700">
          Mark as important
        </label>
      </div>
      
      <div>
        <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
          Expiration Date (optional)
        </label>
        <input
          type="date"
          id="expires_at"
          name="expires_at"
          value={formData.expires_at}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Announcement'}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;