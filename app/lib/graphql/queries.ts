import { gql } from '@apollo/client';

// Example query - replace with your actual table structure
export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      eventName
      eventDescription
      eventDate
      setupTime
      startTime
      endTime
    }
  }
`;
export const GET_EVENT_BY_ID = gql`
  query GetEventById($id: ID!) {
    event(id: $id) {
      id
      eventName
      eventDescription
      eventDate
      setupTime
      startTime
      endTime
    }
  }
`;
