import React, { useState } from 'react';
import { Button, Card, Dropdown, Input, Modal, Space, Tag, Typography, Image, Skeleton } from 'antd';
import { useNavigate } from 'react-router';
const { Title, Paragraph } = Typography;

import {
    CalendarOutlined,
    ClockCircleOutlined,
    EditOutlined,
    PushpinOutlined,
    MoreOutlined,
} from '@ant-design/icons';

import styles from './index.module.css';
import OptimizedImage from '../../../atoms/OptimizedImage';
import { formatTime } from '~/lib/formatters';
import DiscardModal from '~/components/molecules/event-flow/discard-modal';

export type CardEventProps = React.ComponentProps<typeof Card> & {
    date?: string;
    location?: string;
    description?: string;
    submissionDate?: string;
    startTime?: string;
    status?: string;
    isPast?: boolean;
    eventImg?: string;
    loading?: boolean;
    skeletonImage?: boolean;
    skeletonVariant?: 'compact' | 'visual';
    disableHover?: boolean;
    onRename?: (nextName: string) => void;
    onDiscard?: () => void;
    eventId?: string;
};

const CardEvent: React.FC<CardEventProps> = ({ children, title, date, startTime, location, description, submissionDate, status, isPast, eventImg, loading, skeletonImage, skeletonVariant, disableHover, onRename, onDiscard, eventId, ...rest }) => {
    const navigate = useNavigate();
    // detect visual-card via `className` prop
    const classNameProp = (rest as any)?.className ?? '';
    const isVisual = classNameProp.split(/\s+/).includes('visual-card');
    const incomingStyle = (rest as any)?.style ?? {};
    const base = (import.meta as any).env?.BASE_URL ?? '/';
    const imagePath = eventImg ? `${base}uploads/event_img/${eventImg}`.replace(/\\/g, '/') : undefined;
    //const combinedClassName = [styles.card, (rest as any)?.className].filter(Boolean).join(' ');

    const [renameOpen, setRenameOpen] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [discardOpen, setDiscardOpen] = useState(false);

    const handleCardClick = () => {
        if (status === 'draft' && eventId) {
            navigate(`/event-form/${eventId}`);
        }
    };


    // Compute whether the event is in the past. Prefer the explicit `isPast`
    // prop if provided; otherwise derive from the `date` string.
    const computeIsPastEvent = (explicit?: boolean | undefined, dateStr?: string | undefined) => {
        if (typeof explicit === 'boolean') return explicit;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        const now = new Date();
        return d < now;
    };

    const isPastEvent = computeIsPastEvent(isPast, date);
    const combinedClassName = [
    styles.card,
    status === 'draft' && styles.draftCard,
    status === 'in-review' && styles.reviewCard,
    status === 'approved' && !isPastEvent && styles.approvedCard,
    status === 'cancelled' && styles.cancelledCard,
    status === 'approved' && isPastEvent && styles.pastCard,
    disableHover && styles.noHover, 
    (rest as any)?.className,
].filter(Boolean).join(' ');
const cardProps = { ...(rest as any), className: combinedClassName };

    const menuItems = [
        ...(onRename ? [{ key: 'rename', label: 'Rename' }] : []),
        ...(onDiscard ? [{ key: 'discard', label: 'Discard', danger: true }] : []),
    ];

    const openRename = () => {
        setRenameValue(typeof title === 'string' ? title : '');
        setRenameOpen(true);
    };

    const openDiscardConfirm = () => {
        setDiscardOpen(true);
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'rename') openRename();
        if (key === 'discard') openDiscardConfirm();
    };

    const renderMoreMenu = (iconColor?: string) => {
        if (menuItems.length === 0) return null;
        return (
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']} placement="bottomRight">
            <button
                type="button"
                className={styles.moreButton}
                aria-label="More actions"
                style={iconColor ? { color: iconColor } : undefined}
                onClick={(e) => e.stopPropagation()}
            >
                <MoreOutlined style={{ fontSize: '24px' }} />
            </button>
        </Dropdown>
        );
    };

    const renameModal = (
        <Modal
            open={renameOpen}
            footer={null}
            centered
            closable={false}
            maskClosable={false}
            classNames={{ content: styles.modalContent }}
        >
            <div className={styles.modalContainer}>
                <EditOutlined style={{ color: 'var(--sea-green-6)', fontSize: '1.375rem' }} className={styles.modalIcon} />
                <div className={styles.modalBody}>
                    <div className={styles.modalHeader}>
                        <h5>Rename Event</h5>
                        <p className={styles.modalMessage}>Update the event name shown on this card.</p>
                    </div>
                    <Input
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        placeholder="Event name"
                    />
                    <Space className={styles.modalButtonGroup} size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button type="default" size="large" onClick={() => setRenameOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            disabled={!renameValue.trim()}
                            onClick={() => {
                                const nextName = renameValue.trim();
                                if (!nextName) return;
                                onRename?.(nextName);
                                setRenameOpen(false);
                            }}
                        >
                            Rename
                        </Button>
                    </Space>
                </div>
            </div>
        </Modal>
    );

    const discardModal = (
        <DiscardModal
            open={discardOpen}
            title="Discard event?"
            message="Are you sure you want to discard this event? This action cannot be undone."
            onDiscardClick={() => {
                onDiscard?.();
                setDiscardOpen(false);
            }}
            onCancelClick={() => setDiscardOpen(false)}
        />
    );
    if (loading) {
        const variant = skeletonVariant || (isVisual ? 'visual' : 'compact');
        if (variant === 'visual') {
            return (
                <Card {...cardProps} styles={{ body: { padding: 16 } }} style={{ ...incomingStyle }}>
                    <div className='flex flex-col gap-1'>
                        <div style={{ width: '100%', height: 160, background: '#f2f2f2' }} />
                        <div style={{ paddingTop: 12 }}>
                            <Skeleton active title={{ width: '60%' } as any} paragraph={{ rows: 2 }} />
                        </div>
                    </div>
                </Card>
            );
        }
        // compact
        return (
            <Card {...rest} styles={{ body: { padding: 16 } }} style={{ ...incomingStyle }}>
                <div className='flex flex-col gap-1'>
                    <div style={{ paddingTop: 4 }}>
                        <Skeleton active title={{ width: '40%' } as any} paragraph={{ rows: 3 }} />
                    </div>
                </div>
            </Card>
        );
    }

    const inReviewCard = (
        <Card {...cardProps}
            hoverable={!disableHover}
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
        <Card {...cardProps}
            onClick={handleCardClick}
            hoverable={!disableHover}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px dashed var(--accent-gray-light-2)', cursor: status === 'draft' ? 'pointer' : undefined }}>
            <div className='flex flex-col gap-1'>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    {renderMoreMenu()}
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
        <Card {...cardProps}
            hoverable={!disableHover}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px solid var(--accent-gray-light-2)', background: 'var(--background-2)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <OptimizedImage
                        alt="event"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="approvedTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>approved</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    {renderMoreMenu()}
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
        <Card {...cardProps}
            styles={{ body: { padding: 16 } }}
            hoverable={!disableHover}
            style={{ ...incomingStyle, border: '1px solid var(--accent-gray-light-2)', background: 'var(--background-2)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <OptimizedImage
                        alt="event"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="inReviewTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>in-review</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    {renderMoreMenu()}
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
        <Card {...cardProps}
            onClick={handleCardClick}
            hoverable={!disableHover}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px dashed var(--accent-gray-light-2)', background: 'var(--background-2)', cursor: status === 'draft' ? 'pointer' : undefined }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <OptimizedImage
                        alt="event"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="inDraftTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>in-draft</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    {renderMoreMenu()}
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
        <Card {...cardProps}
            hoverable={!disableHover}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px solid var(--accent-gray-light-2)', background: 'var(--accent-gray-light-2)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <OptimizedImage
                        alt="event"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', position: 'absolute', top: 0, left: 0 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="cancelledTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>cancelled</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title} style={{ color: 'var(--accent-gray-dark-2)' }}>{title}</Title>
                    {renderMoreMenu('var(--accent-gray-dark-2)')}
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
        <Card {...cardProps}
            hoverable={!disableHover}
            styles={{ body: { padding: 16 } }}
            style={{ ...incomingStyle, border: '1px solid var(--accent-gray-light-2)', background: 'var(--accent-gray-light)' }}>
            <div className='flex flex-col gap-1'>
                <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', display: 'block' }}>
                    <OptimizedImage
                        alt="event"
                        src={imagePath ?? eventImg ?? "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217, 217, 217, 0.10)', boxShadow: '0 36px 36px 0 rgba(0, 0, 0, 0.36) inset', pointerEvents: 'none', zIndex: 2 }} />
                    <Tag className="pastTag statusTag" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>past event</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Title level={4} ellipsis={{ rows: 2 }} className={styles.title}>{title}</Title>
                    {(onRename || onDiscard) && renderMoreMenu()}
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
        if (status === "approved" && isPastEvent) return <>{pastCardVisual}{renameModal}{discardModal}</>;
        if (status === "in-review") return <>{reviewCardVisual}{renameModal}{discardModal}</>;
        if (status === "draft") return <>{draftCardVisual}{renameModal}{discardModal}</>;
        if (status === "approved") return <>{approvedCardVisual}{renameModal}{discardModal}</>;
        if (status === "cancelled") return <>{cancelledCardVisual}{renameModal}{discardModal}</>;
    }
    if (status === "in-review") return <>{inReviewCard}{renameModal}{discardModal}</>;
    if (status === "draft") return <>{draftCard}{renameModal}{discardModal}</>;
}

export default CardEvent;
