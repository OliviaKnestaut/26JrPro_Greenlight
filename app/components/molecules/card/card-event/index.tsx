import React from 'react';
import { Card, Tag, Typography, Image } from 'antd';
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
    // detect visual-card via `className` prop
    const classNameProp = (rest as any)?.className ?? '';
    const isVisual = classNameProp.split(/\s+/).includes('visual-card');

    // default/full variants
        const babyCard = (
            <Card {...rest} className={`draftCard ${styles.draftCard} ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 12 }} style={{ border: '1.5px dashed var(--accent-gray-light)', ...(rest as any)?.style }}>
                <div className='flex flex-col gap-1'>
                    <Title level={5} ellipsis={{ rows: 1 }} className={styles.title}>{title}</Title>
                    <div className='flex items-center gap-2'>
                        <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                        <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    </div>
                </div>
            </Card>
        );

    const inReviewCard = (
        <Card {...rest} className={`reviewCard ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 16 }}>
            <div className='flex flex-col gap-1'>
                <Paragraph className={styles.submitted}>SUBMITTED ON: {submissionDate}</Paragraph>
                <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const draftCard = (
        <Card {...rest} className={`draftCard ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 16 }}>
            <div className='flex flex-col gap-1'>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }}/>
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const approvedCardVisual = (
        <Card {...rest} className={`${styles.approvedCard} ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 16 }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <Tag className="approvedTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>approved</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }}/>
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const reviewCardVisual = (
        <Card {...rest} className={`${styles.reviewCard} ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 16 }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <Tag className="inReviewTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>in-review</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }}/>
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const draftCardVisual = (
        <Card {...rest} className={`draftCard ${styles.draftCard} ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 16 }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <Tag className="inDraftTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>in-draft</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }}/>
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const cancelledCardVisual = (
        <Card {...rest} className={`${styles.cancelledCard} ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 16 }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <Tag className="cancelledTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>cancelled</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }}/>
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const pastCardVisual = (
        <Card {...rest} className={`${styles.pastCard} ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 16 }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <Tag className="pastTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>past event</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }}/>
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const fallbackCard = (
        <Card {...rest} className={`draftCard ${styles.draftCard} ${(rest as any)?.className ?? ''}`} bodyStyle={{ padding: 16 }}>
            <div className='flex flex-col gap-1'>
                <Image
                    width={200}
                    alt="basic"
                    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                />
                <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag>
                    <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag>
                    <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );
    if (isVisual) {
        if (status === "in-review") return reviewCardVisual;
        if (status === "draft") return draftCardVisual;
        if (status === "approved") return approvedCardVisual;
        if (status === "cancelled") return cancelledCardVisual;
        if (status === "past") return pastCardVisual;
        else return babyCard;
    };
    if (status === "in-review") return inReviewCard;
    if (status === "draft") return draftCard;
    return fallbackCard;
}

export default CardEvent;
