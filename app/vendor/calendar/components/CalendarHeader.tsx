import React from 'react';
import { Button, Row, Col, Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { addWeeks, startOfWeek, endOfWeek, format, setMonth, setYear, getMonth, getYear } from 'date-fns';

import type { CalendarHeaderProps } from './types';

export const CalendarHeader: React.FunctionComponent<CalendarHeaderProps> = ({
  startWeek,
  setStartWeek,
}) => {
  const currentYear  = getYear(startWeek);
  const currentMonth = getMonth(startWeek); // 0-indexed

  const monthOptions = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ].map((label, idx) => ({ label, value: idx }));

  // Show a rolling window: 5 years back, 5 years forward
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
    .map(y => ({ label: String(y), value: y }));

  const handleMonthChange = (month: number) => {
    setStartWeek(startOfWeek(setMonth(startWeek, month)));
  };

  const handleYearChange = (year: number) => {
    setStartWeek(startOfWeek(setYear(startWeek, year)));
  };

  // e.g. "Dec 7-13, 2025" or "Jan 30 – Feb 5, 2025" when spanning months
  const weekEnd = endOfWeek(startWeek);
  const weekLabel = format(startWeek, 'MMM d') === format(weekEnd, 'MMM d')
    ? format(startWeek, 'MMM d, yyyy')
    : format(startWeek, 'MMM') === format(weekEnd, 'MMM')
      ? `${format(startWeek, 'MMM d')}-${format(weekEnd, 'd, yyyy')}`
      : `${format(startWeek, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
  return (
    <>
      <Row justify="space-between" style={{ marginBottom: '20px' }}>
        <Col
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Month selector */}
            <Select
              value={currentMonth}
              options={monthOptions}
              onChange={handleMonthChange}
              style={{ width: 130 }}
              rootClassName="calendar-header-select"
            />
            {/* Year selector */}
            <Select
              value={currentYear}
              options={yearOptions}
              onChange={handleYearChange}
              style={{ width: 90 }}
              rootClassName="calendar-header-select"
            />
            <Button
              style={{ borderColor: 'var(--sea-green-7)', color: 'var(--sea-green-7)' }}
              onClick={() => setStartWeek(startOfWeek(new Date()))}
            >
              Today
            </Button>
            <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--sea-green-9)' }}>
              {weekLabel}
            </span>
          </div>

        </Col>
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button
                style={{ borderColor: 'var(--sea-green-7)', color: 'var(--sea-green-7)' }}
                onClick={() => setStartWeek(addWeeks(startWeek, -1))}
              >
                <LeftOutlined />
              </Button>
              <Button
                style={{ borderColor: 'var(--sea-green-7)', color: 'var(--sea-green-7)' }}
                onClick={() => setStartWeek(addWeeks(startWeek, 1))}
              >
                <RightOutlined />
              </Button>

          </div>
        </Col>
      </Row>
    </>
  );
};
