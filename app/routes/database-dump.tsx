import { useGetEventsQuery, useGetOrganizationsQuery, useGetUsersQuery } from '~/lib/graphql/generated';
import type { GetDbDumpQuery } from '~/lib/graphql/generated';
import { useState } from 'react';
import { Table, Avatar, Image, Pagination } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface OrganizationItem {
  id: string;
  orgName: string;
  username?: string;
  bio?: string;
  orgImg?: string;
}

// Table row types include `key` required by antd Table
type EventRow = GetDbDumpQuery['events'][number] & { key: string };
type UserRow = GetDbDumpQuery['users'][number] & { key: string };
type OrgRow = GetDbDumpQuery['organizations'][number] & { key: string };

export default function DatabaseDump() {
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useGetEventsQuery({ variables: { limit: 200, offset: 0 }, errorPolicy: 'all' });
  const { data: orgsData, loading: orgsLoading, error: orgsError } = useGetOrganizationsQuery({ variables: { limit: 200, offset: 0 }, errorPolicy: 'all' });
  const { data: usersData, loading: usersLoading, error: usersError } = useGetUsersQuery({ variables: { limit: 200, offset: 0 }, errorPolicy: 'all' });
  const [eventsPage, setEventsPage] = useState<number>(1);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Dump - GraphQL</h1>

      {(eventsLoading || orgsLoading || usersLoading) && <p>Loading data...</p>}
      {(eventsError || orgsError || usersError) && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <strong>Error:</strong>
          <div>
            {eventsError && <div>Events: {eventsError.message}</div>}
            {orgsError && <div>Organizations: {orgsError.message}</div>}
            {usersError && <div>Users: {usersError.message}</div>}
          </div>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Events</h2>
        {eventsData?.events?.length ? (
          (() => {
            const columns: ColumnsType<EventRow> = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Event Image', dataIndex: 'eventImg', key: 'eventImg',
                render: (src: string | undefined) => {
                  if (!src) return <Avatar shape="square" size={60} icon={<UserOutlined style={{ fontSize: 30 }} />} />;
                  const base = (import.meta as any).env?.BASE_URL ?? '/';
                  const profilePath = `${base}uploads/event_img/${src}`.replace(/\\/g, '/');
                  return <Image src={profilePath} style={{height: 50}}/>
                },
              },
              { title: 'Title', dataIndex: 'title', key: 'title' },
              { title: 'Description', dataIndex: 'description', key: 'description' },
              { title: 'Date', dataIndex: 'eventDate', key: 'eventDate' },
              { title: 'Start', dataIndex: 'startTime', key: 'startTime' },
              { title: 'End', dataIndex: 'endTime', key: 'endTime' },
              { title: 'Location', dataIndex: 'location', key: 'location' },
              { title: 'Status', dataIndex: 'eventStatus', key: 'eventStatus' },
              { title: 'Submitted At', dataIndex: 'submittedAt', key: 'submittedAt' },
              {
                title: 'Organization',
                dataIndex: 'organization',
                key: 'organization',
                render: (org: OrganizationItem | null) => (org ? org.orgName : '-'),
              },
            ];

            const dataSource = eventsData!.events.map((e) => ({ ...e, key: e.id }));
            const eventsPageSize = 12;
            const eventsTotal = dataSource.length;
            const pagedData = dataSource.slice((eventsPage - 1) * eventsPageSize, eventsPage * eventsPageSize);

            return (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: columns.length * 150 }}>
                    <Table columns={columns} dataSource={pagedData} pagination={false} loading={eventsLoading} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                  <Pagination current={eventsPage} pageSize={eventsPageSize} total={eventsTotal} onChange={(p) => setEventsPage(p)} />
                </div>
              </>
            );
          })()
        ) : (
          <p>No events found.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        {usersData?.users?.length ? (
          (() => {
            const columns: ColumnsType<UserRow> = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              {
                title: 'Profile',
                dataIndex: 'profileImg',
                key: 'profileImg',
                render: (src: string | undefined) => {
                  if (!src) return <Avatar size={60} icon={<UserOutlined style={{ fontSize: 30 }} />} />;
                  const base = (import.meta as any).env?.BASE_URL ?? '/';
                  const profilePath = `${base}uploads/profile_img/${src}`.replace(/\\/g, '/');
                  return <Avatar size={60} src={profilePath} />;
                },
              },
              { title: 'First', dataIndex: 'firstName', key: 'firstName' },
              { title: 'Last', dataIndex: 'lastName', key: 'lastName' },
              { title: 'Username', dataIndex: 'username', key: 'username' },
              { title: 'Password', dataIndex: 'password', key: 'password' },
              {
                title: 'Organization',
                dataIndex: ['organization', 'orgName'],
                key: 'organization',
                render: (_: any, record: any) => (record.organization ? record.organization.orgName : '-'),
              },
            ];

            const dataSource = usersData!.users.map((u: any) => ({ ...u, key: u.id }));

            return <Table columns={columns} dataSource={dataSource} pagination={{ pageSize: 12 }} loading={usersLoading} />;
          })()
        ) : (
          <p>No users found.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Organizations</h2>
        {orgsData?.organizations?.length ? (
          (() => {
            const columns: ColumnsType<OrgRow> = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Org Image', dataIndex: 'orgImg', key: 'orgImg',
                render: (src: string | undefined) => {
                  if (!src) return <Avatar shape="square" size={60} icon={<UserOutlined style={{ fontSize: 30 }} />} />;
                  const base = (import.meta as any).env?.BASE_URL ?? '/';
                  const profilePath = `${base}uploads/org_img/${src}`.replace(/\\/g, '/');
                  return <Image src={profilePath}/>
                },
              },
              { title: 'Org Name', dataIndex: 'orgName', key: 'orgName' },
              { title: 'Username', dataIndex: 'username', key: 'username' },
              { title: 'Bio', dataIndex: 'bio', key: 'bio' },
            ];

            const dataSource = orgsData!.organizations.map((o) => ({ ...o, key: o.id }));

            return <Table columns={columns} dataSource={dataSource} pagination={{ pageSize: 12 }} loading={orgsLoading} />;
          })()
        ) : (
          <p>No organizations found.</p>
        )}
      </section>
    </div>
  );
}
