import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Login values:', values);
    setTimeout(() => {
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'Arial, sans-serif',
      margin: 0
    }}>
      <div style={{ 
        display: 'flex', 
        width: '900px', 
        minHeight: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Left side - Colored section */}
        <div style={{ 
          flex: '1',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
          color: 'white',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="white">
              <path d="M13 3H11V11H3V13H11V21H13V13H21V11H13V3Z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>DataMgtApp</h1>
          <p style={{ fontSize: '1.1rem', opacity: '0.9', marginBottom: '25px' }}>
            The most comprehensive HR management solution
          </p>
          <Link to="/" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            padding: '8px 20px',
            display: 'inline-block',
            width: 'fit-content',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}>
            Read More
          </Link>
        </div>

        {/* Right side - Form section */}
        <div style={{ 
          flex: '1', 
          backgroundColor: 'white',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h2 style={{ marginBottom: '10px', fontSize: '1.75rem' }}>Hello Again!</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>Welcome Back</p>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    position: 'relative', 
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      color: '#9ca3af',
                      fontSize: '1.1rem'
                    }}>
                      ✉️
                    </span>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      style={{ 
                        width: '100%', 
                        padding: '12px 12px 12px 45px', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px', marginLeft: '5px' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    position: 'relative', 
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      color: '#9ca3af',
                      fontSize: '1.1rem'
                    }}>
                      🔒
                    </span>
                    <Field
                      name="password"
                      type="password"
                      placeholder="Password"
                      style={{ 
                        width: '100%', 
                        padding: '12px 12px 12px 45px', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <ErrorMessage name="password" component="div" style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px', marginLeft: '5px' }} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '25px', 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                >
                  {isSubmitting ? 'Signing in...' : 'Login'}
                </button>
              </Form>
            )}
          </Formik>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link 
              to="#" 
              style={{ 
                color: '#6b7280', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#2563eb', 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;