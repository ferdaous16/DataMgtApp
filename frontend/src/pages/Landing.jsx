import React, { useState, useEffect } from 'react';
import Typed from 'typed.js';
import HrImg from '../assets/HrImg.jpg';
import { HiMenu, HiX, HiChartBar, HiDocumentText, HiUserGroup, HiClock } from 'react-icons/hi';

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const typedTextRef = React.useRef(null);
  const el = React.useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const options = {
      strings: [
        'Track <span style="color: #2563eb;">Employees</span>|',
        'Manage <span style="color: #2563eb;">Teams</span>|',
        'Organize <span style="color: #2563eb;">Data</span>|',
        'Streamline <span style="color: #2563eb;">Workflows</span>|'
      ],
      typeSpeed: 80,
      backSpeed: 50,
      loop: true,
      smartBackspace: true,
      showCursor: false,
      autoInsertCss: true,
    };
    
    typedTextRef.current = new Typed(el.current, options);
    
    return () => {
      typedTextRef.current.destroy();
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Feature section component
  const FeatureCard = ({ icon, title, description }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      <div style={{
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#1f2937'
      }}>{title}</h3>
      <p style={{
        fontSize: '14px',
        color: '#6b7280',
        lineHeight: 1.6
      }}>{description}</p>
    </div>
  );

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 5%',
        backgroundColor: 'white',
        position: 'relative',
        zIndex: 1000
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#2563eb'
        }}>
          DataMgtApp
        </div>
        
        {/* Desktop Menu */}
        {windowWidth > 768 ? (
          <>
            <div style={{
              display: 'flex',
              gap: '20px'
            }}>
              <a href="#" style={{ color: '#1f2937', textDecoration: 'none' }}>Home</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Features</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <a href="/login" style={{ 
                color: '#6b7280', 
                textDecoration: 'none'
              }}>Login</a>
              <a href="/register" style={{ 
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>Sign Up</a>
            </div>
          </>
        ) : (
          <button 
            onClick={toggleMobileMenu}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMobileMenuOpen ? 
              <HiX size={24} color="#1f2937" /> : 
              <HiMenu size={24} color="#1f2937" />
            }
          </button>
        )}
      </nav>
      
      {/* Mobile Menu */}
      {windowWidth <= 768 && (
        <div style={{
          position: 'absolute',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          zIndex: 999,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isMobileMenuOpen ? 1 : 0,
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          transition: 'transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px'
        }}>
          <a href="#" style={{ 
            color: '#1f2937', 
            textDecoration: 'none', 
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6'
          }}>Home</a>
          <a href="#" style={{ 
            color: '#6b7280', 
            textDecoration: 'none', 
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6'
          }}>Features</a>
         
          <a href="#" style={{ 
            color: '#6b7280', 
            textDecoration: 'none', 
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6'
          }}>Contact</a>
          <div style={{ 
            display: 'flex', 
            padding: '16px', 
            gap: '12px',
            marginTop: '8px'
          }}>
            <a href="/login" style={{ 
              color: '#6b7280', 
              textDecoration: 'none',
              display: 'inline-block',
              padding: '8px 16px'
            }}>Login</a>
            <a href="/register" style={{ 
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>Sign Up</a>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        padding: '40px 5%',
        backgroundColor: '#f8fafc',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: '1 1 400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minWidth: '300px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            <span ref={el}></span>
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 18px)',
            color: '#4b5563',
            marginBottom: '24px',
            maxWidth: '500px'
          }}>
            A comprehensive HR management solution designed to simplify your daily operations and boost productivity.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Get Started
            </button>
            <button style={{
              backgroundColor: 'transparent',
              color: '#2563eb',
              padding: '10px 24px',
              borderRadius: '50px',
              border: '1px solid #2563eb',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Learn More
            </button>
          </div>
        </div>
        
        <div style={{
          flex: '1 1 400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '300px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '550px',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <img 
              src={HrImg} 
              alt="HR professional working with dashboard"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Features Section - Added before footer */}
      <div style={{
        padding: '60px 5%',
        backgroundColor: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Features That Drive Results
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Our HR management system offers everything you need to streamline your operations
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            <FeatureCard 
              icon={<HiUserGroup size={24} color="#2563eb" />}
              title="Employee Management"
              description="Maintain comprehensive employee profiles with all relevant information in one centralized system." 
            />
            <FeatureCard 
              icon={<HiDocumentText size={24} color="#2563eb" />}
              title="Document Handling"
              description="Easily manage contracts, agreements, certificates and other important HR documents." 
            />
            <FeatureCard 
              icon={<HiChartBar size={24} color="#2563eb" />}
              title="Performance Tracking"
              description="Set goals, track progress, and measure performance with customizable KPI dashboards." 
            />
            <FeatureCard 
              icon={<HiClock size={24} color="#2563eb" />}
              title="Time Management"
              description="Streamline leave requests, track attendance, and manage work schedules efficiently." 
            />
          </div>
        </div>
      </div>
      
      {/* Footer with full width dark background */}
      <footer style={{
        backgroundColor: '#1a2234',
        color: 'white',
        padding: '40px 0 20px 0',
        width: '100%',
        margin: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 5%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '30px'
          }}>
            <div style={{ 
              maxWidth: '250px',
              flex: '1 1 250px',
              minWidth: '200px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', fontWeight: 'bold' }}>DataMgtApp</h3>
              <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
                Simplify your HR processes with our comprehensive dashboard solution.
              </p>
            </div>
            
            <div style={{ 
              flex: '0 1 150px', 
              minWidth: '120px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Features</a>
               
              </div>
            </div>
            
            <div style={{ 
              flex: '0 1 150px', 
              minWidth: '120px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>About Us</a>
                <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Contact</a>
              </div>
            </div>
            
            <div style={{ 
              flex: '0 1 150px', 
              minWidth: '120px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Help Center</a>
                <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Documentation</a>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #334155',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#94a3b8',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              &copy; {new Date().getFullYear()} DataMgtApp HR. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;