import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Components
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import HRDashboard from './components/dashboards/HRDashboard';
import PMDashboard from './components/dashboards/PMDashboard';
import EmployeeDashboard from './components/dashboards/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // First try to get role from user metadata (faster than a DB query)
        if (session.user.user_metadata && session.user.user_metadata.role) {
          setUserRole(session.user.user_metadata.role);
          setLoading(false);
        } else {
          // Fallback to DB query if not in metadata
          fetchUserRole(session.user.id);
        }
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          // First try to get role from user metadata
          if (session.user.user_metadata && session.user.user_metadata.role) {
            setUserRole(session.user.user_metadata.role);
            setLoading(false);
          } else {
            // Fallback to DB query
            fetchUserRole(session.user.id);
          }
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      // Try to get role from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role from profiles:', error);
        // If profiles fetch fails, try to get from user's metadata
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user && user.user_metadata && user.user_metadata.role) {
          setUserRole(user.user_metadata.role);
        } else {
          console.error('Could not determine user role');
          // Set a default role
          setUserRole('Employee');
        }
      } else {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error in role determination:', error);
      // Set a default role as fallback
      setUserRole('Employee');
    } finally {
      setLoading(false);
    }
  };

  // Helper component to render the correct dashboard based on role
  const DashboardSelector = () => {
    if (!userRole) {
      return <div>Loading role information...</div>;
    }
    
    switch (userRole) {
      case 'HR Manager':
        return <HRDashboard />;
      case 'Project Manager':
        return <PMDashboard />;
      case 'Employee':
      default:
        return <EmployeeDashboard />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={!session ? <SignUp /> : <Navigate to="/dashboard" />} />
          <Route path="/signin" element={!session ? <SignIn /> : <Navigate to="/dashboard" />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute session={session}>
                <DashboardSelector />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;