
import { useAuth } from "~/auth/AuthProvider";
import { apolloClient } from "~/lib/apollo-client";
import { EventsByOrganizationDocument } from "~/lib/graphql/generated";
import { useEffect, useState } from 'react';
import { serverToUi } from '~/lib/eventStatusMap';
import { formatDateMDY } from '~/lib/formatters';
import { Typography, Card, Badge, Input, Button } from "antd";
const { Title, Paragraph } = Typography;
import { Footer } from '../../molecules/footer/index';
import { Collapse } from "antd"
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';

import { CardEvent } from '../../../components/molecules/card';


export function EventSubmissionsContent() {
    const { user } = useAuth();

    const [events, setEvents] = useState<any[]>([]);

    

    useEffect(() => {
        const fetchOrgEvents = async () => {
            try {
                const orgId = user?.organization?.id ?? user?.organizationId;
                if (!orgId) {
                    console.debug('No organization id available on user', user);
                    return;
                }
                const { data } = await apolloClient.query<any>({
                    query: EventsByOrganizationDocument,
                    variables: { orgId },
                    fetchPolicy: 'network-only',
                });
                const fetched = data?.eventsByOrganization ?? [];
                setEvents(fetched);

                const drafts = fetched.filter((e: any) => serverToUi(e.eventStatus) === 'draft');
                const inReview = fetched.filter((e: any) => serverToUi(e.eventStatus) === 'in-review');
                console.log('Organization events:', fetched);
                console.log('In-Review events:', inReview);
                console.log('Draft events:', drafts);
            } catch (err) {
                console.error('Failed to fetch events by organization', err);
            }
        };
        fetchOrgEvents();
    }, [user]);

    const drafts = events.filter((e: any) => serverToUi(e.eventStatus) === 'draft');
    const inReview = events.filter((e: any) => serverToUi(e.eventStatus) === 'in-review');
    const [query, setQuery] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const toMinutes = (t?: string) => {
        if (!t) return 0;
        const parts = t.split(':').map(p => parseInt(p, 10));
        if (parts.length === 0 || isNaN(parts[0])) return 0;
        const h = parts[0] || 0;
        const m = parts[1] || 0;
        return h * 60 + m;
    };

    return (
        <>
        <div className="container m-6 w-auto">
            <div className="container">
                <Title level={2}>Event Submissions</Title>
                <Paragraph>
                    Manage and track the status of all your events, from draft to approval and more.
                </Paragraph>
                <div className="flex gap-2 mt-2" style={{ width: '100%' }}>
                    <Input.Search
                        placeholder="Search for your event..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onSearch={value => setQuery(value)}
                        enterButton={<Button type="primary" icon={<SearchOutlined />}/>}
                        style={{ flex: 1 }}
                    />
                    <Button
                        type={filtersOpen ? 'primary' : 'default'}
                        icon={<FilterOutlined />}
                        onClick={() => setFiltersOpen(v => !v)}
                    >
                        Filter
                    </Button>
                </div>
            </div>
            <div className="container my-4 w-auto flex gap-4">
                <Collapse defaultActiveKey={["1"]} >
                    <Collapse.Panel 
                    style={{
                        border: "none",
                    }}
                    header={
                        <div className="flex items-center gap-2">
                            <Title level={4} style={{
                                margin: "0"
                            }}>In-Review</Title>
                            <Badge count={inReview.length} style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }} />
                        </div>
                    } key="1">
                        <div className="flex gap-4" style={{ alignItems: 'center'}}>
                            {
                                (() => {
                                    const today = new Date();
                                    today.setHours(0,0,0,0);
                                    const withParsed = inReview.map((e: any) => ({
                                        ...e,
                                        parsedDate: e.eventDate ? new Date(e.eventDate) : null,
                                    }));
                                            const upcoming = withParsed
                                                    .sort((a: any, b: any) => {
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
                                    return upcoming.map((e: any) => (
                                            <CardEvent
                                            key={e.id}
                                            style={{ width: "calc(50% - 0.5rem)" }}
                                            title={e.title}
                                            date={formatDateMDY(e.eventDate)}
                                            location={e.location ?? ''}
                                            startTime={e.startTime ?? ''}
                                            description={e.description ?? ''}
                                            submissionDate={formatDateMDY(e.submittedAt)}
                                            status={serverToUi(e.eventStatus)}
                                        />
                                    ));
                                })()
                            }
                        </div>
                    </Collapse.Panel>
                </Collapse>
            </div>

            <div className="flex gap-4 flex-wrap w-full">
                {(() => {
                    const withParsed = events.map((e: any) => ({
                        ...e,
                        parsedDate: e.eventDate ? new Date(e.eventDate) : null,
                    }));
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
                    const filtered = sorted.filter((e: any) => {
                        if (!query) return true;
                        const q = query.toLowerCase();
                        return (
                            (e.title || '').toLowerCase().includes(q) ||
                            (e.description || '').toLowerCase().includes(q) ||
                            (e.location || '').toLowerCase().includes(q)
                        );
                    });

                    if (filtered.length === 0) return <div>No events</div>;
                    return filtered.map((e: any) => (
                        <CardEvent className="visual-card"
                            key={e.id}
                            style={{ flex: '0 0 calc((100% - 2rem) / 3)', maxWidth: 'calc((100% - 2rem) / 3)', boxSizing: 'border-box' }}
                            title={e.title}
                            date={formatDateMDY(e.eventDate)}
                            location={e.location ?? ''}
                            startTime={e.startTime ?? ''}
                            description={e.description ?? ''}
                            status={serverToUi(e.eventStatus)}
                        />
                    ));
                })()}
            </div>
        </div >
        <Footer />
        </>
    );
}