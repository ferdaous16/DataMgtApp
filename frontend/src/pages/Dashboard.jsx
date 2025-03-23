import React from 'react';
import { HiUsers, HiDocumentText, HiClock, HiClipboardCheck } from 'react-icons/hi';

const StatCard = ({ icon, title, value, change, changeType }) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>{title}</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{value}</h3>
          
          {change && (
            <p style={{ 
              fontSize: '0.875rem', 
              marginTop: '0.5rem', 
              display: 'flex', 
              alignItems: 'center',
              color: changeType === 'positive' ? 'var(--color-success)' : 'var(--color-danger)'
            }}>
              {changeType === 'positive' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div style={{ 
          padding: '0.75rem',
          borderRadius: '9999px', 
          backgroundColor: 'rgba(74, 140, 255, 0.2)'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-gray-800)' }}>Dashboard</h1>
        <p style={{ color: 'var(--color-gray-600)' }}>Welcome to your HR management dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
        <StatCard 
          icon={<HiUsers size={24} color="var(--color-primary)" />}
          title="Total Employees" 
          value="124" 
          change="12% vs last month" 
          changeType="positive" 
        />
        <StatCard 
          icon={<HiDocumentText size={24} color="var(--color-primary)" />}
          title="Pending Documents" 
          value="8" 
          change="3% vs last month" 
          changeType="negative" 
        />
        <StatCard 
          icon={<HiClock size={24} color="var(--color-primary)" />}
          title="Time-off Requests" 
          value="5" 
        />
        <StatCard 
          icon={<HiClipboardCheck size={24} color="var(--color-primary)" />}
          title="Completed Tasks" 
          value="42" 
          change="8% vs last month" 
          changeType="positive" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0.75rem', 
                borderBottom: '1px solid var(--color-gray-100)'
              }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-gray-200)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '0.75rem'
                }}>
                  <span style={{ fontSize: '0.875rem' }}>JP</span>
                </div>
                <div>
                  <p style={{ fontWeight: '500' }}>Document approved</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Upcoming Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((item) => (
              <div key={item} style={{ 
                display: 'flex', 
                padding: '0.75rem', 
                borderBottom: '1px solid var(--color-gray-100)'
              }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  backgroundColor: 'rgba(74, 140, 255, 0.2)', 
                  borderRadius: '0.25rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '0.75rem', 
                  color: 'var(--color-primary)', 
                  fontWeight: '600'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem' }}>MAR</div>
                    <div>{item + 10}</div>
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: '500' }}>Team Meeting</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>10:00 AM - 11:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
