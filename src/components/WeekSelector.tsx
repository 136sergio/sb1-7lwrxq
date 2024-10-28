import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ selectedDate, onChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    // Ajustar al lunes de la semana
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return {
      start,
      end
    };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const { start, end } = getWeekDates(selectedDate);

  const handleDateClick = (date: Date) => {
    onChange(date);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(parseInt(e.target.value));
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const days = [];
    
    // Ajustar para que la semana empiece en lunes (1-7 en lugar de 0-6)
    const startDay = (firstDay.getDay() || 7) - 1;

    // Añadir celdas vacías para los días antes del primer día del mes
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    // Añadir los días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const { start: weekStart } = getWeekDates(date);
      const isInSelectedWeek = weekStart.toDateString() === getWeekDates(selectedDate).start.toDateString();

      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(date)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
            ${isSelected ? 'bg-green-500 text-white' : ''}
            ${isInSelectedWeek ? 'bg-green-100' : ''}
            ${isToday && !isSelected ? 'ring-2 ring-green-500' : ''}
            hover:bg-green-100`}
          type="button"
        >
          {i}
        </button>
      );
    }

    return days;
  };

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <CalendarIcon className="h-4 w-4 mr-2" />
        <span>{`${formatDate(start)} - ${formatDate(end)}`}</span>
      </button>

      {showCalendar && (
        <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg p-4 border border-gray-200 min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long' })}
              </span>
              <select
                value={currentYear}
                onChange={handleYearChange}
                className="text-sm border-gray-300 rounded-md focus:border-green-500 focus:ring-green-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {generateCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekSelector;