import { gql } from '@apollo/client';

// Fetch events and organizations according to schema.graphql
export const GET_EVENTS = gql`
  query GetEvents($limit: Int = 25, $offset: Int = 0, $status: EventStatus, $fromDate: Date, $toDate: Date) {
    events(limit: $limit, offset: $offset, status: $status, fromDate: $fromDate, toDate: $toDate) {
      id
      organizationId
      title
      description
      eventDate
      setupTime
      startTime
      endTime
      location
      eventStatus
      createdAt
      updatedAt
      organization {
        id
        orgName
        username
        bio
      }
    }
  }
`;

export const GET_EVENT_BY_ID = gql`
  query GetEventById($id: ID!) {
    event(id: $id) {
      id
      organizationId
      title
      description
      eventDate
      setupTime
      startTime
      endTime
      location
      eventStatus
      createdAt
      updatedAt
      organization { id orgName username }
    }
  }
`;

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations($limit: Int = 25, $offset: Int = 0, $username: String) {
    organizations(limit: $limit, offset: $offset, username: $username) {
      id
      orgName
      username
      bio
      createdAt
      updatedAt
    }
  }
`;

export const GET_EVENTS_BY_ORGANIZATION = gql`
  query EventsByOrganization($orgId: ID!, $limit: Int = 25, $offset: Int = 0, $status: EventStatus, $fromDate: Date, $toDate: Date) {
    eventsByOrganization(orgId: $orgId, limit: $limit, offset: $offset, status: $status, fromDate: $fromDate, toDate: $toDate) {
      id
      title
      eventDate
      startTime
      endTime
      eventStatus
    }
  }
`;

// Convenience combined query used by the Database Dump UI
export const GET_DB_DUMP = gql`
  query GetDbDump($limit: Int = 25, $offset: Int = 0) {
    events(limit: $limit, offset: $offset) {
      id
      organizationId
      title
      description
      eventDate
      setupTime
      startTime
      endTime
      location
      eventStatus
      createdAt
      updatedAt
      organization { id orgName username bio }
    }
    organizations(limit: $limit, offset: $offset) {
      id
      orgName
      username
      bio
      createdAt
      updatedAt
    }
  }
`;
