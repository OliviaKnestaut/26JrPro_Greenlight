import { Typography, Card } from "antd";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { CardMember, CardOrg } from "../../molecules/card";
import { useGetUsersQuery } from "~/lib/graphql/generated";


export function OrgMembersContent() {
    const navigate = useNavigate();

    const { data, loading, error } = useGetUsersQuery({
        variables: { limit: 200, offset: 0 },
        errorPolicy: "all"
    });

    if (loading) return <p>Loading members...</p>;
    if (error) return <p>Failed to load roster</p>;

    return (
        <div className="container mx-auto p-8">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                <Title level={2} style={{ margin: 0 }}>Organization Members</Title>
                <Paragraph>See a list of all current members and their roles.</Paragraph>

                <div >
                    <CardOrg subtitle="DU Women in Business">
                        Drexel Women in Business is a joint student organization. Drexel Women in Business (DWIB) is a network of dynamic, like-minded women achieving their business goals through support, inclusion, inspiration, and mentoring. DWIB maintains a strong network of women in the business community by coordinating networking events, speaker series, workshops, and similar activities. These events are open to the entire Drexel University community in order to foster growth, relationships, and future opportunities. This organization emphasizes LeBow's ties to the alumni network and to the greater Philadelphia business community, and upholds LeBow's commitment to excellence.
                    </CardOrg>
                </div>

                <div>
                    <Card >
                        <Title level={3} >Roster</Title>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))",
                            gap: "0.5rem",
                            marginTop: "1rem",
                        }}>
                            {data?.users.map((u) => {
                                const base = (import.meta as any).env?.BASE_URL ?? "/";
                                const avatar = u.profileImg
                                    ? `${base}uploads/profile_img/${u.profileImg}`.replace(/\\/g, "/")
                                    : undefined;
                                return (
                                    <CardMember
                                        key={u.id}
                                        first={u.firstName ?? ""}
                                        last={u.lastName ?? ""}
                                        username={u.username ?? ""}
                                        role={u.organization?.orgName ?? "Member"}
                                        avatarSrc={avatar}
                                    />
                                );
                            })}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
