import React from 'react';
import { createClient } from "@supabase/supabase-js";
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const supabase = createClient("https://ixhizoykoergbodzqsqq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aGl6b3lrb2VyZ2JvZHpxc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNTQ1MTAsImV4cCI6MjA1ODczMDUxMH0.k-7GR7xhJdgmlfhcXVk7GYMPMwr-9iLiXOoRcFakwLA");

const registerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required')
});

const Register = () => {
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    const { email, password } = values;
  
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      setStatus({ error: error.message });
    } else {
      setStatus({ success: 'Registration successful! Please check your email.' });
    }
  
    setSubmitting(false);
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
        minHeight: '600px',
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
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>DataMgtApp</h1>
          <p style={{ fontSize: '1.1rem', opacity: '0.9', marginBottom: '25px' }}>
            Join the most comprehensive HR management solution
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
            Learn More
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
          <h2 style={{ marginBottom: '10px', fontSize: '1.75rem' }}>Create Account</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>Join our platform today</p>

          <Formik
            initialValues={{ 
              firstName: '', 
              lastName: '', 
              email: '', 
              password: '', 
              confirmPassword: ''
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <Field
                      name="firstName"
                      type="text"
                      placeholder="First Name"
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
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
                    <ErrorMessage name="firstName" component="div" style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px', marginLeft: '5px' }} />
                  </div>
                  <div>
                    <Field
                      name="lastName"
                      type="text"
                      placeholder="Last Name"
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
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
                    <ErrorMessage name="lastName" component="div" style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px', marginLeft: '5px' }} />
                  </div>
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

                <div style={{ marginBottom: '25px' }}>
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
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
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
                  <ErrorMessage name="confirmPassword" component="div" style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px', marginLeft: '5px' }} />
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
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </button>
              </Form>
            )}
          </Formik>

          <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
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
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;