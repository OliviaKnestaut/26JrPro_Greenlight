import { Typography } from "antd";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card } from "antd";
import StyledCalendar from '../../molecules/calendar';
import CardCalendarUpcoming from "../../molecules/card/card-calendar-upcoming";
import { WeeklyCalendar } from "~/vendor/calendar/WeeklyCalendar";
import { serverToUi } from "~/lib/eventStatusMap";
import { formatDateMDY } from "~/lib/formatters";
import { useState, useEffect } from 'react';
import { useAuth } from "~/auth/AuthProvider";
import { apolloClient } from "~/lib/apollo-client";
import { EventsByOrganizationDocument } from "~/lib/graphql/generated";


export function CalendarContent() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

                const drafts = fetched.filter((e: any) => serverToUi(e.eventStatus) === 'draft');
                const inReview = fetched.filter((e: any) => serverToUi(e.eventStatus) === 'in-review');
                if (import.meta.env.DEV) {
                    console.log('Organization events:', fetched);
                    console.log('In-Review events:', inReview);
                    console.log('Draft events:', drafts);
                }
            } catch (err) {
                console.error('Failed to fetch events by organization', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgEvents();
    }, [user]);

    // Prepare calendar items: include all approved and in-review events regardless of date.
    // Also include demo events that may not have `eventStatus` set.
    const calendarItems = (() => {
        return (events || [])
            .map((e: any) => ({ ...e, parsed: e.eventDate ? new Date(e.eventDate) : (e.startTime ? new Date(e.startTime) : null) }))
            .filter((e: any) => {
                const s = serverToUi(e.eventStatus);
                // include if explicitly approved/in-review, or if no server status present (demo/local events)
                // Also include events that map to 'unknown' but have a start time (server may send an unexpected token for in-review)
                return s === 'approved' || s === 'in-review' || ((e.eventStatus === undefined || s === 'unknown') && (e.eventId || e.startTime));
            })
            .sort((a: any, b: any) => {
                const ta = a.parsed ? (a.parsed as Date).getTime() : Infinity;
                const tb = b.parsed ? (b.parsed as Date).getTime() : Infinity;
                return ta - tb;
            })
            .slice(0, 6)
                .map((e: any) => ({
                    id: e.id || e.eventId,
                    title: e.title,
                    date: formatDateMDY(e.eventDate || e.startTime || e.parsed),
                    // keep the parsed Date object so downstream code can use a reliable Date
                    parsed: e.parsed ?? (e.eventDate ? new Date(e.eventDate) : (e.startTime ? new Date(e.startTime) : null)),
                    startTime: e.startTime ?? e.start_time ?? null,
                    endTime: e.endTime ?? e.end_time ?? null,
                    status: serverToUi(e.eventStatus),
                }));
    })();

    // Map calendarItems to the GenericEvent shape expected by WeeklyCalendar
    const weeklyEvents = calendarItems.map((ci: any) => {
        const parseToDate = (v: any) => {
            if (!v) return null;
            if (v instanceof Date) return v;
            try {
                const d = new Date(v);
                return isNaN(d.getTime()) ? null : d;
            } catch {
                return null;
            }
        };

        const makeDateFromDateAndTime = (dateStr: any, timeStr: any) => {
            if (!dateStr && !timeStr) return null;
            // If timeStr looks like a full datetime, parse it directly
            if (timeStr && (typeof timeStr === 'string') && (timeStr.includes('T') || timeStr.includes('-'))) {
                return parseToDate(timeStr);
            }
            // Resolve a date object from dateStr
            let dateObj: Date | null = null;
            if (dateStr) {
                if (dateStr instanceof Date) dateObj = dateStr;
                else if (typeof dateStr === 'string') {
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        const m = parseInt(parts[0], 10);
                        const d = parseInt(parts[1], 10);
                        const y = parseInt(parts[2], 10);
                        if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
                            dateObj = new Date(y, m - 1, d);
                        }
                    }
                    if (!dateObj) dateObj = parseToDate(dateStr);
                }
            }
            // If only a time was provided (no date), try parsing time as full datetime
            if (!dateObj && timeStr) return parseToDate(timeStr);
            if (!dateObj) return null;

            // If no time provided, return date at start of day
            if (!timeStr) return dateObj;

            // timeStr may be like "HH:mm" or "HH:mm:ss"
            const tparts = ('' + timeStr).split(':').map((s) => parseInt(s, 10));
            const hours = !isNaN(tparts[0]) ? tparts[0] : 0;
            const minutes = !isNaN(tparts[1]) ? tparts[1] : 0;
            const seconds = !isNaN(tparts[2]) ? tparts[2] : 0;
            return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hours, minutes, seconds);
        };

        // Build start/end preferring explicit date+time fields rather than `parsed`
        const start = makeDateFromDateAndTime(ci.date, ci.startTime) || parseToDate(ci.startTime) || parseToDate(ci.time) || null;
        const end = makeDateFromDateAndTime(ci.date, ci.endTime) || parseToDate(ci.endTime) || (start ? new Date(start.getTime() + 60 * 60 * 1000) : null);
        const bg = ci.status === 'approved' ? 'var(--accent-green-light)' : ci.status === 'in-review' ? 'var(--accent-yellow-light)' : undefined;
        return {
            eventId: ci.id || ci.eventId || String(Math.random()),
            startTime: start || new Date(),
            endTime: end || new Date((start || new Date()).getTime() + 60 * 60 * 1000),
            title: ci.title,
            backgroundColor: bg,
            status: ci.status,
            location: ci.location ?? undefined,
        };
    });

    return (
        <div >
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                <Title level={2} style={{ margin: 0 }}>Calendar</Title>
                <Paragraph>View your upcoming org events.</Paragraph>
            </div>

            <div style={{ display: "flex", flexDirection: "row", gap: "2rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem", flex: "1" }}>
                    <Card>
                        <CardCalendarUpcoming events={calendarItems} />
                    </Card>
                </div>
                <div style={{ flex: "2" }}>
                    <WeeklyCalendar
                        events={weeklyEvents}
                        weekends={true}
                        onEventClick={(event) => {
                            const id = (event as any).eventId || (event as any).id;
                            if (id) navigate(`/event-overview/${id}`);
                        }}
                        onSelectDate={(date) => console.log(date)}
                    />
                </div>
            </div>
        </div>
    );
}

export default CalendarContent;