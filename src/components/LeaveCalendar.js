import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, dateFnsLocalizer} from 'react-big-calendar';
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
  const [date, setDate] = useState(new Date());

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

  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = new Date(toolbar.date);
      return <span>{format(date, 'MMMM yyyy')}</span>;
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={goToCurrent}>Today</button>
          <button type="button" onClick={goToBack}>Back</button>
          <button type="button" onClick={goToNext}>Next</button>
        </span>
        <span className="rbc-toolbar-label">{label()}</span>
      </div>
    );
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      defaultView="month"
      views={['month']}
      style={{ height: 500 }}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.status === 'approved' ? '#90EE90' : 
                          event.status === 'rejected' ? '#FFB6C1' : 
                          '#FFFF99'
        }
      })}
      date={date}
      onNavigate={date => setDate(date)}
      components={{
        toolbar: CustomToolbar
      }}
    />
  );
};

export default LeaveCalendar;