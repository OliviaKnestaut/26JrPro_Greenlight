import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Avatar,
    Badge,
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    DatePicker,
    Divider,
    Form,
    Input,
    List,
    Pagination,
    Popover,
    Progress,
    Radio,
    Select,
    Slider,
    Space,
    Switch,
    Table,
    Tabs,
    Tag,
    TimePicker,
    Tooltip,
    Typography,
} from 'antd';

import NavMini from '../components/molecules/nav-mini';
import ProgressCircle from '../components/molecules/progress-circle';
import {
    CardWelcome,
    CardAnnouncements,
    CardEvent,
    CardCalendarUpcoming,
    TrainingResource,
    CardOrg,
    CardMember,
} from '../components/molecules/card';
import StyledCalendar from '../components/molecules/calendar';
import SuccessModal from '../components/molecules/event-flow/success-modal';
import { serverToUi } from '~/lib/eventStatusMap';
import { formatDateMDY } from '~/lib/formatters';
import CommentInput from '../components/molecules/comment-input';

import DiscardModal from '~/components/molecules/event-flow/discard-modal';
import ProgressTimeline from '~/components/molecules/event-flow/progress-timeline';

export default function AntdExample() {
    const { Title, Paragraph, Text, Link } = Typography;

    // Minimal state for a few interactive components
    const [switchOn, setSwitchOn] = useState(true);
    const [sliderValue, setSliderValue] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);
    const [discardModalOpen, setDiscardModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const today = new Date();
    today.setHours(0,0,0,0);

    const tableColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Age', dataIndex: 'age', key: 'age' },
        { title: 'Address', dataIndex: 'address', key: 'address' },
    ];
    const tableData = [
        { key: '1', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park' },
        { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park' },
        { key: '3', name: 'Joe Black', age: 28, address: 'Sydney No. 1 Lake Park' },
    ];
    const demoTimelineValues = {
        eventName: 'Event',
        date: '2026-02-08',
        location: 'Main Hall',
        eventElements: [],
        budget: null,
        reviewed: false,
    };
    const getDemoTimelineValues = () => demoTimelineValues;

    return (
        <div style={{ padding: 16 }}>
            <Title level={2}>Ant Design Example Showcase</Title>

            <Divider orientation="left">Native Typography</Divider>
            <div style={{ display: 'grid', gap: 8 }}>
                <h1>H1 Heading</h1>
                <h2>H2 Heading</h2>
                <h3>H3 Heading</h3>
                <h4>H4 Heading</h4>
                <h5>H5 Heading</h5>
                <h6>H6 Heading</h6>
                <p>
                    This is a paragraph tag intended for base body copy. It includes
                    <strong> bold</strong>,<em> italic</em>, and an inline <code>code</code> sample.
                </p>
                <p>
                    Here is a native <a href="#">anchor link</a> for styling.
                </p>
            </div>

            <Divider orientation="left">Ant Typography</Divider>
            <div style={{ display: 'grid', gap: 8 }}>
                <Title>Title 1</Title>
                <Title level={2}>Title 2</Title>
                <Title level={3}>Title 3</Title>
                <Title level={4}>Title 4</Title>
                <Paragraph>
                    Ant Paragraph with <Text strong>strong</Text>, <Text mark>mark</Text>, and
                    <Text code> code</Text>.
                </Paragraph>
                <Paragraph>
                    An Ant <Link href="#">Typography.Link</Link> example.
                </Paragraph>
            </div>

            <Divider orientation="left">Buttons</Divider>
            <Space wrap>
                <Button type="primary">Primary</Button>
                <Button>Default</Button>
                <Button type="dashed">Dashed</Button>
                <Button type="text">Text</Button>
                <Button type="link">Link</Button>
                <Button type="primary" disabled>
                    Disabled
                </Button>
                <Button loading>Loading</Button>
                <Tooltip title="Tooltip text">
                    <Button>With Tooltip</Button>
                </Tooltip>
                <Popover content={<div>Popover content</div>} title="Title">
                    <Button>With Popover</Button>
                </Popover>
            </Space>

            <Divider orientation="left">Form Elements</Divider>
            <Form layout="vertical" style={{ maxWidth: 640 }}>
                <Form.Item label="Input">
                    <Input placeholder="Basic input" />
                </Form.Item>
                <Form.Item label="Password">
                    <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item label="Text Area">
                    <Input.TextArea rows={3} placeholder="Multiline text" />
                </Form.Item>
                <Form.Item label="Search">
                    <Input.Search placeholder="Search..." />
                </Form.Item>
                <Form.Item label="Select">
                    <Select
                        defaultValue="one"
                        options={[
                            { value: 'one', label: 'One' },
                            { value: 'two', label: 'Two' },
                            { value: 'three', label: 'Three' },
                        ]}
                        style={{ width: 200 }}
                    />
                </Form.Item>
                <Form.Item label="Radio Group">
                    <Radio.Group defaultValue="a">
                        <Radio value="a">Option A</Radio>
                        <Radio value="b">Option B</Radio>
                        <Radio value="c">Option C</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="Checkboxes">
                    <Checkbox.Group
                        options={['Apple', 'Pear', 'Orange']}
                        defaultValue={['Apple']}
                    />
                </Form.Item>
                <Form.Item label="Switch">
                    <Switch checked={switchOn} onChange={setSwitchOn} />
                </Form.Item>
                <Form.Item label="Slider">
                    <Slider value={sliderValue} onChange={setSliderValue} style={{ width: 200 }} />
                </Form.Item>
                <Form.Item label="Date / Time">
                    <Space wrap>
                        <DatePicker />
                        <TimePicker />
                    </Space>
                </Form.Item>
            </Form>

            <Divider orientation="left">Navigation</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Breadcrumb
                    items={[
                        { title: 'Home' },
                        { title: <a href="#">Library</a> },
                        { title: 'Data' },
                    ]}
                />
                <Tabs
                    items={[
                        { key: '1', label: 'Tab 1', children: <div>Tab 1 content</div> },
                        { key: '2', label: 'Tab 2', children: <div>Tab 2 content</div> },
                        { key: '3', label: 'Tab 3', children: <div>Tab 3 content</div> },
                    ]}
                />
                <Pagination current={currentPage} onChange={setCurrentPage} total={50} />
            </Space>

            <Divider orientation="left">Data Display</Divider>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Space wrap>
                    <Tag>Default</Tag>
                    <Tag color="processing">Processing</Tag>
                    <Tag color="success">Success</Tag>
                    <Tag color="warning">Warning</Tag>
                    <Tag color="error">Error</Tag>
                    <Badge count={5}>
                        <Avatar shape="square">A</Avatar>
                    </Badge>
                    <Avatar style={{ backgroundColor: '#87d068' }} icon={undefined}>U</Avatar>
                </Space>

                <Alert message="Success Text" type="success" showIcon />
                <Alert message="Info Text" type="info" showIcon />
                <Alert message="Warning Text" type="warning" showIcon />
                <Alert message="Error Text" type="error" showIcon />

                <Progress percent={45} />

                <Card title="Card Title">
                    <p>Card content line 1</p>
                    <p>Card content line 2</p>
                </Card>

                <Table
                    size="small"
                    columns={tableColumns}
                    dataSource={tableData}
                    pagination={false}
                />

                <List
                    header={<div>List Header</div>}
                    bordered
                    dataSource={[
                        'List item one',
                        'List item two with a longer description',
                        'List item three',
                    ]}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                />
                <Divider orientation="left">Molecules</Divider>
                <div  className='flex flex-wrap gap-4 flex-col'>
                    <CardWelcome title="Welcome back, Serati" subtitle="Ready to plan your next event?" />
                    <CardAnnouncements
                        title="Announcements"
                        items={[
                            { 
                                id: 'a1', 
                                title: '“Coffee Chat With Women in Tech” has 1 new comment; update submission' 
                            },
                            { 
                                id: 'a2', 
                                title: 'John Doe has submitted “Public Speaking Workshop” for review', 
                            }
                        ]}
                    />
                    <CardEvent
                        key={"1"}
                        style={{ flex: '0 0 calc((100% - 2rem) / 3)', maxWidth: 'calc((100% - 2rem) / 3)', boxSizing: 'border-box' }}
                        title={"Women in Leadership Panel"}
                        date={formatDateMDY("2025-2-14")}
                        isPast={new Date("2025-2-14").getTime() < today.getTime()}
                        location={"URBN Annex Screening Room"}
                        submissionDate={formatDateMDY("2025-11-30")}
                        startTime={"19:00"}
                        description={"A panel discussion featuring women leaders sharing their experiences and insights on leadership."}
                        status={"in-review"}
                        className='h-auto'
                    />
                    <CardEvent className="visual-card"
                        key={"1"}
                        style={{ flex: '0 0 calc((100% - 2rem) / 3)', maxWidth: 'calc((100% - 2rem) / 3)', boxSizing: 'border-box' }}
                        title={"Public Speaking Workshop"}
                        date={formatDateMDY("2025-12-30")}
                        isPast={new Date("2025-12-30").getTime() < today.getTime()}
                        location={"Lebow 111"}
                        startTime={"16:00"}
                        description={"A workshop teaching students how to speak convincingly during presentations, pitches, and interviews."}
                        status={"in-review"}
                    />

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

                        
                        <CardCalendarUpcoming
                            title="Upcoming"
                            events={[{ id: 'e1', title: 'Release', date: 'Jan 25' }]}
                        />
                        <TrainingResource title="Resources" tags={["Guide", "API"]}>
                            <p>Resource content</p>
                        </TrainingResource>

                        <CardOrg
                        orgName="DU Women in Business"
                        description="Organization descriptionDrexel Women in Business is a joint student organization. Drexel Women in Business (DWIB) is a network of dynamic, like-minded women achieving their business goals through support, inclusion, inspiration, and mentoring. DWIB maintains a strong network of women in the business community by coordinating networking events, speaker series, workshops, and similar activities. These events are open to the entire Drexel University community in order to foster growth, relationships, and future opportunities. This organization emphasizes LeBow's ties to the alumni network and to the greater Philadelphia business community, and upholds LeBow's commitment to excellence."
                        imageSrc="./uploads/org_img/drexel-wib-logo.png" />
                        
                        <CardMember
                            title="Member"
                            avatarSrc="https://via.placeholder.com/40"
                            role="Admin"
                            first="Member"
                            last="Example"
                            username="member.example"
                        >
                            <p>Member bio</p>
                        </CardMember>
                        <CommentInput />
                    </div>

                    <NavMini />

                    <div>
                        <ProgressCircle total={10000} spent={2500} />
                    </div>
                    <div>
                        <StyledCalendar/>
                    </div>

                    <div>
                        <ProgressTimeline getValues={getDemoTimelineValues} />
                    </div>

                    <Space wrap>
                        <Button onClick={() => setDiscardModalOpen(true)}>
                            Open Discard Modal
                        </Button>
                        <Button type="primary" onClick={() => setSuccessModalOpen(true)}>
                            Open Success Modal
                        </Button>
                    </Space>

                    <DiscardModal
                        open={discardModalOpen}
                        onDiscardClick={() => setDiscardModalOpen(false)}
                        onCancelClick={() => setDiscardModalOpen(false)}
                    />
                    <SuccessModal
                        open={successModalOpen}
                        onDashboardClick={() => setSuccessModalOpen(false)}
                        onEventOverviewClick={() => setSuccessModalOpen(false)}
                    />
                </div>
            </Space>
        </div>
    );
}
