import React, { useRef } from "react";
import { Typography, Statistic, Card } from "antd";
const { Title, Paragraph, Link } = Typography;
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import NavMini from "../../molecules/nav-mini";

export function EventOverviewContent() {
    const navigate = useNavigate();
    
    // Create refs for each section
    const eventDetailsRef = useRef<HTMLDivElement>(null);
    const dateLocationRef = useRef<HTMLDivElement>(null);
    const eventElementsRef = useRef<HTMLDivElement>(null);
    const budgetPurchaseRef = useRef<HTMLDivElement>(null);
    return (
        <div className="container mx-auto p-8">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <img style={{ width: '100%', height: '100%' }} src="https://placehold.co/1160x356" />

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
                    <Title level={2}>Pitch and Paint Night</Title>

                    <div style={{ display: "flex", flexDirection: "row", gap: "1.5rem", marginTop: "2rem",}}>
                        <Statistic title="Event Level" value="Level 2" />
                        <Statistic title="Estimated Cost" value="$1,400" />
                        <Statistic title="Estimated Attendees" value="50" />
                        <Statistic title="Location Type" value="On Campus" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem"}}>
                        <Card ref={eventDetailsRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", marginTop: "1rem", scrollMarginTop: "2rem" }}>
                            {/* CARD TITLE */}
                            <Title level={3}>Event Details</Title>
                            {/* CARD CONTENT */}
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                        </Card>
                        <Card ref={dateLocationRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            {/* CARD TITLE */}
                            <Title level={3}>Date & Location</Title>
                            {/* CARD CONTENT */}
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                        </Card>
                        <Card ref={eventElementsRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            {/* CARD TITLE */}
                            <Title level={3}>Event Elements</Title>
                            {/* CARD CONTENT */}
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                        </Card>
                        <Card ref={budgetPurchaseRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            {/* CARD TITLE */}
                            <Title level={3}>Budget & Purchase</Title>
                            {/* CARD CONTENT */}
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                            <Title level={5}> Event Name</Title>
                            <Paragraph>Pitch and Paint Night</Paragraph>
                        </Card>
                    </div>
                </section>
            </section>
        </div>
    );
}