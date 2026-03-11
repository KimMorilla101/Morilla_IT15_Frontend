import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { schoolDaysData } from '../data/mockData';
import '../styles/Pages.css';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'class_day', label: 'Class Days' },
  { value: 'event', label: 'Events' },
  { value: 'holiday', label: 'Holidays' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getTypeLabel = (value) => {
  if (value === 'holiday') return 'Holiday';
  if (value === 'event') return 'Event';
  return 'Class';
};

const AcademicCalendar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const monthKeys = useMemo(() => {
    const keys = Array.from(new Set(schoolDaysData.map((item) => item.date.slice(0, 7)))).sort();
    return keys;
  }, []);

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const defaultMonthIndex = monthKeys.includes(currentMonthKey)
    ? monthKeys.indexOf(currentMonthKey)
    : 0;
  const [activeMonthIndex, setActiveMonthIndex] = useState(defaultMonthIndex);

  const activeMonthKey = monthKeys[activeMonthIndex] || monthKeys[0];
  const activeMonthDate = new Date(`${activeMonthKey}-01T00:00:00`);

  const entriesForMonth = useMemo(
    () => schoolDaysData.filter((item) => item.date.startsWith(activeMonthKey)),
    [activeMonthKey],
  );

  const filteredEntriesForMonth = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return entriesForMonth.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesSearch =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.notes.toLowerCase().includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [entriesForMonth, searchTerm, typeFilter]);

  const filteredEntriesByDate = useMemo(
    () => new Map(filteredEntriesForMonth.map((item) => [item.date, item])),
    [filteredEntriesForMonth],
  );

  const calendarCells = useMemo(() => {
    const month = activeMonthDate.getMonth();
    const year = activeMonthDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const cells = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const isoDate = `${activeMonthKey}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        isoDate,
        entry: filteredEntriesByDate.get(isoDate) || null,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [activeMonthDate, activeMonthKey, filteredEntriesByDate]);

  const monthSummary = useMemo(() => {
    const schoolDays = entriesForMonth.filter((item) => item.type !== 'holiday').length;
    const holidays = entriesForMonth.filter((item) => item.type === 'holiday').length;
    const events = entriesForMonth.filter((item) => item.type === 'event').length;

    const attendanceSamples = entriesForMonth
      .map((item) => item.attendance_rate)
      .filter((value) => Number.isFinite(value));

    const averageAttendance = attendanceSamples.length
      ? (
          attendanceSamples.reduce((total, value) => total + value, 0) / attendanceSamples.length
        ).toFixed(1)
      : '0.0';

    return {
      schoolDays,
      holidays,
      events,
      averageAttendance,
    };
  }, [entriesForMonth]);

  const monthNumber = String(activeMonthDate.getMonth() + 1).padStart(2, '0');
  const monthName = activeMonthDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const monthYear = activeMonthDate.getFullYear();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Academic Calendar</h1>
          <p>Calendar view of school days, attendance, holidays, and events.</p>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>School Days</h3>
          <p className="summary-value">{monthSummary.schoolDays}</p>
          <span className="summary-label">Instructional and event days</span>
        </div>
        <div className="summary-card">
          <h3>Holidays</h3>
          <p className="summary-value">{monthSummary.holidays}</p>
          <span className="summary-label">No class schedules</span>
        </div>
        <div className="summary-card">
          <h3>Academic Events</h3>
          <p className="summary-value">{monthSummary.events}</p>
          <span className="summary-label">Calendar-tagged events</span>
        </div>
        <div className="summary-card">
          <h3>Avg Attendance</h3>
          <p className="summary-value">{monthSummary.averageAttendance}%</p>
          <span className="summary-label">Across school-day records</span>
        </div>
      </div>

      <div className="page-controls" style={{ marginTop: '24px' }}>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by activity or notes..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calendar-board">
        <div className="calendar-nav-row">
          <button
            className="btn-sm btn-view"
            onClick={() => setActiveMonthIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeMonthIndex === 0}
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <button
            className="btn-sm btn-view"
            onClick={() => setActiveMonthIndex((prev) => Math.min(monthKeys.length - 1, prev + 1))}
            disabled={activeMonthIndex >= monthKeys.length - 1}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="calendar-hero-header">
          <span className="calendar-hero-index">{monthNumber}</span>
          <h2 className="calendar-hero-month">{monthName}</h2>
          <span className="calendar-hero-year">{monthYear}</span>
        </div>

        <div className="calendar-grid-shell">
          {WEEKDAYS.map((day) => (
            <div key={day} className="calendar-weekday-cell">
              {day}
            </div>
          ))}

          {calendarCells.map((cell, index) => (
            <div key={cell ? cell.isoDate : `empty-${index}`} className={`calendar-day-cell ${!cell ? 'empty' : ''}`}>
              {cell ? (
                <>
                  <span className="calendar-day-number">{cell.day}</span>
                  {cell.entry ? (
                    <>
                      <span className={`calendar-entry-chip ${cell.entry.type}`}>
                        {getTypeLabel(cell.entry.type)}
                      </span>

                      {cell.entry.type !== 'class_day' ? (
                        <p className="calendar-entry-title">{cell.entry.title}</p>
                      ) : null}

                      {Number.isFinite(cell.entry.attendance_rate) ? (
                        <p className="calendar-entry-attendance">{cell.entry.attendance_rate}% attendance</p>
                      ) : null}
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="pagination">
        <span className="pagination-info">
          Showing {filteredEntriesForMonth.length} filtered entries in {monthName} {monthYear}
        </span>
      </div>
    </div>
  );
};

export default AcademicCalendar;
