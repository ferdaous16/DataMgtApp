import { supabase } from '../supabaseClient';

export const calculateWorkingDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) { // Exclude Sundays (0) and Saturdays (6)
            count++;
        }
    }

    return count;
};

export const updateLeaveBalance = async (requestId) => {
  const { data: request, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error) throw error;

  const days = calculateWorkingDays(request.start_date, request.end_date);

  const { error: rpcError } = await supabase.rpc('update_balance', {
    p_employee_id: request.employee_id,
    p_leave_type: request.leave_type,
    p_days: -days
  });

  if (rpcError) throw rpcError;
};
