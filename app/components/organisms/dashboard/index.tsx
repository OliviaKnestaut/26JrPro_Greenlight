import CardWelcome from "~/components/molecules/card/card-welcome";
import CardAnnouncements from "~/components/molecules/card/card-announcements";
import { useAuth } from "~/auth/AuthProvider";
import { apolloClient } from "~/lib/apollo-client";
import { EventsByOrganizationDocument } from "~/lib/graphql/generated";
import { useEffect, useState } from 'react';
import { serverToUi } from '~/lib/eventStatusMap';
import { formatDateMDY } from '~/lib/formatters';
import { Typography, Card, Badge, Divider } from "antd";
import ProgressCircle from '../../molecules/progress-circle';
import StyledCalendar from '../../molecules/calendar';
import { Footer } from '../../molecules/footer/index';

const { Link, Title } = Typography;
import { RightOutlined } from '@ant-design/icons';
import { CardEvent } from '../../../components/molecules/card';


export function DashboardContent() {
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

    return (
        <>
        <div className="container m-6 w-auto">
            <div className="container my-4 w-auto flex" style={{ gap: '1rem', alignItems: 'stretch' }}>
                <CardWelcome
                    title={`Welcome back, ${user?.firstName ?? "there"}`}
                    subtitle="Ready to plan your next event?"
                />
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
            <div className="container my-4 w-auto flex gap-4">
                <Card  style={{
                        background: "var(--background-2)",
                        border: "1px solid var(--accent-gray-light)",
                        width: "66%",
                    }}
                >
                    <div className="flex justify-between items-center">
                        <Title level={4}>In-Review <RightOutlined style={{fontSize:"12px"}}/> </Title>
                        <Badge count={inReview.length} style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }} />
                    </div>
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
                                    .filter((x: any) => x.parsedDate && x.parsedDate >= today)
                                    .sort((a: any, b: any) => (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime());
                                // Only show upcoming in-review events; exclude past events entirely
                                const top = upcoming.slice(0, 2);
                                if (top.length === 0) return <div>No upcoming in-review events</div>;
                                return top.map((e: any) => (
                                        <CardEvent
                                        key={e.id}
                                        style={{ width: "calc(50% - 0.5rem)" }}
                                        title={e.title}
                                        date={formatDateMDY(e.eventDate)}
                                        location={e.location ?? ''}
                                        startTime={e.startTime ?? ''}
                                        description={e.description ?? ''}
                                        submissionDate={formatDateMDY(e.createdAt)}
                                        status={serverToUi(e.eventStatus)}
                                    />
                                ));
                            })()
                        }
                    </div>
                </Card>


                <Card  style={{
                        background: "var(--background-2)",
                        border: "1px solid var(--accent-gray-light)",
                        width: "33%"
                    }} >
                    <Title level={4}>Budget <RightOutlined style={{fontSize:"12px"}}/> </Title>
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
            <div className="container my-4 w-auto flex gap-4">
                <Card  style={{
                        background: "var(--background-2)",
                        border: "1px solid var(--accent-gray-light)",
                        width: "66%"
                    }} >
                    <div className="flex justify-between items-center">
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
                            const upcoming = withParsed
                                .filter((x: any) => x.parsedDate && x.parsedDate >= today)
                                .sort((a: any, b: any) => (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime());
                            const top = upcoming.slice(0, 4);
                            if (top.length === 0) return <div>No upcoming drafts</div>;
                            const firstRow = top.slice(0, 2);
                            const secondRow = top.slice(2, 4);
                            return (
                                <>
                                    <div className="flex gap-4">
                                        {firstRow.map((e: any) => (
                                            <CardEvent
                                                key={e.id}
                                                style={{ width: "calc(50% - 0.5rem)" }}
                                                title={e.title}
                                                date={formatDateMDY(e.eventDate)}
                                                location={e.location ?? ''}
                                                startTime={e.startTime ?? ''}
                                                description={e.description ?? ''}
                                                status={serverToUi(e.eventStatus)}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        {secondRow.map((e: any) => (
                                            <CardEvent
                                                key={e.id}
                                                style={{ width: "calc(50% - 0.5rem)" }}
                                                title={e.title}
                                                date={formatDateMDY(e.eventDate)}
                                                location={e.location ?? ''}
                                                startTime={e.startTime ?? ''}
                                                description={e.description ?? ''}
                                                status={serverToUi(e.eventStatus)}
                                            />
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </Card>
                <Card  style={{
                        background: "var(--background-2)",
                        border: "1px solid var(--accent-gray-light)",
                        width: "33%"
                    }} >
                    <StyledCalendar/>
                </Card>
            </div>
        </div >
        <Footer />
        </>
    );
}