import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../supabaseClient';

const LeaveRequestForm = ({ onSuccess }) => {
  const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
      startDate: '',
      endDate: '',
      leave_type: '',
      reason: ''
    });
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [balances, setBalances] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
      const fetchUserAndLeaveData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    
        if (!user) return;
    
        try {
          const { data: typesData } = await supabase
            .from('leave_types')
            .select('*');
    
          const { data: balanceData } = await supabase
            .from('leave_balances')
            .select('leave_type, balance')
            .eq('employee_id', user.id)
            .eq('year', new Date().getFullYear());
    
          setLeaveTypes(typesData || []);
    
          const balanceMap = balanceData?.reduce((acc, curr) => ({
            ...acc,
            [curr.leave_type]: curr.balance
          }), {});
          
          setBalances(balanceMap || {});
        } catch (err) {
          console.error('Data fetch error:', err);
        }
      };
    
      fetchUserAndLeaveData();
    }, []);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
    
    if (!user) {
      setError('You must be logged in to submit a request');
      return;
    }
      try {
        setIsSubmitting(true);
        const { data, error } = await supabase
          .from('leave_requests')
          .insert([{
            employee_id: user.id,
            start_date: formData.startDate,
            end_date: formData.endDate,
            leave_type: formData.leave_type,
            reason: formData.reason
          }]);
  
        if (error) throw error;
        if (onSuccess) onSuccess();
        alert('Request submitted successfully!');
        setFormData({
          startDate: null,
          endDate: null,
          leave_type: '',
          reason: ''
        });
      } catch (err) {
        console.error('Submission error:', err);
        alert("Submission failed!");
      } finally {
        setIsSubmitting(false);
      }
    };
    const getBalance = (typeId) => balances[typeId] || 0;
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
            <label className="block">Start Date:</label>
            <DatePicker 
              selected={formData.startDate}
              onChange={date => setFormData({...formData, startDate: date})}
              placeholderText="Start Date"
              required
            />
        </div>
        <div>
            <label className="block">End Date</label>
            <DatePicker
              selected={formData.endDate}
              onChange={date => setFormData({...formData, endDate: date})}
              placeholderText="End Date"
              required
            />
        </div>
        <div>
            <label className="block">Leave Type</label>
            <select
              value={formData.leave_type}
              onChange={e => setFormData({...formData, leave_type: e.target.value})}
              className="border p-2"
            >
          <option value="">Select Leave Type</option>
          {leaveTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} (Balance: {getBalance(type.id)})
            </option>
          ))}
        </select>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              placeholder="Reason"
              required
              className="w-full p-2 border rounded"
              rows="4"
            />
        </div>
        <button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    );
  };
  export default LeaveRequestForm;