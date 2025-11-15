import { gql } from '@apollo/client';

// Mutations for events
export const CREATE_EVENT = gql`
  mutation CreateEvent($eventName: String!, $eventDescription: String, $eventDate: String, $setupTime: String, $startTime: String, $endTime: String) {
    createEvent(eventName: $eventName, eventDescription: $eventDescription, eventDate: $eventDate, setupTime: $setupTime, startTime: $startTime, endTime: $endTime) {
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

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $eventName: String, $eventDescription: String, $eventDate: String, $setupTime: String, $startTime: String, $endTime: String) {
    updateEvent(id: $id, eventName: $eventName, eventDescription: $eventDescription, eventDate: $eventDate, setupTime: $setupTime, startTime: $startTime, endTime: $endTime) {
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

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;
