import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, session }) => {
  if (!session) {
    return <Navigate to="/signin" />;
  }
  
  return children;
};

export default ProtectedRoute;