import React from 'react';
import { HiBell, HiSearch, HiMenu } from 'react-icons/hi';
import styles from '../../styles/Header.module.css';

const Header = ({ toggleSidebar }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className={styles.menuButton}
          >
            <HiMenu size={24} />
          </button>
          
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />
            <HiSearch className={styles.searchIcon} size={16} />
          </div>
        </div>
        
        <div className={styles.actionsContainer}>
          <button className={styles.notificationButton}>
            <HiBell size={20} />
            <span className={styles.notificationBadge}>3</span>
          </button>
          
          <button className={styles.userButton}>
            <div className={styles.userAvatar}>JP</div>
            <span className={styles.userName}>John Peterson</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 
