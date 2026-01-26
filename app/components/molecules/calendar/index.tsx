import React from 'react';
import dayjs from 'dayjs';

import 'dayjs/locale/en';

import { Calendar, Flex, Radio, Select, theme, Typography } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayLocaleData from 'dayjs/plugin/localeData';

dayjs.extend(dayLocaleData);

const StyledCalendar: React.FC = () => {
    const { token } = theme.useToken();
    const currentMonth = dayjs();

    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    return (
        <div >
            <Calendar
                fullscreen={false}
                value={currentMonth}
                headerRender={() => (
                    <div style={{ padding: 8, justifyContent: 'center', display: 'flex' }}>
                        <Link to="/calendar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Typography.Title level={4}>
                                {currentMonth.format('MMMM YYYY')}
                            </Typography.Title>
                            <RightOutlined/>
                        </Link>
                    </div>
                )}
                onPanelChange={onPanelChange}
            />
        </div>
    );
};

export default StyledCalendar;