
import { useAuth } from "~/auth/AuthProvider";
import { apolloClient } from "~/lib/apollo-client";
import { EventsByOrganizationDocument } from "~/lib/graphql/generated";
import { useEffect, useState } from 'react';
import { serverToUi } from '~/lib/eventStatusMap';
import { formatDateMDY } from '~/lib/formatters';
import { Typography, Badge, Input, Button, Space, Switch, Popover, Checkbox, Tag, Collapse, Skeleton, Card } from "antd";
import { useSearchParams, useNavigate } from 'react-router';
const { Title, Paragraph, Link } = Typography;
import { FilterOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import { CardEvent } from '../../../components/molecules/card';


export function EventSubmissionsContent() {
    const { user } = useAuth();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
    const [showPast, setShowPast] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

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
        setSelectedStatuses(statusParam ? statusParam.split(',').filter(Boolean) : []);
        setShowPast(pastParam === '1' || pastParam === 'true');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (query && query.trim() !== '') params.set('q', query.trim());
        if (selectedStatuses && selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
        if (showPast) params.set('past', '1');
        setSearchParams(params, { replace: true });
    }, [query, selectedStatuses, showPast, setSearchParams]);

    const toMinutes = (t?: string) => {
        if (!t) return 0;
        const parts = t.split(':').map(p => parseInt(p, 10));
        if (parts.length === 0 || isNaN(parts[0])) return 0;
        const h = parts[0] || 0;
        const m = parts[1] || 0;
        return h * 60 + m;
    };

    return (
        <div className="container m-8 w-auto">
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
                            style={{ borderRadius: 0 }}
                            content={
                                <div style={{ padding: 8, width: 120 }} onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <Checkbox checked={pendingStatuses.includes('draft')} onChange={() => toggleStatus('draft')}>In-Draft</Checkbox>
                                        <Checkbox checked={pendingStatuses.includes('in-review')} onChange={() => toggleStatus('in-review')}>In-Review</Checkbox>
                                        <Checkbox checked={pendingStatuses.includes('approved')} onChange={() => toggleStatus('approved')}>Approved</Checkbox>
                                        <Checkbox checked={pendingStatuses.includes('cancelled')} onChange={() => toggleStatus('cancelled')}>Cancelled</Checkbox>
                                        <Checkbox checked={pendingStatuses.includes('past')} onChange={() => toggleStatus('past')}>Past</Checkbox>
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
                    <div 
                    className="flex items-center justify-end gap-2"
                    style={{ width: 155 }}>
                        <span style={{ whiteSpace: 'nowrap' }}>{showPast ? 'Showing Past' : 'Upcoming Only'}</span>
                        <Switch checked={showPast} onChange={(v) => setShowPast(v)} />
                    </div>
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
                        defaultActiveKey={["1"]} expandIconPosition="end" items={[{
                        key: '1',
                        label: (
                            <div className="flex items-center gap-2">
                                <Title level={4} style={{ margin: 0 }}>In-Review</Title>
                                <Badge count={inReview.length} style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }} />
                            </div>
                        ),
                        children: (loading ? (
                            <div className="flex gap-4" style={{ alignItems: 'center'}}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} style={{ width: "calc(33% - 0.66rem)" }}>
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
                                // fallback to event start time when dates tie
                                const aTime = toMinutes(a.startTime);
                                const bTime = toMinutes(b.startTime);
                                if (aTime !== bTime) return aTime - bTime;
                                const aSubmitted = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
                                const bSubmitted = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
                                return aSubmitted - bSubmitted;
                            });
                            return (
                                <div className="flex gap-4" style={{ alignItems: 'center'}}>
                                    {upcoming.map((e: any) => {
                                        const isPast = e.parsedDate ? (e.parsedDate as Date).getTime() < (new Date()).setHours(0,0,0,0) : false;
                                        const statusUi = serverToUi(e.eventStatus);
                                        return (
                                        <CardEvent
                                            key={e.id}
                                            isPast={isPast}
                                            eventImg={e.eventImg}
                                            onClick={statusUi !== 'draft' ? () => navigate(`/event-overview/${e.id}`) : undefined}
                                            style={{ width: "calc(50% - 0.5rem)", cursor: statusUi !== 'draft' ? 'pointer' : undefined }}
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
            <div className="flex gap-4 flex-wrap w-full my-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ width: "calc(33% - 0.66rem)" }}>
                            <CardEvent className="visual-card" loading skeletonVariant="visual" style={{ width: '100%' }} />
                        </div>
                    ))
                ) : (() => {
                    const withParsed = events.map((e: any) => ({
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
                    const visibleByDate = (() => {
                        if (query && !showPast) return upcomingOnly;
                        return showPast ? sorted : sorted.filter((ev: any) => !ev.parsedDate || (ev.parsedDate as Date).getTime() >= today.getTime());
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
                        return statusFiltered.map((e: any) => {
                        const isPast = e.parsedDate ? (e.parsedDate as Date).getTime() < today.getTime() : false;
                        const statusUi = serverToUi(e.eventStatus);
                        return (
                        <CardEvent className="visual-card"
                            key={e.id}
                            isPast={isPast}
                            eventImg={e.eventImg}
                            onClick={statusUi !== 'draft' ? () => navigate(`/event-overview/${e.id}`) : undefined}
                            style={{ flex: '0 0 calc((100% - 2rem) / 3)', maxWidth: 'calc((100% - 2rem) / 3)', boxSizing: 'border-box', cursor: statusUi !== 'draft' ? 'pointer' : undefined }}
                            title={e.title}
                            date={formatDateMDY(e.eventDate)}
                            location={e.location ?? ''}
                            startTime={e.startTime ?? ''}
                            description={e.description ?? ''}
                            status={serverToUi(e.eventStatus)}
                        />);
                    });
                })()}
            </div>
        </div >
    );
}