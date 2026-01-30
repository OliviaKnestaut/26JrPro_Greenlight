import React from 'react';
import { Collapse, Typography, Badge, Card } from 'antd';
import doc1 from '../../components/assets/docs-img.svg';
import { MoreOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function BrainstormDocsStatic() {
    const docs = [
        { id: '1', title: 'Budget Plan', lastEdited: '01/28/26', img: doc1 },
        { id: '2', title: 'Event Schedule', lastEdited: '01/26/26', img: doc1 },
        { id: '3', title: 'Networking Opportunities', lastEdited: '01/20/26', img: doc1 },
        { id: '4', title: 'Brainstorming Ideas', lastEdited: '01/22/26', img: doc1 },
    ];

     const otherDocs = [
        { id: '5', title: 'Marketing Plan', lastEdited: '01/18/26', img: doc1 },
        { id: '6', title: 'Research Paper', lastEdited: '01/15/26', img: doc1 },
        { id: '7', title: 'Event Flyer', lastEdited: '01/12/26', img: doc1 },
        { id: '8', title: 'Team Notes', lastEdited: '01/10/26', img: doc1 },
        { id: '9', title: 'Client Proposal', lastEdited: '01/08/26', img: doc1 },
        { id: '10', title: 'Strategy Draft', lastEdited: '01/05/26', img: doc1 },
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
                    <Title level={4} style={{ margin: 0 }}>Pinned Docs</Title>
                    <Badge
                    count={docs.length}
                    style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }}
                    />
                </div>
                ),
                children: (
                <div className="flex gap-2 flex-wrap">
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

    

