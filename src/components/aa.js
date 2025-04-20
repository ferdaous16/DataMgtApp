import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { updateLeaveBalance } from '../services/leaveService';

const LeaveApprovalList = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles!employee_id(first_name, last_name),
        leave_types(name)
      `)
      .eq('status', 'pending');

    if (error) console.error(error);
    else setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (requestId, approved) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: user.id
        })
        .eq('id', requestId);

      if (error) throw error;

      if (approved) {
        await updateLeaveBalance(requestId);
      }

      await fetchRequests(); // refresh list
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  return (
    <div>
      {requests.map(request => (
        <div key={request.id} className="border p-4 mb-4 rounded-lg bg-white shadow">
          <h3 className="font-semibold">{request.profiles.first_name}'s Request</h3>
          <p>{request.leave_types.name}: {request.start_date} - {request.end_date}</p>
          <div className="mt-2 space-x-2">
            <button 
              onClick={() => handleDecision(request.id, true)} 
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Approve
            </button>
            <button 
              onClick={() => handleDecision(request.id, false)} 
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveApprovalList;
