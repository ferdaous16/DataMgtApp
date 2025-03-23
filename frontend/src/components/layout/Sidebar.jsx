import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiHome, 
  HiDocumentText, 
  HiUserGroup, 
  HiChartBar, 
  HiCalendar,
  HiCog,
  HiClipboardCheck,
  HiLightningBolt,
  HiInformationCircle
} from 'react-icons/hi';
import styles from '../../styles/Sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoContainer}>
          <HiLightningBolt size={24} color="#4a8cff" />
          <h1 className={styles.logoTitle}>WorkFlow</h1>
        </div>
        <div className={styles.logoSubtitle}>HR Management System</div>
      </div>
      
      {/* User Info */}
      <div className={styles.userInfo}>
        <div className={styles.userAvatar}>JP</div>
        <div>
          <div className={styles.userName}>John Peterson</div>
          <div className={styles.userRole}>HR Manager</div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className={styles.navigation}>
        <div className={styles.navSection}>Main</div>
        <NavLink to="/dashboard" className={({ isActive }) => 
          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
        }>
          <HiHome className={styles.navIcon} size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/documents" className={({ isActive }) => 
          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
        }>
          <HiDocumentText className={styles.navIcon} size={20} />
          <span>Documents</span>
        </NavLink>
        
        <NavLink to="/employees" className={({ isActive }) => 
          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
        }>
          <HiUserGroup className={styles.navIcon} size={20} />
          <span>Employees</span>
        </NavLink>
        
        <NavLink to="/performance" className={({ isActive }) => 
          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
        }>
          <HiChartBar className={styles.navIcon} size={20} />
          <span>Performance</span>
        </NavLink>
        
        <NavLink to="/time-off" className={({ isActive }) => 
          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
        }>
          <HiCalendar className={styles.navIcon} size={20} />
          <span>Time Off</span>
        </NavLink>
        
        <div className={styles.navSection}>Other</div>
        <NavLink to="/tasks" className={({ isActive }) => 
          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
        }>
          <HiClipboardCheck className={styles.navIcon} size={20} />
          <span>Tasks</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => 
          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
        }>
          <HiCog className={styles.navIcon} size={20} />
          <span>Settings</span>
        </NavLink>
        
        <NavLink to="/help" className={({ isActive }) => 
          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
        }>
          <HiInformationCircle className={styles.navIcon} size={20} />
          <span>Help</span>
        </NavLink>
      </nav>
      
      {/* Bottom Version */}
      <div className={styles.version}>
        WorkFlow HR v1.0.0
      </div>
    </div>
  );
};

export default Sidebar; 
