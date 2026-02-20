import React, { useRef, useState, useEffect } from "react";
import { Typography, Statistic, Card } from "antd";
const { Title, Paragraph, Link } = Typography;
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useGetEventByIdQuery } from '~/lib/graphql/generated';
import NavMini from "../../molecules/nav-mini";
import OptimizedImage from '../../atoms/OptimizedImage';
import CommentInput from '../../molecules/comment-input';

export function EventOverviewContent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>(null);
    const formatLocationType = (val?: string) => {
        if (!val) return '';
        const map: Record<string, string> = {
            'ON_CAMPUS': 'On Campus',
            'OFF_CAMPUS': 'Off Campus',
            'VIRTUAL': 'Virtual',
        };
        const key = String(val).toUpperCase();
        if (map[key]) return map[key];
        return String(val).replace(/_/g, ' ').split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
    };
    const { id } = useParams();
    const { data, loading, error } = useGetEventByIdQuery({ variables: { id: id ?? '' }, skip: !id });

    useEffect(() => {
        if (id && !loading && data?.event) {
            const ev = data.event;
            const mapped = {
                event: {
                    name: ev.title || '',
                    description: ev.description || '',
                    attendees: (ev as any).formData?.attendees || (ev as any).attendees || '',
                    dateRange: ev.eventDate ? [ev.eventDate, ev.eventDate] : [],
                },
                location: {
                    name: ev.location || '',
                    type: formatLocationType(ev.locationType || ''),
                },
                vendor: {
                    amount: (ev as any).formData?.estimatedCost || (ev as any).estimatedCost || '',
                    vendor: (ev as any).formData?.vendorNeeded === true || (ev as any).vendorNeeded === 'yes' ? 'yes' : 'no',
                },
                account: (ev as any).formData?.account || '',
                budget: (ev as any).formData?.budget || '',
                eventElements: Array.isArray((ev as any).formData?.elements) ? (ev as any).formData.elements : [],
            };
            setFormData(mapped);
            return;
        }
        // fallback to previous localStorage behavior when no id provided
        const dataLs = localStorage.getItem("eventFormData");
        if (dataLs) {
            setFormData(JSON.parse(dataLs));
        }
    }, [id, data, loading]);
    
    // Create refs for each section
    const eventDetailsRef = useRef<HTMLDivElement>(null);
    const dateLocationRef = useRef<HTMLDivElement>(null);
    const eventElementsRef = useRef<HTMLDivElement>(null);
    const budgetPurchaseRef = useRef<HTMLDivElement>(null);
    return (
        <div className="container m-8 w-auto">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined/> Back </Link>
                </Title>
            </div>
            {
                (() => {
                    const base = (import.meta as any).env?.BASE_URL ?? '/';
                    const imgSrc = data?.event?.eventImg ? `${base}uploads/event_img/${data.event.eventImg}`.replace(/\\/g, '/') : undefined;
                    return <OptimizedImage placeholder="grey" src={imgSrc} alt="Event header" style={{ width: '100%', height: 365, objectFit: 'cover' }} />;
                })()
            }

            <section style={{ display: "flex", flexDirection: "row", marginTop: "2rem", gap: "2rem" }}>
                <section>
                    <NavMini links={[
                        { title: 'Event Details', ref: eventDetailsRef },
                        { title: 'Date & Location', ref: dateLocationRef },
                        { title: 'Event Elements', ref: eventElementsRef },
                        { title: 'Budget & Purchase', ref: budgetPurchaseRef },
                    ]} />
                </section>

                <section style={{ display: "flex", flexDirection: "column", flexGrow: 1}}>
                    <Title level={2}>{formData?.event?.name || "Pitch and Paint Night"}</Title>

                    <Paragraph>Created By:</Paragraph>

                    <div style={{ display: "flex", flexDirection: "row", gap: "1.5rem", marginTop: "2rem",}}>
                        <Statistic className="stat-card-gray-border" title="Event Level" value="N/A" />
                        <Statistic className="stat-card-gray-border" title="Estimated Cost" value={formData?.vendor?.amount || "N/A"} />
                        <Statistic className="stat-card-gray-border" title="Estimated Attendees" value={formData?.event?.attendees || "N/A"} />
                        <Statistic className="stat-card-gray-border" title="Location Type" value={formData?.location?.type || "N/A"} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem"}}>
                        <Card ref={eventDetailsRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", marginTop: "1rem", scrollMarginTop: "2rem" }}>
                            {/* CARD TITLE */}
                            <Title level={3}>Event Details</Title>
                            {/* CARD CONTENT */}
                            <Title level={5}>Event Name</Title>
                            <Paragraph>{formData?.event?.name || "N/A"}</Paragraph>
                            <Title level={5}>Description</Title>
                            <Paragraph>{formData?.event?.description || "N/A"}</Paragraph>
                            <Title level={5}>Attendees</Title>
                            <Paragraph>{formData?.event?.attendees || "N/A"}</Paragraph>
                        </Card>
                        <Card ref={dateLocationRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            {/* CARD TITLE */}
                            <Title level={3}>Date & Location</Title>
                            {/* CARD CONTENT */}
                            <Title level={5}>Location Name</Title>
                            <Paragraph>{formData?.location?.name || "N/A"}</Paragraph>
                            <Title level={5}>Location Type</Title>
                            <Paragraph>{formData?.location?.type || "N/A"}</Paragraph>
                            <Title level={5}>Date & Time</Title>
                            <Paragraph>{formData?.event?.dateRange?.[0] || "N/A"} - {formData?.event?.dateRange?.[1] || "N/A"}</Paragraph>
                        </Card>
                        <Card ref={eventElementsRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            {/* CARD TITLE */}
                            <Title level={3}>Event Elements</Title>
                            {/* CARD CONTENT */}
                            <Title level={5}>Elements Selected</Title>
                            <Paragraph>
                                {Array.isArray(formData?.eventElements)
                                    ? formData.eventElements.join(", ")
                                    : "N/A"}
                            </Paragraph>
                        </Card>
                        <Card ref={budgetPurchaseRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            {/* CARD TITLE */}
                            <Title level={3}>Budget & Purchase</Title>
                            {/* CARD CONTENT */}
                            <Title level={5}>Account</Title>
                            <Paragraph>{formData?.account || "N/A"}</Paragraph>
                            <Title level={5}>Total Budget</Title>
                            <Paragraph>{formData?.budget || "N/A"}</Paragraph>
                            <Title level={5}>Vendor Needed</Title>
                            <Paragraph>{formData?.vendor?.vendor === "yes" ? "Yes" : "No"}</Paragraph>
                        </Card>
                    </div>
                    <CommentInput />
                </section>
            </section>
        </div>

    );
}