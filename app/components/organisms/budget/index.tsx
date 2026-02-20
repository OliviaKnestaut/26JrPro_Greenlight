import { Typography, Card, Statistic, Progress, Button, Table, Tag, Select } from "antd";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined, EyeOutlined, EyeInvisibleOutlined, FilterOutlined } from "@ant-design/icons";
import { useAuth } from "~/auth/AuthProvider";
import { usePurchasesByOrganizationQuery, useEventsByOrganizationQuery } from "~/lib/graphql/generated";
import { formatDateMDY } from "~/lib/formatters";
import spentGraph from '../../assets/spent-graph.svg';
import spentBar from '../../assets/spent-bar.svg';

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
    const [selectedAccount, setSelectedAccount] = useState<'17' | '19'>('17');
    const [showFull, setShowFull] = useState(false);
    
    const [viewAll, setViewAll] = useState(false);
    const accountLabel = (prefix: string) =>
        showFull ? `${prefix}-12341234` : `${prefix}-x1234`;
            return (
            <div>
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
                        <div className="flex items-center gap-2">
                            <Title level={5} style={{ paddingTop: "0.5rem", fontWeight: 500, margin: 0 }}>Account:</Title>
                            <div className="flex items-center gap-0">
                                <Button
                                    type="link"
                                    onClick={() => setShowFull(s => !s)}
                                    style={{ padding: 0, width: 20 }}
                                    icon={showFull ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                />
                                <Select
                                    value={selectedAccount}
                                    onChange={(val) => setSelectedAccount(val)}
                                    style={{ width: 130, marginLeft: -12 }}
                                    variant="borderless"
                                    options={[
                                        { value: '17', label: accountLabel('17') },
                                        { value: '19', label: accountLabel('19') },
                                    ]}
                                />
                            </div>
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
                                <Title level={4}>Total Spent</Title>
                                <img src={spentGraph} alt="Total Spent Graph" style={{ width: '100%' }} />
                            </Card>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Card style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Title level={4} style={{ margin: 0 }}>Money Spent</Title>
                                    <Button type="link" style={{ padding: 0 }}>Fall 2025 ▾</Button>
                                </div>
                                <img src={spentBar} alt="Total Money Spent Bar Graph" style={{ width: '100%' }} />
                            </Card>
                        </div>
                    </div>
                </div>

                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <Title level={4} style={{ margin: 0 }}>Purchase Requests</Title>
                        <Button icon={<FilterOutlined />}>Filter</Button>
                        <Button 
                            type="link" 
                            style={{ marginLeft: 'auto', padding: 0 }}
                            onClick={() => setViewAll(v => !v)}
                        >
                            {viewAll ? 'View Less' : 'View All'}
                        </Button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        {(() => {
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
                                { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => formatDateMDY(d) },
                                { title: 'Title', dataIndex: 'title', key: 'title' },
                                { title: 'Categories', dataIndex: 'categories', key: 'categories' },
                                { title: 'Event', dataIndex: 'eventTitle', key: 'event', render: (t: any, row: any) => t ? t : row.eventId ? `#${row.eventId}` : '-' },
                                {
                                    title: 'Status', dataIndex: 'status', key: 'status',
                                    render: (s: string) => {
                                        const styles: Record<string, React.CSSProperties> = {
                                            approved:    { backgroundColor: 'var(--green-2)', color: 'var(--green-9)' },
                                            denied:      { backgroundColor: 'var(--red-2)', color: 'var(--red-10)' },
                                            'in-draft':  { backgroundColor: 'var(--sea-green-2)', color: 'var(--sea-green-10)' },
                                            'in-review': { backgroundColor: 'var(--gold-2)', color: 'var(--gold-10)' },
                                        };
                                        const style = styles[s] ?? { backgroundColor: '#F0F0F0', color: '#595959' };
                                        return (
                                            <Tag style={{ borderRadius: 20, border: 'none', padding: '4px 0', minWidth: 70, textAlign: 'center', display: 'inline-block', ...style }}>
                                                {s}
                                            </Tag>
                                        );
                                    }
                                },
                                { title: 'Cost', dataIndex: 'cost', key: 'cost', render: (c: number) => c == null ? '-' : `$${Number(c).toFixed(2)}` },
                            ];

                            return (
                                <div style={{ minHeight: 280 }}>
                                    <Table 
                                        columns={columns} 
                                        dataSource={rows} 
                                        loading={purchasesLoading} 
                                        pagination={viewAll ? false : { pageSize: 5 }} 
                                    />
                                </div>
                            );
                        })()}
                    </div>
                </Card>
            </div>
        );
}