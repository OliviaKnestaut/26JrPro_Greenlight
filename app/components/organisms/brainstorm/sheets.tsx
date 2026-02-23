import { Collapse, Typography, Badge, Card, Grid } from 'antd';
import doc2 from '../../assets/sheets-img.svg';
import { MoreOutlined } from '@ant-design/icons';

const { Title } = Typography;

export function BrainstormSheetsContent() {
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
    const docs = [
        { id: '1', title: 'Budget Tracker', lastEdited: '01/28/26', img: doc2 },
        { id: '2', title: 'Order Tracker', lastEdited: '01/26/26', img: doc2 },
        { id: '3', title: 'Fundraising Opportunities', lastEdited: '12/23/25', img: doc2 },
        { id: '4', title: 'Organization Roster', lastEdited: '09/22/25', img: doc2 },
    ];

    const otherDocs = [
        { id: '5', title: 'Alumn Roster', lastEdited: '01/18/26', img: doc2 },
        { id: '6', title: 'Calendar Plan', lastEdited: '01/15/26', img: doc2 },
        { id: '7', title: 'Formula Doc', lastEdited: '01/12/26', img: doc2 },
        { id: '8', title: 'Organization Points', lastEdited: '01/10/26', img: doc2 },
        { id: '9', title: 'Idea Submission', lastEdited: '01/08/26', img: doc2 },
        { id: '10', title: 'Abscence Excuse', lastEdited: '01/05/26', img: doc2 },
    ];

    return (
        <div className="container w-auto">
        <Collapse
            className="my-4"
            defaultActiveKey={['1']}
            expandIconPosition="end"
            items={[
            {
                key: '1',
                label: (
                <div className="flex items-center gap-2">
                    <Title level={4} style={{ margin: 0 }}>Pinned Sheets</Title>
                    <Badge
                    count={docs.length}
                    style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }}
                    />
                </div>
                ),
                children: (
                <div className="flex gap-5 flex-wrap">
                    {docs.map(doc => (
                    <Card
                        key={doc.id}
                        hoverable
                        style={{ width: 'calc(50% - 0.5rem)', marginBottom: '1rem' }}
                        cover={<img alt={doc.title} src={doc.img} />}
                        className="custom-doc-card"
                    > <div className='card-title-row'>
                        <Title level={5} style={{ marginBottom: 4 }} className='card-title-text'>{doc.title}</Title>
                        <MoreOutlined style={{ fontSize: '20px', cursor: 'pointer', color: 'rgba(0,0,0,0.45)' }} />
                    </div>
                        <p style={{ color: 'gray', margin: 0 }}>LAST EDITED: {doc.lastEdited}</p>
                    </Card>
                    ))}
                </div>
                ),
            }
            ]}
        />
        <div className="container w-auto flex gap-4 flex-wrap docs-more">
        {otherDocs.map(doc => (
            <Card
                key={doc.id}
                hoverable
                style={{ width: 'calc(25% - 0.75rem)', marginBottom: '1rem' }}
                cover={<img alt={doc.title} src={doc.img} />}
                className="custom-doc-card"
            >
                <div className='card-title-row'>
                    <Title level={5} className="card-title-text">{doc.title}</Title>
                    <MoreOutlined style={{ fontSize: '20px', cursor: 'pointer', color: 'rgba(0,0,0,0.45)' }} />
                </div>
                <p style={{ color: 'gray', margin: 0 }}>LAST EDITED: {doc.lastEdited}</p>
            </Card>
        ))}
    </div>
        </div>
        
    );
}

export default BrainstormSheetsContent;