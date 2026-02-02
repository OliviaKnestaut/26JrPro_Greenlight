import { Typography, Card, Statistic, Progress, Button } from "antd";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

type BudgetRow = {
    key: string;
    category: string;
    allocated: number;
    spent: number;
};

export function BudgetContent() {
    const navigate = useNavigate();
    const [showFullAccount17, setShowFullAccount17] = useState(false);
    const [showFullAccount19, setShowFullAccount19] = useState(false);

    const totalAllocated = 10000;
    const totalPerTerm = Math.round(totalAllocated / 4);
    const totalSpent = 10000 - 7500;
    const totalRemaining = totalAllocated - 2500;
    const utilization = Math.round((totalSpent / totalAllocated) * 100);

    const columns: ColumnsType<BudgetRow> = [
        {
            title: 'Date',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Title',
            dataIndex: 'allocated',
            key: 'allocated',
            render: (val: number) => `$${val.toLocaleString()}`,
        },
        {
            title: 'Categories',
            dataIndex: 'spent',
            key: 'spent',
            render: (val: number) => `$${val.toLocaleString()}`,
        },
        {
            title: 'Event',
            key: 'remaining',
            render: (_: any, record: BudgetRow) => `$${(record.allocated - record.spent).toLocaleString()}`,
        },
        {
            title: 'Status',
            key: 'util',
            render: (_: any, record: BudgetRow) => {
                const pct = Math.round((record.spent / record.allocated) * 100);
                return <Progress percent={pct} size="small" />;
            }
        },
        {
            title: 'Cost',
            key: 'util',
            render: (_: any, record: BudgetRow) => {
                const pct = Math.round((record.spent / record.allocated) * 100);
                return <Progress percent={pct} size="small" />;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => <Button type="link">View</Button>
        }
    ];

    return (
        <div className="container m-8 w-auto">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div className="container w-full">
                <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                    <Title level={2} style={{ margin: 0 }}>Event Submissions</Title>
                    <Paragraph>
                        Manage and track the status of all your events, from draft to approval and more.
                    </Paragraph>
                </div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <Title level={5} className="mr-2" style={{ paddingTop: "0.5rem",fontWeight: 500 }}>Account:</Title>
                        <Title level={5} style={{ marginTop: 0, paddingTop: "0.5rem",fontWeight: 400 }}> {showFullAccount17 ? '17-12341234' : '17-x1234'}</Title>
                        <Button
                            type="link"
                            onClick={() => setShowFullAccount17(s => !s)}
                            style={{ padding: 0, width: 20, marginRight: '0.5rem' }}
                            icon={showFullAccount17 ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            aria-label={showFullAccount17 ? 'Hide account 17' : 'Show full account 17'}
                        />
                        <Title level={5} style={{ marginTop: 0, paddingTop: "0.5rem",fontWeight: 400 }}> {showFullAccount19 ? '19-12341234' : '19-x1234'}</Title>
                        <Button
                            type="link"
                            style={{ padding: 0, width: 20, marginRight: '0.5rem' }}
                            onClick={() => setShowFullAccount19(s => !s)}
                            icon={showFullAccount19 ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            aria-label={showFullAccount19 ? 'Hide account 19' : 'Show full account 19'}
                        />
                    </div>
                    <Button type="primary" onClick={() => navigate('')}>
                        New Purchase Request
                    </Button>
                </div>
                <div className="flex gap-4 w-full my-4">
                    <Statistic title="Total Year-Round Budget" value={`$${totalAllocated.toLocaleString()}`} />
                    <Statistic title="Total Budget Per Term" value={`$${totalPerTerm.toLocaleString()}`} />
                    <Statistic title="Remaining" value={`$${totalRemaining.toLocaleString()}`} />
                    <Statistic title="Budget Utilization" value={`${utilization}%`} />
                </div>
                <div style={{ display: 'flex', gap: 16, width: '100%', margin: '1rem 0' }}>
                    <div style={{ flex: 1 }}>
                        <Card style={{ width: '100%' }}>
                            <Title level={4} >Total Spent</Title>
                        </Card>
                    </div>
                    <div style={{ flex: 1 }}>
                        <Card style={{ width: '100%' }}>
                            <Title level={4}>Money Spent</Title>
                        </Card>
                    </div>
                </div>

            </div>

            <Card>
                <Title level={4}>Purchase Requests</Title>
            </Card>
        </div>
    );
}