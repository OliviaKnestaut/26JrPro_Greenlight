import { Typography, Card, Statistic, Progress, Button, Table, Tag } from "antd";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useAuth } from "~/auth/AuthProvider";
import { usePurchasesByOrganizationQuery, useEventsByOrganizationQuery } from "~/lib/graphql/generated";
import { formatDateMDY } from "~/lib/formatters";

export function BudgetContent() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const orgUsername = user?.organization?.username ?? user?.organizationUsername ?? '';

    const { data: purchasesData, loading: purchasesLoading } = usePurchasesByOrganizationQuery({
        variables: { orgUsername: orgUsername || '', limit: 100, offset: 0 },
        skip: !orgUsername,
        fetchPolicy: 'network-only',
    });

    const { data: eventsData } = useEventsByOrganizationQuery({
        variables: { orgUsername: orgUsername || '', limit: 500, offset: 0 },
        skip: !orgUsername,
    });
    const [showFullAccount17, setShowFullAccount17] = useState(false);
    const [showFullAccount19, setShowFullAccount19] = useState(false);

    const totalAllocated = 10000;
    const totalPerTerm = Math.round(totalAllocated / 4);
    const totalSpent = 10000 - 7500;
    const totalRemaining = totalAllocated - 2500;
    const utilization = Math.round((totalSpent / totalAllocated) * 100);

    return (
        <div className="container m-8 w-auto">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div className="container w-full">
                <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                    <Title level={2} style={{ margin: 0 }}>Budget</Title>
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
                <div style={{ marginTop: 12 }}>
                    {
                        (() => {
                            if (!orgUsername) return <div>No organization associated with your account.</div>;

                            const eventMap = new Map<string, string>((eventsData?.eventsByOrganization ?? []).map((e: any) => [e.id, e.title]));

                            const rows = (purchasesData?.purchasesByOrganization ?? []).map((p: any) => ({
                                key: p.id,
                                date: p.dateSubmitted,
                                title: p.itemTitle,
                                categories: p.itemCategory,
                                eventId: p.eventId,
                                eventTitle: eventMap.get(p.eventId) ?? null,
                                status: p.orderStatus,
                                cost: p.itemCost,
                            }));

                            const columns: ColumnsType<any> = [
                                {
                                    title: 'Date',
                                    dataIndex: 'date',
                                    key: 'date',
                                    render: (d: string) => formatDateMDY(d),
                                },
                                {
                                    title: 'Title',
                                    dataIndex: 'title',
                                    key: 'title',
                                },
                                {
                                    title: 'Categories',
                                    dataIndex: 'categories',
                                    key: 'categories',
                                },
                                {
                                    title: 'Event',
                                    dataIndex: 'eventTitle',
                                    key: 'event',
                                    render: (t: any, row: any) => t ? t : row.eventId ? `#${row.eventId}` : '-',
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (s: string) => {
                                        const color = s === 'approved' ? 'green' : s === 'rejected' ? 'red' : s === 'ordered' ? 'blue' : 'gold';
                                        return <Tag color={color}>{s}</Tag>;
                                    }
                                },
                                {
                                    title: 'Cost',
                                    dataIndex: 'cost',
                                    key: 'cost',
                                    render: (c: number) => c == null ? '-' : `$${Number(c).toFixed(2)}`,
                                }
                            ];

                            return (
                                <Table columns={columns} dataSource={rows} loading={purchasesLoading} pagination={{ pageSize: 10 }} />
                            );
                        })()
                    }
                </div>
            </Card>
        </div>
    );
}