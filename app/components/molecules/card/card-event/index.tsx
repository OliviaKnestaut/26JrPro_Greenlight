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
    isPast?: boolean;
    eventImg?: string;
};

const CardEvent: React.FC<CardEventProps> = ({ children, title, date, startTime, location, description, submissionDate, status, isPast, eventImg, ...rest }) => {
    // detect visual-card via `className` prop
    const classNameProp = (rest as any)?.className ?? '';
    const isVisual = classNameProp.split(/\s+/).includes('visual-card');
    const incomingStyle = (rest as any)?.style ?? {};
    const base = (import.meta as any).env?.BASE_URL ?? '/';
    const imagePath = eventImg ? `${base}uploads/event_img/${eventImg}`.replace(/\\/g, '/') : undefined;

    // default/full variants

    const inReviewCard = (
        <Card {...rest}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px solid var(--accent-gray-light-2)', background: 'var(--background-2)' }}>
            <div className='flex flex-col gap-1'>
                <Paragraph className={styles.submitted}>SUBMITTED ON: {submissionDate}</Paragraph>
                <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    {date ? <Tag className="eventDetailTag" style={{ background: isPast ? '#FFF1F0' : 'var(--background)' }} icon={<CalendarOutlined />}>{date}</Tag> : null}
                    {startTime ? <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag> : null}
                    {location ? <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag> : null}
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const draftCard = (
        <Card {...rest}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px dashed var(--accent-gray-light-2)' }}>
            <div className='flex flex-col gap-1'>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }} />
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    {date ? <Tag className="eventDetailTag" style={{ background: isPast ? '#FFF1F0' : 'var(--background)' }} icon={<CalendarOutlined />}>{date}</Tag> : null}
                    {startTime ? <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag> : null}
                    {location ? <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag> : null}
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const approvedCardVisual = (
        <Card {...rest}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px solid var(--accent-gray-light-2)', background: 'var(--background-2)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="approvedTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>approved</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }} />
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    {date ? <Tag className="eventDetailTag" style={{ background: isPast ? '#FFF1F0' : 'var(--background)' }} icon={<CalendarOutlined />}>{date}</Tag> : null}
                    {startTime ? <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag> : null}
                    {location ? <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag> : null}
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const reviewCardVisual = (
        <Card {...rest}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px solid var(--accent-gray-light-2)', background: 'var(--background-2)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="inReviewTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>in-review</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }} />
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    {date ? <Tag className="eventDetailTag" style={{ background: isPast ? '#FFF1F0' : 'var(--background)' }} icon={<CalendarOutlined />}>{date}</Tag> : null}
                    {startTime ? <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag> : null}
                    {location ? <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag> : null}
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const draftCardVisual = (
        <Card {...rest}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px dashed var(--accent-gray-light-2)', background: 'var(--background-2)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="inDraftTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>in-draft</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }} />
                </div>
                <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    {date ? <Tag className="eventDetailTag" style={{ background: isPast ? '#FFF1F0' : 'var(--background)' }} icon={<CalendarOutlined />}>{date}</Tag> : null}
                    {startTime ? <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag> : null}
                    {location ? <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag> : null}
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const cancelledCardVisual = (
        <Card {...rest}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: 'none', background: 'var(--accent-gray-light-2)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', position: 'absolute', top: 0, left: 0 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="cancelledTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>cancelled</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title} style={{ color: 'var(--accent-gray-dark-2)' }}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px", color: 'var(--accent-gray-dark-2)' }} />
                </div>
                <Paragraph ellipsis={{ rows: 2 }} style={{ color: 'var(--accent-gray-dark-2)' }}>{description}</Paragraph>
                <div className='flex flex-wrap'>
                    {date ? <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{date}</Tag> : null}
                    {startTime ? <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(startTime)}</Tag> : null}
                    {location ? <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{location}</Tag> : null}
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </Card>
    );

    const pastCardVisual = (
        <Card {...rest}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px solid var(--accent-gray-light-2)', background: 'var(--accent-gray-light)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <img
                        alt="basic"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="pastTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>past event</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    <MoreOutlined style={{ fontSize: "24px" }} />
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

    if (isVisual) {
        if (status === "in-review") return reviewCardVisual;
        if (status === "draft") return draftCardVisual;
        if (status === "approved") return approvedCardVisual;
        if (status === "cancelled") return cancelledCardVisual;
        if (status === "past") return pastCardVisual;
    }
    if (status === "in-review") return inReviewCard;
    if (status === "draft") return draftCard;
}

export default CardEvent;
