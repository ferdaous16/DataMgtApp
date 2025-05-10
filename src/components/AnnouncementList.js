import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AnnouncementList = ({ userRole, filter = {}, limit = 10 }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [totalCount, setTotalCount] = useState(0);
  const [authors, setAuthors] = useState({});

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'general', name: 'General' },
    { id: 'hr', name: 'HR' },
    { id: 'project', name: 'Project' },
    { id: 'it', name: 'IT' },
    { id: 'office', name: 'Office' }
  ];

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('announcements')
        .select('*', { count: 'exact' });
      
      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }
      
      if (filter.important) {
        query = query.eq('important', true);
      }
      
      const today = new Date().toISOString();
      query = query.or(`expires_at.is.null,expires_at.gt.${today}`);
      
      query = query.order('important', { ascending: false }).order('published_at', { ascending: false });
      
      query = query.range((currentPage - 1) * limit, currentPage * limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setAnnouncements(data);
      setTotalCount(count);
      
      if (data && data.length > 0) {
        const authorIds = [...new Set(data.map(a => a.author_id))];
        const { data: authorData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', authorIds);
          
        if (authorData) {
          const authorMap = {};
          authorData.forEach(author => {
            authorMap[author.id] = `${author.first_name} ${author.last_name}`;
          });
          setAuthors(authorMap);
        }
      }
      
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [activeCategory, currentPage, JSON.stringify(filter)]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      fetchAnnouncements();
      
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setUTCHours(23, 59, 0, 0);
    return date.toLocaleDateString(undefined, { 
      timeZone: 'UTC',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(category.id);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 text-sm rounded-full ${
              activeCategory === category.id
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="py-6 text-center text-gray-500">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="py-6 text-center text-gray-500">No announcements found</div>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div 
              key={announcement.id} 
              className={`border rounded-lg overflow-hidden ${
                announcement.important ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className={`px-4 py-3 flex justify-between items-center ${
                announcement.important ? 'bg-red-100' : 'bg-gray-50'
              }`}>
                <div>
                  <h3 className={`font-medium ${announcement.important ? 'text-red-800' : 'text-gray-900'}`}>
                    {announcement.important && (
                      <span className="inline-block mr-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                        Important
                      </span>
                    )}
                    {announcement.title}
                  </h3>
                  <div className="flex mt-1 text-xs text-gray-500 space-x-4">
                    <span>
                      Posted by {authors[announcement.author_id] || 'Unknown'} on {formatDate(announcement.published_at)}
                    </span>
                    <span className="capitalize">
                      Category: {announcement.category}
                    </span>
                    {announcement.expires_at && (
                      <span>
                        Expires: {formatDate(announcement.expires_at)}
                      </span>
                    )}
                  </div>
                </div>
                
                {(userRole === 'HR Manager' || userRole === 'Project Manager') && (
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Delete announcement"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="p-4 whitespace-pre-wrap text-gray-700">
                {announcement.content}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-l-md disabled:opacity-50"
            >
              Previous
            </button>
            <div className="px-4 py-1 border-t border-b">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-r-md disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;