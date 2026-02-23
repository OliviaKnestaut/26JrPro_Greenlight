import { Typography, Card, Grid } from "antd";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { TrainingResource } from "../../molecules/card";
import { DocumentResource } from "../../molecules/card";

export type ResourceItem = {
    title: string;
    description: string;
};

export const trainingVideos: ResourceItem[] = [
    {
        title: "Officer Training",
        description: "Provides a quick overview of the essential skills every student leader needs to run their organization effectively."
    },
    {
        title: "Event Planning",
        description: "Offers a step-by-step walkthrough of how to plan, prepare, and submit a successful event from start to finish."
    },
    {
        title: "Safety Training",
        description: "Covers the key safety guidelines to ensure all events meet campus standards and protect attendees."
    },
    {
        title: "Diversity & Inclusion",
        description: "Introduces materials that support building inclusive, welcoming, and culturally aware organizational practices."
    },
    {
        title: "Event Policies",
        description: "Summarizes the updated FY26 event policies that student organizations must follow before hosting activities."
    },
    {
        title: "Event Form Training",
        description: "Guides users through the updated FY26 event form, highlighting what each section requires and how to complete it accurately."
    },
    {
        title: "Contracting Training",
        description: "Explains the contracting process for events, including when to use vendors and how to follow FY24 procedures."
    }
];

export const orgDocuments: ResourceItem[] = [
    {
        title: "Org Constitution",
        description: "Covers the details and guidelines that define your organization's structure and operations."
    },
    {
        title: "Member Roster",
        description: "Lists all active members currently registered with your organization."
    },
    {
        title: "VP Transition",
        description: "Provides essential information to support a smooth transition for incoming Vice Presidents."
    },
    {
        title: "Treasurer Transition",
        description: "Introduces materials that support building inclusive, welcoming, and culturally aware organizational practices."
    },
    {
        title: "President Transition",
        description: "Explains the contracting process for events, including when to use vendors and how to follow FY24 procedures."
    },
    {
        title: "Infractions",
        description: "Guides users through the updated FY26 event form, highlighting what each section requires and how to complete it accurately."
    },
    {
        title: "Member Interview Questions",
        description: "Explains the contracting process for events, including when to use vendors and how to follow FY24 procedures."
    },
    {
        title: "Event Coordinator Transitions",
        description: "Summarizes the updated FY26 event policies that student organizations must follow before hosting activities."
    },
];

export function ResourcesContent() {

    const screens = Grid.useBreakpoint();
    if (!screens.md) {
        return (
            <div className="container">
                <Card>
                    <Title level={3}>This page is not available on mobile devices</Title>
                </Card>
            </div>
        );
    }
    const navigate = useNavigate();

    return (

        <div>
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem", width: "100%" }}>
                <Title level={2} style={{ margin: 0 }}>Resources</Title>
                <Paragraph>Find training videos, organization documents, and key university policies here.</Paragraph>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Card>
                        <Title level={4}>Training Videos</Title>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "1rem",
                            width: "100%",
                            justifyContent: "center"
                        }}>
                            {trainingVideos.map((item => (
                                <TrainingResource key={item.title} title={item.title}>
                                    {item.description}
                                </TrainingResource>
                            )))}
                        </div>
                    </Card>
                    <Card>
                        <Title level={4}>Organization Documents</Title>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "1rem",
                            width: "100%",
                            justifyItems: "center"
                        }}>
                            {orgDocuments.map((item => (
                                <DocumentResource key={item.title} title={item.title}>
                                    {item.description}
                                </DocumentResource>
                            )))}
                        </div>

                    </Card>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Card>
                        <Title level={4}>Event Guidelines and Templates</Title>
                        <ol style={{
                            listStyleType: "circle",
                            paddingLeft: "1.25rem",
                            margin: 0
                        }}>
                            <li>Event Planning Checklist</li>
                            <li>Budgeting Template for Events</li>
                            <li>Event Promotion Guide</li>
                            <li>Event Timeline Template</li>
                            <li>Venue Selection Guidelines</li>
                            <li>Event Day Checklist</li>
                            <li>Post-Event Survey Template</li>
                        </ol>
                    </Card>


                    <Card>
                        <Title level={4}>University Policies</Title>
                        <ol style={{
                            listStyleType: "circle",
                            paddingLeft: "1.25rem",
                            margin: 0
                        }}>
                            <li>Guest Speaker Policy </li>
                            <li>Event Planning Policies </li>
                            <li>Diversity and Inclusion Policies </li>
                            <li>Safety Policies </li>
                            <li>Food & Catering Policies </li>
                            <li>Alcohol and Substance Rules </li>
                            <li>Use of University Funds/Grants </li>
                            <li>Room Reservation Rules</li>
                        </ol>
                    </Card>
                </div>

            </div>
        </div>
    );
}