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
    CardResource,
    CardOrg,
    CardMember,
} from '../components/molecules/card';
import StyledCalendar from '../components/molecules/calendar';
import SuccessModal from '../components/molecules/event-flow/success-modal';

export default function AntdExample() {
    const { Title, Paragraph, Text, Link } = Typography;

    // Minimal state for a few interactive components
    const [switchOn, setSwitchOn] = useState(true);
    const [sliderValue, setSliderValue] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);

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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
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

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <CardEvent
                            title="Coffee Chat With Women in Tech"
                            date="01/09/2026"
                            location="Bossone"
                            startTime="10:30 AM"
                            description="An informal networking event connecting WIB members with female professionals working in UX."
                            submissionDate="11/18/2025"
                        />
                        
                        <CardCalendarUpcoming
                            title="Upcoming"
                            events={[{ id: 'e1', title: 'Release', date: 'Jan 25' }]}
                        />
                        <CardResource title="Resources" tags={["Guide", "API"]}>
                            <p>Resource content</p>
                        </CardResource>
                        <CardOrg title="Organization" avatarSrc="https://via.placeholder.com/40" subtitle="Nonprofit">
                            <p>Org details</p>
                        </CardOrg>
                        <CardMember title="Member" avatarSrc="https://via.placeholder.com/40" role="Admin">
                            <p>Member bio</p>
                        </CardMember>
                    </div>

                    <NavMini />

                    <div>
                        <ProgressCircle total={10000} spent={2500} />
                    </div>
                    <div>
                        <StyledCalendar/>
                    </div>
                </div>
            </Space>
        </div>
    );
}
