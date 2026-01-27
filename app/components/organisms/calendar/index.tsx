import { Typography } from "antd";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";

export function CalendarContent() {
    const navigate = useNavigate();
    
    return (
        <div className="container mx-auto p-8">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                <Title level={2} style={{ margin: 0 }}>Calendar</Title>
                <Paragraph>Calendar page content placeholder.</Paragraph>
            </div>
        </div>
    );
}