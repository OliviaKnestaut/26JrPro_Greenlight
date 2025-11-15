import { useQuery } from '@apollo/client/react';
import { GET_EVENTS } from '~/lib/graphql/queries';

interface EventItem {
  id: string;
  eventName: string;
  eventDate?: string;
  setupTime?: string;
  startTime?: string;
  endTime?: string;
  eventDescription?: string;
}

interface EventsData {
  events: EventItem[];
}

export default function GraphQLExample() {
  const { loading, error, data, refetch } = useQuery<EventsData>(GET_EVENTS);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Dump - GraphQL Connection</h1>

      <div>
        <h2 className="text-xl font-semibold mb-4">Events Table</h2>

        {loading && <p>Loading events...</p>}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">Error: {error.message}</div>
        )}

        {data?.events && (
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Event Name</th>
                <th className="border px-3 py-2">Event Date</th>
                <th className="border px-3 py-2">Setup Time</th>
                <th className="border px-3 py-2">Start Time</th>
                <th className="border px-3 py-2">End Time</th>
                <th className="border px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((item) => (
                <tr key={item.id}>
                  <td className="border px-3 py-2">{item.id}</td>
                  <td className="border px-3 py-2">{item.eventName}</td>
                  <td className="border px-3 py-2">{item.eventDate}</td>
                  <td className="border px-3 py-2">{item.setupTime}</td>
                  <td className="border px-3 py-2">{item.startTime}</td>
                  <td className="border px-3 py-2">{item.endTime}</td>
                  <td className="border px-3 py-2">{item.eventDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
