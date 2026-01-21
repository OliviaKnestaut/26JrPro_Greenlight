import React from 'react';
import { Badge, Card, Tag, Typography } from 'antd';
const { Title, Paragraph } = Typography;

import {
    CalendarOutlined,
    ClockCircleOutlined,
    PushpinOutlined,
    MoreOutlined,
} from '@ant-design/icons';

import styles from './index.module.css';
import { formatTime } from '~/lib/formatters';

export type CardEventProps = React.ComponentProps<typeof Card> & {
    date?: string;
    location?: string;
    description?: string;
    submissionDate?: string;
    startTime?: string;
    status?: string;
};

const CardEvent: React.FC<CardEventProps> = ({ children, title, date, startTime, location, description, submissionDate, status, ...rest }) => {
    if (status === "in-review") {
        return(
        <Card
        bodyStyle={{ padding: 16 }}
        className={styles.reviewCard}
        {...rest}>
            <div className='flex flex-col gap-1'>
                <Paragraph className={styles.submitted}>
                    SUBMITTED ON: {submissionDate}
                </Paragraph>
                <Title level={4} ellipsis={{ rows: 2 }}className={styles.title}>{title} </Title>
                <Paragraph ellipsis={{ rows: 2 }}>
                    {description}
                </Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
        )
    } else if (status === "draft") {
        return (
        <Card
        bodyStyle={{ padding: 16 }}
        className={styles.draftCard}
        {...rest}>
            <div className='flex flex-col gap-1'>
                <div className="flex justify-between items-center">
                        <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title} </Title>
                        <MoreOutlined style={{ fontSize: "24px" }}/>
                    </div>
                <Paragraph ellipsis={{ rows: 2 }}>
                    {description}
                </Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
        )
    }
}

export default CardEvent;
