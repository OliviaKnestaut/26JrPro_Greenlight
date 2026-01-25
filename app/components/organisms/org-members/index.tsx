import { Typography } from "antd";
const { Title, Link, Paragraph } = Typography;
import { useNavigate } from 'react-router';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { CardOrg } from '../../molecules/card';
import { useAuth } from '~/auth/AuthProvider';


export function OrgMembersContent() {

    const navigate = useNavigate();
    const { user } = useAuth();
    const org = (user as any)?.organization ?? null;
    const orgName = org?.orgName ?? 'Organization';
    const description = org?.bio ?? 'Organization description';
    const orgImg = org?.orgImg;
    
    const base = (import.meta as any).env?.BASE_URL ?? '/';
    const imagePath = orgImg ? `${base}uploads/org_img/${orgImg}`.replace(/\\/g, '/') : undefined;

    return (
        <div className="container m-6 w-auto">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div className="container">
                <Title level={2}>Org Members</Title>
                <Paragraph>
                    See a list of all current members and their roles.
                </Paragraph>
            </div>
            <CardOrg orgName={orgName} description={description} imageSrc={imagePath} />
        </div>
    );
}