import { Typography, Card } from "antd";
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
        title: "Org Constitution",
        description: "Covers the details and guidelines that define your organization’s structure and operations."
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
        title: "Event Coordinator Transitions",
        description: "Summarizes the updated FY26 event policies that student organizations must follow before hosting activities."
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
        title: "President Transition",
        description: "Explains the contracting process for events, including when to use vendors and how to follow FY24 procedures."
    }
];

export function ResourcesContent() {


    const navigate = useNavigate();

    return (

        <div className="container mx-auto p-8">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem", width: "100%" }}>
                <Title level={2} style={{ margin: 0 }}>Resources</Title>
                <Paragraph>Find training videos, organization documents, and key university policies here.</Paragraph>
            </div>

            <div style={{ display: "flex", flexDirection: "row", marginTop: "1rem", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "70%" }}>
                    <Card>
                        <Title level={4}>Training Videos</Title>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gridAutoRows: "auto",
                            gap: "1rem",
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
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gridAutoRows: "auto",
                            gap: "1rem",
                        }}>
                            {trainingVideos.map((item => (
                                <DocumentResource key={item.title} title={item.title}>
                                    {item.description}
                                </DocumentResource>
                            )))}
                        </div>

                    </Card>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "30%" }}>
                    <Card>
                        <Title level={4}>Event Guidelines and Templates</Title>
                        <ol>
                            <li><a href="#" target="_blank" rel="noopener noreferrer">Guest Speaker Policy</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer">Event Planning Policies </a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer">Diversity and Inclusion Policies </a></li>

                        </ol>
                    </Card>


                    <Card>
                        <Title level={4}>University Policies</Title>
                        <ol>
                            <li><a href="#" target="_blank" rel="noopener noreferrer">Guest Speaker Policy</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer">Event Planning Policies </a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer">Diversity and Inclusion Policies </a></li>

                        </ol>
                    </Card>
                </div>

            </div>
        </div>
    );
}