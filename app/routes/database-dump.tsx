import { useGetEventsQuery, useGetOrganizationsQuery, useGetUsersQuery, useGetPurchasesQuery } from '~/lib/graphql/generated';
import type { GetDbDumpQuery } from '~/lib/graphql/generated';
import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { apolloClient } from '~/lib/apollo-client';
import { Table, Avatar, Image } from 'antd';
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
type PurchaseRow = any & { key: string };

export default function DatabaseDump() {
  // Request a very large limit so the dump shows all rows; offset stays at 0.
  const BIG_LIMIT = 1000000;
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useGetEventsQuery({ variables: { limit: BIG_LIMIT, offset: 0 }, errorPolicy: 'all' });
  const { data: orgsData, loading: orgsLoading, error: orgsError } = useGetOrganizationsQuery({ variables: { limit: BIG_LIMIT, offset: 0 }, errorPolicy: 'all' });
  const { data: usersData, loading: usersLoading, error: usersError } = useGetUsersQuery({ variables: { limit: BIG_LIMIT, offset: 0 }, errorPolicy: 'all' });
  const { data: purchasesData, loading: purchasesLoading, error: purchasesError } = useGetPurchasesQuery({ variables: { limit: BIG_LIMIT, offset: 0 }, errorPolicy: 'all' });

  // Locations: fetch via apollo client since generated hook may not exist
  const [locationsData, setLocationsData] = useState<any | null>(null);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<any | null>(null);
  // Controlled pagination state for Events table
  const [eventsPage, setEventsPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLocationsLoading(true);
    const LOC_Q = gql`
      query Locations($limit: Int, $offset: Int) {
        locations(limit: $limit, offset: $offset) {
          id
          buildingCode
          buildingDisplayName
          roomTitle
          roomType
          maxCapacity
        }
      }
    `;
    apolloClient.query({ query: LOC_Q, variables: { limit: BIG_LIMIT, offset: 0 } }).then((res) => {
      if (!mounted) return;
      setLocationsData(res.data);
      setLocationsLoading(false);
    }).catch((err) => {
      if (!mounted) return;
      setLocationsError(err);
      setLocationsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

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
            {purchasesError && <div>Purchases: {purchasesError.message}</div>}
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
              { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
              { title: 'Setup Time', dataIndex: 'setupTime', key: 'setupTime' },
              { title: 'Start Time', dataIndex: 'startTime', key: 'startTime' },
              { title: 'End Time', dataIndex: 'endTime', key: 'endTime' },
              { title: 'Location', dataIndex: 'location', key: 'location' },
              { title: 'Location ID', dataIndex: 'locationId', key: 'locationId' },
              { title: 'Location Type', dataIndex: 'locationType', key: 'locationType', render: (lt: any) => lt ?? '-' },
              { title: 'Event Level', dataIndex: 'eventLevel', key: 'eventLevel', render: (lvl: any) => (lvl == null ? '' : String(lvl)) },
              { title: 'Form Data', dataIndex: 'formData', key: 'formData', render: (fd: any) => fd ? JSON.stringify(fd) : '-' },
              { title: 'Status', dataIndex: 'eventStatus', key: 'eventStatus' },
              { title: 'Submitted At', dataIndex: 'submittedAt', key: 'submittedAt' },
              {
                title: 'Organization',
                dataIndex: 'organization',
                key: 'organization',
                render: (org: OrganizationItem | null) => (org ? org.orgName : '-'),
              },
            ];

            const dataSource = eventsData!.events.slice().sort((a: any, b: any) => Number(a.id) - Number(b.id)).map((e) => ({ ...e, key: e.id }));

            return (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: columns.length * 150 }}>
                  <Table columns={columns} dataSource={dataSource} pagination={{ pageSize: 20 }} loading={eventsLoading} />
                </div>
              </div>
            );
          })()
        ) : (
          <p>No events found.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Purchases</h2>
        {purchasesData?.purchases?.length ? (
          (() => {
            const eventMap = new Map<string, string>((eventsData?.events ?? []).map((e: any) => [e.id, e.title]));
            const columns: ColumnsType<PurchaseRow> = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Date', dataIndex: 'dateSubmitted', key: 'dateSubmitted' },
              { title: 'Title', dataIndex: 'itemTitle', key: 'itemTitle' },
              { title: 'Categories', dataIndex: 'itemCategory', key: 'itemCategory' },
              { title: 'Event', dataIndex: 'eventId', key: 'eventId', render: (id: any) => id ? (eventMap.get(id) ?? `#${id}`) : '-' },
              { title: 'Status', dataIndex: 'orderStatus', key: 'orderStatus' },
              { title: 'Cost', dataIndex: 'itemCost', key: 'itemCost', render: (c: any) => (c == null ? '-' : `$${Number(c).toFixed(2)}`) },
              {
                title: 'Organization',
                dataIndex: 'organization',
                key: 'organization',
                render: (org: any) => (org ? org.orgName : '-'),
              },
            ];

            const dataSource = purchasesData!.purchases.slice().sort((a: any, b: any) => Number(a.id) - Number(b.id)).map((p: any) => ({ ...p, key: p.id }));

            return <Table columns={columns} dataSource={dataSource} pagination={{ pageSize: 20 }} loading={purchasesLoading} />;
          })()
        ) : (
          <p>No purchases found.</p>
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

            const dataSource = usersData!.users.slice().sort((a: any, b: any) => Number(a.id) - Number(b.id)).map((u: any) => ({ ...u, key: u.id }));

            return <Table columns={columns} dataSource={dataSource} pagination={{ pageSize: 20 }} loading={usersLoading} />;
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

            const dataSource = orgsData!.organizations.slice().sort((a: any, b: any) => Number(a.id) - Number(b.id)).map((o) => ({ ...o, key: o.id }));

            return <Table columns={columns} dataSource={dataSource} pagination={{ pageSize: 20 }} loading={orgsLoading} />;
          })()
        ) : (
          <p>No organizations found.</p>
        )}
      </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Locations</h2>
          {locationsLoading && <p>Loading locations...</p>}
          {locationsError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">Error loading locations: {String(locationsError.message ?? locationsError)}</div>
          )}
          {locationsData?.locations?.length ? (
            (() => {
              const columns = [
                { title: 'ID', dataIndex: 'id', key: 'id' },
                { title: 'Building Code', dataIndex: 'buildingCode', key: 'buildingCode' },
                { title: 'Building Display', dataIndex: 'buildingDisplayName', key: 'buildingDisplayName' },
                { title: 'Room Title', dataIndex: 'roomTitle', key: 'roomTitle' },
                { title: 'Room Type', dataIndex: 'roomType', key: 'roomType' },
                { title: 'Max Capacity', dataIndex: 'maxCapacity', key: 'maxCapacity' },
              ];
              const dataSource = locationsData!.locations.slice().sort((a: any, b: any) => Number(a.id) - Number(b.id)).map((l: any) => ({ ...l, key: l.id }));
              return <Table columns={columns} dataSource={dataSource} pagination={{ pageSize: 20 }} loading={locationsLoading} />;
            })()
          ) : (
            !locationsLoading && <p>No locations found.</p>
          )}
        </section>
    </div>
  );
}
