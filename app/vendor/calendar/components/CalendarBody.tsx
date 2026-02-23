import React, { useEffect, useRef } from 'react';
import { Table, Grid } from 'antd';

import type { GenericEvent, CalendarBodyProps } from './types';
import { getDayHoursEvents, calculateScrollOffset } from './utils';
import { createDayColumns, SCROLL_TO_ROW } from './columns';


const { useBreakpoint } = Grid;

function Calendar<T extends GenericEvent>({
  weekDatesRange,
  getDayEvents,
  onEventClick,
  weekends,
}: CalendarBodyProps<T>) {
  const rowRef = useRef<null | HTMLDivElement>(null);
  const tableContainerRef = useRef<null | HTMLDivElement>(null);

  const screens = useBreakpoint();

  useEffect(() => {
    if (rowRef.current && tableContainerRef.current && 'scrollTo' in tableContainerRef.current) {
      const scrollOffset = calculateScrollOffset(tableContainerRef.current, rowRef.current);
      tableContainerRef.current.scrollTo({ top: scrollOffset, behavior: 'smooth' });
    }
  }, [SCROLL_TO_ROW]);

  const hourColumn = {

    onHeaderCell: () => ({
      style: {
        backgroundColor: 'var(--sea-green-1)',
        color: 'var(--gray-12)',
        fontWeight: 600,
        borderRadius: 0,
        border: 0,
      },
    }),

    onCell: () => ({
      style: {
        backgroundColor: 'var(--sea-green-1)', // match the header
        
      },
    }),

    dataIndex: 'hour',
    key: 'hour',
    width: screens.xs ? 50 : 1,
    render: (hour: string, { }, id: number) => {
      return {
        props: {
          style: {
            width: screens.xs ? '30%' : '10%',
          },
        },
        children: SCROLL_TO_ROW === id ? (
          <div ref={rowRef}>{hour}</div>
        ) : (
          <div>{hour}</div>
        ),
      };
    },
  };

  const dayColumns = createDayColumns(weekDatesRange, weekends, onEventClick).map((col) => ({
    ...col,

    title: (
      <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
        {typeof col.title === 'function' ? col.title({}) : col.title}
      </div>
    ),

    // Merge existing onHeaderCell safely
    onHeaderCell: (origin: any) => {
      const prevStyles = col.onHeaderCell ? col.onHeaderCell(origin).style : {};
      return {
        style: {
          ...prevStyles,
          borderBottom: '1px solid var(--accent-gray-light)',
          fontWeight: 600,
          borderRadius: 0,
          color: prevStyles?.color || 'var(--gray-12)',
          backgroundColor: prevStyles?.backgroundColor || 'var(--sea-green-1)',

        },
      };
    },
  }));



  const tableColumns = [hourColumn, ...dayColumns];

  return (
    <div
      ref={tableContainerRef}

      style={{
        height: '70vh',
        width: 'calc(100% - 0.5rem)',
         // Set a fixed height for the container
        overflow: 'auto', // Allow both vertical and horizontal scrolling within the container only
        backgroundColor: 'var(--background-2)',
        borderRadius: 0,
      }}
    >
      <Table
        rowKey={(record) => record.id}
        dataSource={getDayHoursEvents(weekDatesRange, getDayEvents)}
        columns={tableColumns}
        pagination={false}
        bordered={true}
        showHeader={true}
        onRow={(_, rowIndex) => {
          return {
            style: {
              padding: '8px 0',
            },
          };
        }}

      />
    </div>
  );
}

export default Calendar;