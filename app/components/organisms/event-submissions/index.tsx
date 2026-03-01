
import { useAuth } from "~/auth/AuthProvider";
import { apolloClient } from "~/lib/apollo-client";
import { EventsByOrganizationDocument, useDeleteEventMutation, useUpdateEventMutation } from "~/lib/graphql/generated";
import { useEffect, useState } from 'react';
import { serverToUi } from '~/lib/eventStatusMap';
import { formatDateMDY } from '~/lib/formatters';
import { Typography, Badge, Input, Button, Space, Popover, Checkbox, Tag, Collapse, Skeleton, Card, Tabs, message, Pagination } from "antd";
import { useSearchParams, useNavigate } from 'react-router';
const { Title, Paragraph, Link } = Typography;
import { FilterOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import { CardEvent } from '../../../components/molecules/card';


export function EventSubmissionsContent() {
    const { user } = useAuth();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteEvent] = useDeleteEventMutation();
    const [updateEvent] = useUpdateEventMutation();

    useEffect(() => {
        const fetchOrgEvents = async () => {
            setLoading(true);
            try {
                const orgUsername = user?.organization?.username ?? user?.organizationUsername;
                if (!orgUsername) {
                    console.debug('No organization username available on user', user);
                    setLoading(false);
                    return;
                }
                const { data } = await apolloClient.query<any>({
                    query: EventsByOrganizationDocument,
                    variables: { orgUsername },
                    fetchPolicy: 'network-only',
                });
                const fetched = data?.eventsByOrganization ?? [];
                setEvents(fetched);

                const drafts = fetched.filter((e: any) => serverToUi(e.eventStatus) === 'draft');
                const inReview = fetched.filter((e: any) => serverToUi(e.eventStatus) === 'in-review');

            } catch (err) {
                console.error('Failed to fetch events by organization', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgEvents();
    }, [user]);

    const inReview = events.filter((e: any) => serverToUi(e.eventStatus) === 'in-review');
    const [query, setQuery] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [pendingStatuses, setPendingStatuses] = useState<string[]>([]);
    const [mainTab, setMainTab] = useState<'upcoming'|'past'>('upcoming');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const collapseDefaultActive = searchParams.get('open') ? [searchParams.get('open') as string] : [];

    const handleDiscardDraft = async (id: string) => {
        try {
            await deleteEvent({ variables: { id } });
            setEvents((prev) => prev.filter((e: any) => e.id !== id));
            message.success('Draft discarded');
        } catch (err) {
            console.error('Failed to discard draft', err);
            message.error('Failed to discard draft');
        }
    };

    const handleRenameEvent = async (id: string, nextName: string) => {
        try {
            const { data } = await updateEvent({ variables: { id, input: { title: nextName } } });
            if (data?.updateEvent?.id) {
                setEvents((prev) => prev.map((e: any) => (e.id === id ? { ...e, title: nextName } : e)));
                message.success('Event renamed');
            }
        } catch (err) {
            console.error('Failed to rename event', err);
            message.error('Failed to rename event');
        }
    };

    const toggleStatus = (val: string) => {
        setPendingStatuses(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);
    };

    const statusLabel = (s: string) => {
        switch (s) {
            case 'draft': return 'In-Draft';
            case 'in-review': return 'In-Review';
            case 'approved': return 'Approved';
            case 'cancelled': return 'Cancelled';
            case 'past': return 'Past Event';
            case 'rejected': return 'Rejected';
            default: return s;
        }
    };

    useEffect(() => {
        const q = searchParams.get('q') ?? '';
        const statusParam = searchParams.get('status');
        const pastParam = searchParams.get('past');
        setQuery(q);
        // remove 'in-review' from incoming status params because in-review is shown separately
        setSelectedStatuses(statusParam ? statusParam.split(',').filter(Boolean).filter(s => s !== 'in-review') : []);
        const isPast = pastParam === '1' || pastParam === 'true';
        setMainTab(isPast ? 'past' : 'upcoming');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (query && query.trim() !== '') params.set('q', query.trim());
        if (selectedStatuses && selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
        if (mainTab === 'past') params.set('past', '1');
        setSearchParams(params, { replace: true });
    }, [query, selectedStatuses, mainTab, setSearchParams]);

    // reset pagination when filters/query/tab or events change
    useEffect(() => {
        setCurrentPage(1);
    }, [query, selectedStatuses, mainTab, events]);

    const toMinutes = (t?: string) => {
        if (!t) return 0;
        const parts = t.split(':').map(p => parseInt(p, 10));
        if (parts.length === 0 || isNaN(parts[0])) return 0;
        const h = parts[0] || 0;
        const m = parts[1] || 0;
        return h * 60 + m;
    };

    return (
        <div>
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined  /> Back </Link>
                </Title>
            </div>
            <div className="container">
                <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                    <Title level={2} style={{ margin: 0 }}>Event Submissions</Title>
                    <Paragraph>
                        Manage and track the status of all your events, from draft to approval and more.
                    </Paragraph>
                </div>
                <div className="flex gap-2 my-4" style={{ width: '100%' }}>
                    <Space.Compact style={{ flex: 1, height: 40 }}>
                        <Input
                            placeholder="Search for your event..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onPressEnter={e => setQuery((e.target as HTMLInputElement).value)}
                            allowClear
                            onClear={() => setQuery('')}
                            style={{borderRadius: 0}}
                        />
                        <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => setQuery(query)}
                        style={{borderRadius: 0, border: 0, width: '46px', boxShadow: 'none', height: 40}} />
                    </Space.Compact>
                        <Popover
                            placement="bottom"
                            style={{ borderRadius: 0 }}
                            content={
                                <div style={{ padding: 8, width: 120 }} onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <Checkbox checked={pendingStatuses.includes('draft')} onChange={() => toggleStatus('draft')}>In-Draft</Checkbox>
                                        <Checkbox checked={pendingStatuses.includes('approved')} onChange={() => toggleStatus('approved')}>Approved</Checkbox>
                                        <Checkbox checked={pendingStatuses.includes('cancelled')} onChange={() => toggleStatus('cancelled')}>Cancelled</Checkbox>
                                        {/* removed 'Past' from filter options per request */}
                                        <Checkbox checked={pendingStatuses.includes('rejected')} onChange={() => toggleStatus('rejected')}>Rejected</Checkbox>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                            <Button type="link" style={{ padding: 0 }} onClick={() => { setPendingStatuses([]); }}>Reset</Button>
                                            <Button type="primary" onClick={() => { setSelectedStatuses(pendingStatuses); setFiltersOpen(false); }}>OK</Button>
                                        </div>
                                    </div>
                                </div>
                            }
                            overlayStyle={{ borderRadius: 0 }}
                            open={filtersOpen}
                            onOpenChange={(v) => {
                                if (v) setPendingStatuses(selectedStatuses);
                                setFiltersOpen(v);
                            }}
                            trigger={['click']}
                        >
                            <Button
                                type={filtersOpen ? 'primary' : 'default'}
                                icon={<FilterOutlined />}
                                style={{ height: 40 }}
                            >
                                Filter
                            </Button>
                        </Popover>
                    
                </div>
            </div>
            <div>
                {selectedStatuses.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selectedStatuses.map((s) => {
                            const cls = (() => {
                                switch (s) {
                                    case 'draft': return 'inDraftTag statusTag';
                                    case 'in-review': return 'inReviewTag statusTag';
                                    case 'approved': return 'approvedTag statusTag';
                                    case 'cancelled': return 'cancelledTag statusTag';
                                    case 'past': return 'pastTag statusTag';
                                    case 'rejected': return 'deniedTag statusTag';
                                    default: return 'statusTag';
                                }
                            })();
                            return (
                                <Tag key={s} className={cls} closable onClose={() => setSelectedStatuses(prev => prev.filter(x => x !== s))}>
                                    {statusLabel(s).toLowerCase()}
                                </Tag>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="container w-auto flex gap-4">
                {!query.trim() && selectedStatuses.length === 0 ? (
                    <Collapse className="my-4"
                        defaultActiveKey={collapseDefaultActive} expandIconPosition="end" items={[{
                        key: '1',
                        label: (
                            <div className="flex items-center gap-2">
                                <Title level={4} style={{ margin: 0 }}>In-Review</Title>
                                <Badge count={inReview.length} style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }} />
                            </div>
                        ),
                        children: (loading ? (
                            <div className="flex gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="event-card">
                                        <CardEvent loading skeletonVariant="compact" style={{ width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        ) : (() => {
                            const withParsed = inReview.map((e: any) => ({
                                ...e,
                                parsedDate: e.eventDate ? new Date(e.eventDate) : null,
                            }));
                            const upcoming = withParsed.sort((a: any, b: any) => {
                                if (!a.parsedDate && !b.parsedDate) return 0;
                                if (!a.parsedDate) return 1;
                                if (!b.parsedDate) return -1;
                                const diff = (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime();
                                if (diff !== 0) return diff;
                                const aTime = toMinutes(a.startTime);
                                const bTime = toMinutes(b.startTime);
                                if (aTime !== bTime) return aTime - bTime;
                                const aSubmitted = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
                                const bSubmitted = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
                                return aSubmitted - bSubmitted;
                            });
                            return (
                                <div className="flex flex-wrap gap-4">
                                    {upcoming.map((e: any) => {
                                        const isPast = e.parsedDate ? (e.parsedDate as Date).getTime() < (new Date()).setHours(0,0,0,0) : false;
                                        const statusUi = serverToUi(e.eventStatus);
                                        return (
                                        <CardEvent
                                            key={e.id}
                                            isPast={isPast}
                                            eventImg={e.eventImg}
                                            onClick={statusUi !== 'draft' ? () => navigate(`/event-overview?id=${encodeURIComponent(e.id)}`) : undefined}
                                            className="event-card"
                                            style={{ cursor: statusUi !== 'draft' ? 'pointer' : undefined }}
                                            title={e.title}
                                            date={formatDateMDY(e.eventDate)}
                                            location={e.location ?? ''}
                                            startTime={e.startTime ?? ''}
                                            description={e.description ?? ''}
                                            submissionDate={formatDateMDY(e.submittedAt)}
                                            status={serverToUi(e.eventStatus)}
                                        />);
                                    })}
                                </div>
                            );
                        })())
                    }]} />
                ) : null}
            </div>

            <div style={{ marginTop: 16 }}>
                <Tabs
                    activeKey={mainTab}
                    onChange={(k) => setMainTab(k as 'upcoming'|'past')}
                    items={[
                        { key: 'upcoming', label: 'Upcoming' },
                        { key: 'past', label: 'Past' },
                    ]}
                />
            </div>

            <div className="flex gap-4 flex-wrap w-full my-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="event-card">
                            <CardEvent className="visual-card" loading skeletonVariant="visual" style={{ width: '100%' }} />
                        </div>
                    ))
                ) : (() => {
                    // Exclude 'in-review' events from the general listing; they are shown in the dedicated In-Review collapse above
                    const withParsed = events
                        .filter((e: any) => serverToUi(e.eventStatus) !== 'in-review')
                        .map((e: any) => ({
                            ...e,
                            parsedDate: e.eventDate ? new Date(e.eventDate) : null,
                        }));
                    const today = new Date();
                    today.setHours(0,0,0,0);
                        const sorted = withParsed.sort((a: any, b: any) => {
                            if (!a.parsedDate && !b.parsedDate) return 0;
                            if (!a.parsedDate) return 1;
                            if (!b.parsedDate) return -1;
                            const diff = (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime();
                            if (diff !== 0) return diff;
                            // fallback to event start time when dates tie
                            const aTime = toMinutes(a.startTime);
                            const bTime = toMinutes(b.startTime);
                            if (aTime !== bTime) return aTime - bTime;
                            const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return aCreated - bCreated;
                        });
                    // If searching, restrict search base to upcoming events unless showPast is enabled.
                    const upcomingOnly = sorted.filter((ev: any) => ev.parsedDate && (ev.parsedDate as Date).getTime() >= today.getTime());
                    const pastOnly = sorted.filter((ev: any) => ev.parsedDate && (ev.parsedDate as Date).getTime() < today.getTime());
                    const visibleByDate = (() => {
                        if (mainTab === 'past') {
                            return [...pastOnly].sort((a: any, b: any) => {
                                const aTime = (a.parsedDate as Date).getTime();
                                const bTime = (b.parsedDate as Date).getTime();
                                if (bTime !== aTime) return bTime - aTime; // most recent first
                                const aStart = toMinutes(a.startTime);
                                const bStart = toMinutes(b.startTime);
                                if (bStart !== aStart) return bStart - aStart;
                                const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                                const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                                return bCreated - aCreated;
                            });
                        }
                        if (query) return upcomingOnly;
                        return sorted.filter((ev: any) => !ev.parsedDate || (ev.parsedDate as Date).getTime() >= today.getTime());
                    })();

                    const filtered = visibleByDate.filter((e: any) => {
                        if (!query) return true;
                        const q = query.toLowerCase();
                        // match across multiple event fields: title, description, location, date, times, status, submittedAt, org name
                        return (
                            (e.title || '').toLowerCase().includes(q) ||
                            (e.description || '').toLowerCase().includes(q) ||
                            (e.location || '').toLowerCase().includes(q) ||
                            (e.eventDate || '').toString().toLowerCase().includes(q) ||
                            (e.startTime || '').toLowerCase().includes(q) ||
                            (e.endTime || '').toLowerCase().includes(q) ||
                            (e.eventStatus || '').toLowerCase().includes(q) ||
                            (e.submittedAt || '').toString().toLowerCase().includes(q) ||
                            ((e.organization && e.organization.orgName) || '').toLowerCase().includes(q)
                        );
                    });

                    // apply status filters if any are selected
                    const statusFiltered = selectedStatuses && selectedStatuses.length > 0
                        ? filtered.filter((e: any) => selectedStatuses.includes(serverToUi(e.eventStatus)))
                        : filtered;

                    if (statusFiltered.length === 0) return <div>No events</div>;

                    // paginate results (9 per page)
                    const pageSize = 9;
                    const start = (currentPage - 1) * pageSize;
                    const paginated = statusFiltered.slice(start, start + pageSize);

                    return (
                        <>
                            {paginated.map((e: any) => {
                        const isPast = e.parsedDate ? (e.parsedDate as Date).getTime() < today.getTime() : false;
                        const statusUi = serverToUi(e.eventStatus);
                        return (
                        <CardEvent className="visual-card event-card"
                            key={e.id}
                            isPast={isPast}
                            eventImg={e.eventImg}
                            onClick={statusUi !== 'draft' ? () => navigate(`/event-overview?id=${encodeURIComponent(e.id)}`) : undefined}
                            style={{ cursor: statusUi !== 'draft' ? 'pointer' : undefined }}
                            title={e.title}
                            date={formatDateMDY(e.eventDate)}
                            location={e.location ?? ''}
                            startTime={e.startTime ?? ''}
                            description={e.description ?? ''}
                            status={serverToUi(e.eventStatus)}
                            onDiscard={statusUi === 'draft' ? () => handleDiscardDraft(e.id) : undefined}
                            onRename={(nextName) => handleRenameEvent(e.id, nextName)}
                            eventId={e.id}
                        />);
                            })}
                            {statusFiltered.length > pageSize && (
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                                    <Pagination current={currentPage} pageSize={pageSize} total={statusFiltered.length} onChange={(p) => setCurrentPage(p)} />
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
        </div >
    );
}