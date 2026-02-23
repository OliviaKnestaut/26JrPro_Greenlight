import CardWelcome from "~/components/molecules/card/card-welcome";
import CardAnnouncements from "~/components/molecules/card/card-announcements";
import { useAuth } from "~/auth/AuthProvider";
import { apolloClient } from "~/lib/apollo-client";
import { EventsByOrganizationDocument, useDeleteEventMutation, useUpdateEventMutation } from "~/lib/graphql/generated";
import { useEffect, useState } from 'react';
import { serverToUi } from '~/lib/eventStatusMap';
import { formatDateMDY } from '~/lib/formatters';
import { Typography, Card, Badge, Divider, message } from "antd";
import ProgressCircle from '../../molecules/progress-circle';

const { Link, Title } = Typography;
import { RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { CardCalendarUpcoming, CardEvent } from '../../../components/molecules/card';


export function DashboardContent() {
    const { user } = useAuth();
    const navigate = useNavigate();
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
                    if (import.meta.env.DEV) console.debug('No organization username available on user', user);
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

            } catch (err) {
                console.error('Failed to fetch events by organization', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgEvents();
    }, [user]);

    const drafts = events.filter((e: any) => serverToUi(e.eventStatus) === 'draft');
    const inReview = events.filter((e: any) => serverToUi(e.eventStatus) === 'in-review');

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

    // Prepare calendar items: include all approved and in-review events regardless of date
    const calendarItems = (() => {
        return (events || [])
            .map((e: any) => ({ ...e, parsed: e.eventDate ? new Date(e.eventDate) : null }))
            .filter((e: any) => {
                const s = serverToUi(e.eventStatus);
                return s === 'approved' || s === 'in-review';
            })
            .sort((a: any, b: any) => {
                const ta = a.parsed ? (a.parsed as Date).getTime() : Infinity;
                const tb = b.parsed ? (b.parsed as Date).getTime() : Infinity;
                return ta - tb;
            })
            .map((e: any) => ({
                id: e.id,
                title: e.title,
                date: formatDateMDY(e.eventDate),
                // include start/end times for mini-card display
                startTime: e.startTime ?? e.start_time ?? null,
                endTime: e.endTime ?? e.end_time ?? null,
                status: serverToUi(e.eventStatus),
            }));
    })();

    return (
        <>
            <div className="container my-4 w-auto flex flex-col md:flex-row" style={{ gap: '1rem', alignItems: 'stretch' }}>
                <div className="w-full md:w-2/5">
                    <CardWelcome
                        title={`Welcome back, ${user?.firstName ?? "there"}`}
                        subtitle="Ready to plan your next event?"
                    />
                </div>
                <div className="w-full md:w-3/5">
                    <CardAnnouncements
                        title="Announcements"
                        items={[
                            {
                                id: "a1",
                                title: (
                                <span>
                                    <Link href="#">“Coffee Chat With Women in Tech”</Link> has 1 new comment; update submission
                                </span>
                                ),
                            },
                            {
                                id: "a2",
                                title: (
                                <span>
                                    John Doe has submitted <Link href="#">“Public Speaking Workshop”</Link> for review
                                </span>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
            <div className="container my-4 w-auto flex gap-4 md:flex-row flex-col">
                <Card  className="w-full md:w-2/3"
                    style={{
                            background: "var(--background-2)",
                            border: "1px solid var(--accent-gray-light)",
                        }}
                >
                    <div className="flex justify-between items-center " style={{ cursor: 'pointer' }} onClick={() => navigate('/event-submissions?open=1')}>
                        <Title level={4} >In-Review <RightOutlined style={{fontSize:"12px"}}/> </Title>
                        <Badge count={inReview.length} style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }} />
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4">
                        {
                            (() => {
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const withParsed = inReview.map((e: any) => ({
                                    ...e,
                                    parsedDate: e.eventDate ? new Date(e.eventDate) : null,
                                }));
                                const upcoming = withParsed
                                    .filter((x: any) => x.parsedDate && x.parsedDate >= today)
                                    .sort((a: any, b: any) => (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime());
                                // Only show upcoming in-review events; exclude past events entirely
                                const top = upcoming.slice(0, 2);
                                if (loading) {
                                    return Array.from({ length: 2 }).map((_, i) => (
                                        <CardEvent key={`skeleton-inreview-${i}`} loading skeletonVariant="compact" className="w-full lg:w-1/2" />
                                    ));
                                }
                                if (top.length === 0) return <div>No upcoming in-review events</div>;
                                return top.map((e: any) => {
                                        const isPast = e.parsedDate ? (e.parsedDate as Date).getTime() < today.getTime() : false;
                                        return (
                                        <CardEvent
                                        key={e.id}
                                        isPast={isPast}
                                        eventImg={e.eventImg}
                                        onClick={() => navigate(`/event-overview?id=${encodeURIComponent(e.id)}`)}
                                        className="w-full lg:w-1/2"
                                        style={{ cursor: 'pointer' }}
                                        title={e.title}
                                        date={formatDateMDY(e.eventDate)}
                                        location={e.location ?? ''}
                                        startTime={e.startTime ?? ''}
                                        description={e.description ?? ''}
                                        submissionDate={formatDateMDY(e.submittedAt)}
                                        status={serverToUi(e.eventStatus)}
                                    />);
                                });
                            })()
                        }
                    </div>
                </Card>

                <Card  className="w-full md:w-1/3" 
                    style={{
                            background: "var(--background-2)",
                            border: "1px solid var(--accent-gray-light)",
                        }} >

                    <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        onClick={() => navigate('/budget')}
                    >
                        <Title level={4}>Budget <RightOutlined style={{fontSize:"12px"}} /> </Title>
                    </div>
                    <div className="flex gap-4 justify-center items-center flex-wrap mt-8">
                        <ProgressCircle 
                            total={10000}
                            spent={2500}
                        />
                        <div
                            className="flex flex-col gap-2"
                        >
                            <span className="flex items-center">
                                <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginRight: 8 }} aria-hidden="true">
                                    <circle cx="5" cy="5" r="4.5" fill="var(--primary-bright)"/>
                                </svg>
                                <span>
                                    <span>Spent: </span>
                                    <span className="medium">$2,500</span>
                                </span>
                            </span>
                            <span className="flex items-center">
                                <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginRight: 8 }} aria-hidden="true">
                                    <circle cx="5" cy="5" r="4.5" fill="var(--accent-gray-light)" stroke="var(--accent-gray-medium)" strokeWidth="1" />
                                </svg>
                                <span>
                                    <span>Remaining: </span>
                                    <span className="medium">$7,500</span>
                                </span>
                            </span>
                            <Divider className="divider"/>
                            <Title level={5}>Total: $10,000</Title>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="container my-4 w-auto flex gap-4 md:flex-row flex-col">
                <Card  className="w-full md:w-2/3"
                    style={{
                        background: "var(--background-2)",
                        border: "1px solid var(--accent-gray-light)",
                    }} >
                    <div className="flex justify-between items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/event-submissions?status=draft')}>
                        <Title level={4}>Drafts <RightOutlined style={{fontSize:"12px"}}/> </Title>
                        <Badge count={drafts.length} style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }} />
                    </div>
                    <div className="flex gap-4 flex-col">
                        {(() => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const withParsed = drafts.map((e: any) => ({
                                ...e,
                                parsedDate: e.eventDate ? new Date(e.eventDate) : null,
                            }));
                            const sortedByDate = withParsed
                                .sort((a: any, b: any) => {
                                    if (!a.parsedDate && !b.parsedDate) return 0;
                                    if (!a.parsedDate) return 1;
                                    if (!b.parsedDate) return -1;
                                    return (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime();
                                });
                                const top = sortedByDate.slice(0, 4);
                            if (loading) {
                                return (
                                    <>
                                        {Array.from({ length: 3 }).map((_, rowIdx) => (
                                            <div key={`skeleton-draft-row-${rowIdx}`} className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4" style={{ alignItems: 'stretch' }}>
                                                {Array.from({ length: 2 }).map((__, i) => (
                                                    <CardEvent key={`skeleton-draft-${rowIdx}-${i}`} loading skeletonVariant="compact" className="w-full xl:w-1/2" />
                                                ))}
                                            </div>
                                        ))}
                                    </>
                                );
                            }
                            if (top.length === 0) return <div>No upcoming drafts</div>;
                            const rows: any[] = [];
                            for (let i = 0; i < top.length; i += 2) rows.push(top.slice(i, i + 2));
                            return (
                                <>
                                    {rows.map((row, idx) => (
                                        <div key={`draft-row-${idx}`} className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4" style={{ alignItems: 'stretch' }}>
                                            {row.map((e: any) => {
                                                const isPast = e.parsedDate ? (e.parsedDate as Date).getTime() < today.getTime() : false;
                                                return (
                                                    <CardEvent
                                                        key={e.id}
                                                        isPast={isPast}
                                                        eventImg={e.eventImg}
                                                        className="w-full lg:w-1/2"
                                                        title={e.title}
                                                        date={formatDateMDY(e.eventDate)}
                                                        location={e.location ?? ''}
                                                        startTime={e.startTime ?? ''}
                                                        description={e.description ?? ''}
                                                        status={serverToUi(e.eventStatus)}
                                                        onDiscard={() => handleDiscardDraft(e.id)}
                                                        onRename={(nextName) => handleRenameEvent(e.id, nextName)}
                                                        eventId={e.id}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </>
                            );
                        })()}
                    </div>
                </Card>
                <Card  className="w-full md:w-1/3"
                    style={{
                        background: "var(--background-2)",
                        border: "1px solid var(--accent-gray-light)",
                    }} >
                    <CardCalendarUpcoming events={calendarItems} />
                </Card>
            </div>
        </>
    );
}