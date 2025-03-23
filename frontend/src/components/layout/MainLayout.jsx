import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from '../../styles/MainLayout.module.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <div className={`${styles.sidebarContainer} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className={`${styles.mainContent} ${sidebarOpen ? styles.mainContentWithSidebar : styles.mainContentNoSidebar}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 
