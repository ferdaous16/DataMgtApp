import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AnnouncementForm = ({ onSuccess }) => {
  const today = new Date();
  today.setHours(23, 59, 0, 0);
  const defaultExpiration = today.toISOString().slice(0, 16);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    important: false,
    expires_at: defaultExpiration,
    photo_url: null
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
        published_at: new Date().toISOString(),
        photo_url: formData.photo_url
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
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `announcement-photos/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('announcements')
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
      const { data: { publicUrl } } = supabase.storage
        .from('announcements')
        .getPublicUrl(filePath);
  
      setFormData({ ...formData, photo_url: publicUrl });
      setPhotoFile(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(error.message);
    } finally {
      setUploadingPhoto(false);
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
          type="datetime-local"
          id="expires_at"
          name="expires_at"
          value={formData.expires_at}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
          Photo (optional)
        </label>
        <input
          type="file"
          id="photo"
          accept="image/*"
          onChange={handlePhotoUpload}
          disabled={uploadingPhoto}
          className="mt-1 block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        {uploadingPhoto && (
          <p className="mt-1 text-sm text-gray-500">Uploading photo...</p>
        )}
        {formData.photo_url && !uploadingPhoto && (
          <div className="mt-2">
            <img
              src={formData.photo_url}
              alt="Preview"
              className="max-w-xs h-auto rounded-md"
            />
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, photo_url: null });
                setPhotoFile(null);
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove photo
            </button>
          </div>
        )}
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