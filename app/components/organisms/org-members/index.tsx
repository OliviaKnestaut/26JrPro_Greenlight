import { Typography, Card } from "antd";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { CardMember, CardOrg } from "../../molecules/card";
import { useGetUsersQuery } from "~/lib/graphql/generated";
import { useAuth } from '~/auth/AuthProvider';


export function OrgMembersContent() {
    const navigate = useNavigate();

    const { data, loading, error } = useGetUsersQuery({
        variables: { limit: 200, offset: 0 },
        errorPolicy: "all"
    });

    if (loading) return <p>Loading members...</p>;
    if (error) return <p>Failed to load roster</p>;


    const { user } = useAuth();
    const org = (user as any)?.organization ?? null;
    const orgName = org?.orgName ?? 'Organization';
    const description = org?.bio ?? 'Organization description';
    const orgImg = org?.orgImg;
    
    const base = (import.meta as any).env?.BASE_URL ?? '/';
    const imagePath = orgImg ? `${base}uploads/org_img/${orgImg}`.replace(/\\/g, '/') : undefined;

    // Prepare sorted/grouped users: priority roles first, then other specific roles,
    // then general members (alphabetical). Matching is case-insensitive and uses
    // keyword matching to handle small variations.
    const users = data?.users ?? [];
    const normalize = (s: string | null | undefined) => (s || "").toLowerCase().trim();
    const getPriorityIndex = (r?: string | null) => {
        const nr = normalize(r);
        if (!nr) return -1;
        if (nr.includes('president')) return 0;
        if (nr.includes('vice')) return 1;
        if (nr.includes('treasurer')) return 2;
        if (nr.includes('secretary')) return 3;
        if (nr.includes('event coordinator')) return 4;
        if (nr.includes('director')) return 5;
        return -1;
    }
    const isGeneralMember = (r?: string | null) => {
        const nr = normalize(r);
        if (!nr) return true;
        if (nr === 'member' || nr === 'general member' || nr === 'general') return true;
        return nr.includes('member');
    }

    const sortedUsers = [...users].sort((a, b) => {
        const pa = getPriorityIndex(a.role);
        const pb = getPriorityIndex(b.role);
        if (pa !== pb) {
            // priority roles (0..5) come first, then other specific roles (value -1), then general members
            if (pa >= 0 && pb >= 0) return pa - pb;
            if (pa >= 0) return -1;
            if (pb >= 0) return 1;
        }

        const ga = isGeneralMember(a.role) ? 1 : 0;
        const gb = isGeneralMember(b.role) ? 1 : 0;
        if (ga !== gb) return ga - gb; // non-general come before general

        // If both are specific non-priority roles, sort by role name first
        if (!ga && pa === -1 && pb === -1) {
            const roleCmp = normalize(a.role).localeCompare(normalize(b.role));
            if (roleCmp !== 0) return roleCmp;
        }

        // Finally sort alphabetically by last name then first name then username
        const lastA = normalize(a.lastName);
        const lastB = normalize(b.lastName);
        if (lastA !== lastB) return lastA.localeCompare(lastB);
        const firstA = normalize(a.firstName);
        const firstB = normalize(b.firstName);
        if (firstA !== firstB) return firstA.localeCompare(firstB);
        return (a.username || '').localeCompare(b.username || '');
    });

    return (
        <div>
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                <Title level={2} style={{ margin: 0 }}>Organization Members</Title>
                <Paragraph>See a list of all current members and their roles.</Paragraph>

                <div >
                    <CardOrg orgName={orgName} description={description} imageSrc={imagePath} />
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
                            {sortedUsers.map((u) => {
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
                                        role={u.role ?? "Member"}
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
