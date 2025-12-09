import { gql } from '@apollo/client';

// Organization mutations
export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      orgName
      username
      bio
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      orgName
      username
      bio
      updatedAt
    }
  }
`;

export const DELETE_ORGANIZATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;

// Event mutations
export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
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
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      description
      eventDate
      setupTime
      startTime
      endTime
      location
      eventStatus
      updatedAt
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const CHANGE_EVENT_STATUS = gql`
  mutation ChangeEventStatus($id: ID!, $status: EventStatus!) {
    changeEventStatus(id: $id, status: $status) {
      id
      eventStatus
    }
  }
`;
