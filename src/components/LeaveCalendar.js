import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const LeaveCalendar = ({ userId }) => {

  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchLeaves = async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('start_date, end_date, status')
        .eq('employee_id', userId); 
      if (error) {
        console.error("Error fetching leave requests:", error);
        return;
      }

      setEvents(data?.map(leave => ({
        title: leave.status,
        start: new Date(leave.start_date),
        end: new Date(leave.end_date),
        allDay: true,
        status: leave.status
      })) || []);
    };
    fetchLeaves();
  }, [userId]);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      defaultView="month"
      views={['month', 'week', 'day', 'agenda']}
      style={{ height: 500 }}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.status === 'approved' ? '#90EE90' : '#FFB6C1'
        }
      })}
    />

  );
};

export default LeaveCalendar;
