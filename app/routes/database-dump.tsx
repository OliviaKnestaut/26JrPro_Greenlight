import { useGetDbDumpQuery } from '~/lib/graphql/generated';
import type { GetDbDumpQuery } from '~/lib/graphql/generated';
import type { GetDbDumpQueryVariables } from '~/lib/graphql/generated';

interface OrganizationItem {
  id: string;
  orgName: string;
  username?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EventItem {
  id: string;
  title?: string;
  description?: string;
  eventDate?: string;
  setupTime?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  eventStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  organization?: OrganizationItem | null;
}

interface DbDumpData {
  events: EventItem[];
  organizations: OrganizationItem[];
}

export default function DatabaseDump() {
  const { loading, error, data, refetch } = useGetDbDumpQuery({ variables: { limit: 200, offset: 0 } });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Dump - GraphQL</h1>

      {loading && <p>Loading data...</p>}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">Error: {error.message}</div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Events</h2>
        {data?.events?.length ? (
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Title</th>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Start</th>
                <th className="border px-3 py-2">End</th>
                <th className="border px-3 py-2">Location</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Organization</th>
              </tr>
            </thead>
            <tbody>
              {data!.events.map((e: GetDbDumpQuery['events'][number]) => (
                <tr key={e.id}>
                  <td className="border px-3 py-2">{e.id}</td>
                  <td className="border px-3 py-2">{e.title}</td>
                  <td className="border px-3 py-2">{e.eventDate}</td>
                  <td className="border px-3 py-2">{e.startTime}</td>
                  <td className="border px-3 py-2">{e.endTime}</td>
                  <td className="border px-3 py-2">{e.location}</td>
                  <td className="border px-3 py-2">{e.eventStatus}</td>
                  <td className="border px-3 py-2">{e.organization ? e.organization.orgName : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No events found.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Organizations</h2>
        {data?.organizations?.length ? (
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Org Name</th>
                <th className="border px-3 py-2">Username</th>
                <th className="border px-3 py-2">Bio</th>
              </tr>
            </thead>
            <tbody>
              {data!.organizations.map((o: GetDbDumpQuery['organizations'][number]) => (
                <tr key={o.id}>
                  <td className="border px-3 py-2">{o.id}</td>
                  <td className="border px-3 py-2">{o.orgName}</td>
                  <td className="border px-3 py-2">{o.username}</td>
                  <td className="border px-3 py-2">{o.bio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No organizations found.</p>
        )}
      </section>
    </div>
  );
}
