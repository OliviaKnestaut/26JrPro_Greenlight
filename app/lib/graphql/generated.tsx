/* -------------------------------------------------------------------------- */
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT BY HAND.                            */
/* To update, run: `npx graphql-codegen --config codegen.yml`                   */
/* The header below disables TypeScript and ESLint checks for this generated file. */
/* -------------------------------------------------------------------------- */
/* eslint-disable */
// @ts-nocheck
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export type CreateEventInput = {
  createdBy?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['Time']['input']>;
  eventDate?: InputMaybe<Scalars['Date']['input']>;
  eventImg?: InputMaybe<Scalars['String']['input']>;
  eventLevel?: InputMaybe<Scalars['Int']['input']>;
  eventStatus?: InputMaybe<Scalars['String']['input']>;
  formData?: InputMaybe<Scalars['JSON']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  locationId?: InputMaybe<Scalars['Int']['input']>;
  locationType?: InputMaybe<LocationType>;
  organizationUsername: Scalars['String']['input'];
  setupTime?: InputMaybe<Scalars['Time']['input']>;
  startTime?: InputMaybe<Scalars['Time']['input']>;
  title: Scalars['String']['input'];
};

export type CreateOrganizationInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  orgImg?: InputMaybe<Scalars['String']['input']>;
  orgName: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type CreatePurchaseInput = {
  dateSubmitted: Scalars['DateTime']['input'];
  eventId: Scalars['ID']['input'];
  itemCategory: Scalars['String']['input'];
  itemCost: Scalars['Float']['input'];
  itemTitle: Scalars['String']['input'];
  orderStatus: Scalars['String']['input'];
  organizationUsername: Scalars['String']['input'];
};

export type CreateUserInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  organizationUsername: Scalars['String']['input'];
  password: Scalars['String']['input'];
  profileImg?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
};

export type Event = {
  __typename?: 'Event';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endTime?: Maybe<Scalars['Time']['output']>;
  eventDate?: Maybe<Scalars['Date']['output']>;
  eventImg?: Maybe<Scalars['String']['output']>;
  eventLevel?: Maybe<Scalars['Int']['output']>;
  eventStatus?: Maybe<EventStatus>;
  formData?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  locationId?: Maybe<Scalars['Int']['output']>;
  locationType?: Maybe<LocationType>;
  organization?: Maybe<Organization>;
  organizationUsername: Scalars['String']['output'];
  setupTime?: Maybe<Scalars['Time']['output']>;
  startTime?: Maybe<Scalars['Time']['output']>;
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum EventStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Draft = 'DRAFT',
  Rejected = 'REJECTED',
  Review = 'REVIEW'
}

export type Location = {
  __typename?: 'Location';
  buildingCode?: Maybe<Scalars['String']['output']>;
  buildingDisplayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maxCapacity?: Maybe<Scalars['String']['output']>;
  roomTitle?: Maybe<Scalars['String']['output']>;
  roomType?: Maybe<Scalars['String']['output']>;
};

export enum LocationType {
  OffCampus = 'OFF_CAMPUS',
  OnCampus = 'ON_CAMPUS',
  Virtual = 'VIRTUAL'
}

export type Mutation = {
  __typename?: 'Mutation';
  changeEventStatus: Event;
  createEvent: Event;
  createOrganization: Organization;
  createPurchase: Purchase;
  createUser: User;
  deleteEvent: Scalars['Boolean']['output'];
  deleteOrganization: Scalars['Boolean']['output'];
  deletePurchase: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  updateEvent: Event;
  updateOrganization: Organization;
  updatePurchase: Purchase;
  updateUser: User;
};


export type MutationChangeEventStatusArgs = {
  id: Scalars['ID']['input'];
  status: EventStatus;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
};


export type MutationCreatePurchaseArgs = {
  input: CreatePurchaseInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePurchaseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEventInput;
};


export type MutationUpdateOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateOrganizationInput;
};


export type MutationUpdatePurchaseArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePurchaseInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type Organization = {
  __typename?: 'Organization';
  bio?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  events: Array<Event>;
  id: Scalars['ID']['output'];
  orgImg?: Maybe<Scalars['String']['output']>;
  orgName: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};


export type OrganizationEventsArgs = {
  fromDate?: InputMaybe<Scalars['Date']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<EventStatus>;
  toDate?: InputMaybe<Scalars['Date']['input']>;
};

export type Purchase = {
  __typename?: 'Purchase';
  dateSubmitted: Scalars['DateTime']['output'];
  eventId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  itemCategory: Scalars['String']['output'];
  itemCost: Scalars['Float']['output'];
  itemTitle: Scalars['String']['output'];
  orderStatus: Scalars['String']['output'];
  organization?: Maybe<Organization>;
  organizationUsername: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  event?: Maybe<Event>;
  events: Array<Event>;
  eventsByOrganization: Array<Event>;
  location?: Maybe<Location>;
  locations: Array<Location>;
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  purchase?: Maybe<Purchase>;
  purchases: Array<Purchase>;
  purchasesByOrganization: Array<Purchase>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsArgs = {
  fromDate?: InputMaybe<Scalars['Date']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<EventStatus>;
  toDate?: InputMaybe<Scalars['Date']['input']>;
};


export type QueryEventsByOrganizationArgs = {
  fromDate?: InputMaybe<Scalars['Date']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orgUsername: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['Date']['input']>;
};


export type QueryLocationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLocationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPurchaseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPurchasesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPurchasesByOrganizationArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orgUsername: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEventInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['Time']['input']>;
  eventDate?: InputMaybe<Scalars['Date']['input']>;
  eventImg?: InputMaybe<Scalars['String']['input']>;
  eventLevel?: InputMaybe<Scalars['Int']['input']>;
  eventStatus?: InputMaybe<Scalars['String']['input']>;
  formData?: InputMaybe<Scalars['JSON']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  locationId?: InputMaybe<Scalars['Int']['input']>;
  locationType?: InputMaybe<LocationType>;
  setupTime?: InputMaybe<Scalars['Time']['input']>;
  startTime?: InputMaybe<Scalars['Time']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  orgImg?: InputMaybe<Scalars['String']['input']>;
  orgName?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePurchaseInput = {
  eventId?: InputMaybe<Scalars['ID']['input']>;
  itemCategory?: InputMaybe<Scalars['String']['input']>;
  itemCost?: InputMaybe<Scalars['Float']['input']>;
  itemTitle?: InputMaybe<Scalars['String']['input']>;
  orderStatus?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  organizationUsername?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  profileImg?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  organization?: Maybe<Organization>;
  organizationUsername?: Maybe<Scalars['String']['output']>;
  password: Scalars['String']['output'];
  profileImg?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Event', id: string, title: string, eventDate?: any | null, eventStatus?: EventStatus | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string } | null } };

export type UpdateEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateEventInput;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent: { __typename?: 'Event', id: string, title: string, eventDate?: any | null, eventStatus?: EventStatus | null } };

export type DeleteEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteEventMutation = { __typename?: 'Mutation', deleteEvent: boolean };

export type ChangeEventStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: EventStatus;
}>;


export type ChangeEventStatusMutation = { __typename?: 'Mutation', changeEventStatus: { __typename?: 'Event', id: string, eventStatus?: EventStatus | null } };

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganizationInput;
}>;


export type CreateOrganizationMutation = { __typename?: 'Mutation', createOrganization: { __typename?: 'Organization', id: string, orgName: string, username: string } };

export type UpdateOrganizationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateOrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization: { __typename?: 'Organization', id: string, orgName: string, username: string } };

export type DeleteOrganizationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteOrganizationMutation = { __typename?: 'Mutation', deleteOrganization: boolean };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, profileImg?: string | null, username: string, createdAt?: any | null, updatedAt?: any | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string } | null } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, profileImg?: string | null, username: string, createdAt?: any | null, updatedAt?: any | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string } | null } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: boolean };

export type CreatePurchaseMutationVariables = Exact<{
  input: CreatePurchaseInput;
}>;


export type CreatePurchaseMutation = { __typename?: 'Mutation', createPurchase: { __typename?: 'Purchase', id: string, organizationUsername: string, dateSubmitted: any, itemTitle: string, itemCategory: string, eventId: string, orderStatus: string, itemCost: number, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string } | null } };

export type UpdatePurchaseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdatePurchaseInput;
}>;


export type UpdatePurchaseMutation = { __typename?: 'Mutation', updatePurchase: { __typename?: 'Purchase', id: string, organizationUsername: string, dateSubmitted: any, itemTitle: string, itemCategory: string, eventId: string, orderStatus: string, itemCost: number } };

export type DeletePurchaseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeletePurchaseMutation = { __typename?: 'Mutation', deletePurchase: boolean };

export type GetEventsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<EventStatus>;
  fromDate?: InputMaybe<Scalars['Date']['input']>;
  toDate?: InputMaybe<Scalars['Date']['input']>;
}>;


export type GetEventsQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', id: string, organizationUsername: string, title: string, description?: string | null, eventImg?: string | null, locationType?: LocationType | null, locationId?: number | null, createdBy?: string | null, eventLevel?: number | null, formData?: any | null, eventDate?: any | null, setupTime?: any | null, startTime?: any | null, endTime?: any | null, location?: string | null, eventStatus?: EventStatus | null, submittedAt?: any | null, createdAt?: any | null, updatedAt?: any | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string, bio?: string | null } | null }> };

export type GetEventByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEventByIdQuery = { __typename?: 'Query', event?: { __typename?: 'Event', id: string, organizationUsername: string, title: string, description?: string | null, eventImg?: string | null, locationType?: LocationType | null, locationId?: number | null, createdBy?: string | null, eventLevel?: number | null, formData?: any | null, eventDate?: any | null, setupTime?: any | null, startTime?: any | null, endTime?: any | null, location?: string | null, eventStatus?: EventStatus | null, submittedAt?: any | null, createdAt?: any | null, updatedAt?: any | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string, bio?: string | null } | null } | null };

export type GetOrganizationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrganizationsQuery = { __typename?: 'Query', organizations: Array<{ __typename?: 'Organization', id: string, orgName: string, username: string, bio?: string | null, orgImg?: string | null, createdAt?: any | null, updatedAt?: any | null }> };

export type EventsByOrganizationQueryVariables = Exact<{
  orgUsername: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  fromDate?: InputMaybe<Scalars['Date']['input']>;
  toDate?: InputMaybe<Scalars['Date']['input']>;
}>;


export type EventsByOrganizationQuery = { __typename?: 'Query', eventsByOrganization: Array<{ __typename?: 'Event', id: string, organizationUsername: string, title: string, description?: string | null, eventImg?: string | null, locationType?: LocationType | null, locationId?: number | null, createdBy?: string | null, eventLevel?: number | null, formData?: any | null, eventDate?: any | null, setupTime?: any | null, startTime?: any | null, endTime?: any | null, location?: string | null, eventStatus?: EventStatus | null, submittedAt?: any | null, createdAt?: any | null, updatedAt?: any | null }> };

export type GetDbDumpQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetDbDumpQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', id: string, organizationUsername: string, title: string, description?: string | null, eventImg?: string | null, locationType?: LocationType | null, locationId?: number | null, eventDate?: any | null, setupTime?: any | null, startTime?: any | null, endTime?: any | null, location?: string | null, eventStatus?: EventStatus | null, submittedAt?: any | null, createdAt?: any | null, updatedAt?: any | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string, bio?: string | null } | null }>, organizations: Array<{ __typename?: 'Organization', id: string, orgName: string, username: string, bio?: string | null, orgImg?: string | null, createdAt?: any | null, updatedAt?: any | null }>, users: Array<{ __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, username: string, profileImg?: string | null, password: string, createdAt?: any | null, updatedAt?: any | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string, bio?: string | null, orgImg?: string | null } | null }> };

export type GetUsersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, username: string, profileImg?: string | null, password: string, role?: string | null, createdAt?: any | null, updatedAt?: any | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string, bio?: string | null, orgImg?: string | null } | null }> };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, username: string, profileImg?: string | null, password: string, role?: string | null, createdAt?: any | null, updatedAt?: any | null, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string, bio?: string | null, orgImg?: string | null } | null } | null };

export type GetPurchasesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPurchasesQuery = { __typename?: 'Query', purchases: Array<{ __typename?: 'Purchase', id: string, organizationUsername: string, dateSubmitted: any, itemTitle: string, itemCategory: string, eventId: string, orderStatus: string, itemCost: number, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string } | null }> };

export type GetPurchaseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPurchaseQuery = { __typename?: 'Query', purchase?: { __typename?: 'Purchase', id: string, organizationUsername: string, dateSubmitted: any, itemTitle: string, itemCategory: string, eventId: string, orderStatus: string, itemCost: number, organization?: { __typename?: 'Organization', id: string, orgName: string, username: string } | null } | null };

export type PurchasesByOrganizationQueryVariables = Exact<{
  orgUsername: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PurchasesByOrganizationQuery = { __typename?: 'Query', purchasesByOrganization: Array<{ __typename?: 'Purchase', id: string, organizationUsername: string, dateSubmitted: any, itemTitle: string, itemCategory: string, eventId: string, orderStatus: string, itemCost: number }> };


export const CreateEventDocument = gql`
    mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    title
    eventDate
    eventStatus
    organization {
      id
      orgName
      username
    }
  }
}
    `;
export type CreateEventMutationFn = ApolloReactCommon.MutationFunction<CreateEventMutation, CreateEventMutationVariables>;

/**
 * __useCreateEventMutation__
 *
 * To run a mutation, you first call `useCreateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEventMutation, { data, loading, error }] = useCreateEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateEventMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateEventMutation, CreateEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateEventMutation, CreateEventMutationVariables>(CreateEventDocument, options);
      }
export type CreateEventMutationHookResult = ReturnType<typeof useCreateEventMutation>;
export type CreateEventMutationResult = ApolloReactCommon.MutationResult<CreateEventMutation>;
export type CreateEventMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateEventMutation, CreateEventMutationVariables>;
export const UpdateEventDocument = gql`
    mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
  updateEvent(id: $id, input: $input) {
    id
    title
    eventDate
    eventStatus
  }
}
    `;
export type UpdateEventMutationFn = ApolloReactCommon.MutationFunction<UpdateEventMutation, UpdateEventMutationVariables>;

/**
 * __useUpdateEventMutation__
 *
 * To run a mutation, you first call `useUpdateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEventMutation, { data, loading, error }] = useUpdateEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateEventMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateEventMutation, UpdateEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateEventMutation, UpdateEventMutationVariables>(UpdateEventDocument, options);
      }
export type UpdateEventMutationHookResult = ReturnType<typeof useUpdateEventMutation>;
export type UpdateEventMutationResult = ApolloReactCommon.MutationResult<UpdateEventMutation>;
export type UpdateEventMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateEventMutation, UpdateEventMutationVariables>;
export const DeleteEventDocument = gql`
    mutation DeleteEvent($id: ID!) {
  deleteEvent(id: $id)
}
    `;
export type DeleteEventMutationFn = ApolloReactCommon.MutationFunction<DeleteEventMutation, DeleteEventMutationVariables>;

/**
 * __useDeleteEventMutation__
 *
 * To run a mutation, you first call `useDeleteEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEventMutation, { data, loading, error }] = useDeleteEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteEventMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteEventMutation, DeleteEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteEventMutation, DeleteEventMutationVariables>(DeleteEventDocument, options);
      }
export type DeleteEventMutationHookResult = ReturnType<typeof useDeleteEventMutation>;
export type DeleteEventMutationResult = ApolloReactCommon.MutationResult<DeleteEventMutation>;
export type DeleteEventMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteEventMutation, DeleteEventMutationVariables>;
export const ChangeEventStatusDocument = gql`
    mutation ChangeEventStatus($id: ID!, $status: EventStatus!) {
  changeEventStatus(id: $id, status: $status) {
    id
    eventStatus
  }
}
    `;
export type ChangeEventStatusMutationFn = ApolloReactCommon.MutationFunction<ChangeEventStatusMutation, ChangeEventStatusMutationVariables>;

/**
 * __useChangeEventStatusMutation__
 *
 * To run a mutation, you first call `useChangeEventStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeEventStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeEventStatusMutation, { data, loading, error }] = useChangeEventStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useChangeEventStatusMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ChangeEventStatusMutation, ChangeEventStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ChangeEventStatusMutation, ChangeEventStatusMutationVariables>(ChangeEventStatusDocument, options);
      }
export type ChangeEventStatusMutationHookResult = ReturnType<typeof useChangeEventStatusMutation>;
export type ChangeEventStatusMutationResult = ApolloReactCommon.MutationResult<ChangeEventStatusMutation>;
export type ChangeEventStatusMutationOptions = ApolloReactCommon.BaseMutationOptions<ChangeEventStatusMutation, ChangeEventStatusMutationVariables>;
export const CreateOrganizationDocument = gql`
    mutation CreateOrganization($input: CreateOrganizationInput!) {
  createOrganization(input: $input) {
    id
    orgName
    username
  }
}
    `;
export type CreateOrganizationMutationFn = ApolloReactCommon.MutationFunction<CreateOrganizationMutation, CreateOrganizationMutationVariables>;

/**
 * __useCreateOrganizationMutation__
 *
 * To run a mutation, you first call `useCreateOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrganizationMutation, { data, loading, error }] = useCreateOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrganizationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateOrganizationMutation, CreateOrganizationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateOrganizationMutation, CreateOrganizationMutationVariables>(CreateOrganizationDocument, options);
      }
export type CreateOrganizationMutationHookResult = ReturnType<typeof useCreateOrganizationMutation>;
export type CreateOrganizationMutationResult = ApolloReactCommon.MutationResult<CreateOrganizationMutation>;
export type CreateOrganizationMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateOrganizationMutation, CreateOrganizationMutationVariables>;
export const UpdateOrganizationDocument = gql`
    mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
  updateOrganization(id: $id, input: $input) {
    id
    orgName
    username
  }
}
    `;
export type UpdateOrganizationMutationFn = ApolloReactCommon.MutationFunction<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;

/**
 * __useUpdateOrganizationMutation__
 *
 * To run a mutation, you first call `useUpdateOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrganizationMutation, { data, loading, error }] = useUpdateOrganizationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOrganizationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>(UpdateOrganizationDocument, options);
      }
export type UpdateOrganizationMutationHookResult = ReturnType<typeof useUpdateOrganizationMutation>;
export type UpdateOrganizationMutationResult = ApolloReactCommon.MutationResult<UpdateOrganizationMutation>;
export type UpdateOrganizationMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const DeleteOrganizationDocument = gql`
    mutation DeleteOrganization($id: ID!) {
  deleteOrganization(id: $id)
}
    `;
export type DeleteOrganizationMutationFn = ApolloReactCommon.MutationFunction<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>;

/**
 * __useDeleteOrganizationMutation__
 *
 * To run a mutation, you first call `useDeleteOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOrganizationMutation, { data, loading, error }] = useDeleteOrganizationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteOrganizationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>(DeleteOrganizationDocument, options);
      }
export type DeleteOrganizationMutationHookResult = ReturnType<typeof useDeleteOrganizationMutation>;
export type DeleteOrganizationMutationResult = ApolloReactCommon.MutationResult<DeleteOrganizationMutation>;
export type DeleteOrganizationMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    firstName
    lastName
    profileImg
    username
    organization {
      id
      orgName
      username
    }
    createdAt
    updatedAt
  }
}
    `;
export type CreateUserMutationFn = ApolloReactCommon.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = ApolloReactCommon.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    firstName
    lastName
    profileImg
    username
    organization {
      id
      orgName
      username
    }
    createdAt
    updatedAt
  }
}
    `;
export type UpdateUserMutationFn = ApolloReactCommon.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = ApolloReactCommon.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
    `;
export type DeleteUserMutationFn = ApolloReactCommon.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = ApolloReactCommon.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const CreatePurchaseDocument = gql`
    mutation CreatePurchase($input: CreatePurchaseInput!) {
  createPurchase(input: $input) {
    id
    organizationUsername
    dateSubmitted
    itemTitle
    itemCategory
    eventId
    orderStatus
    itemCost
    organization {
      id
      orgName
      username
    }
  }
}
    `;
export type CreatePurchaseMutationFn = ApolloReactCommon.MutationFunction<CreatePurchaseMutation, CreatePurchaseMutationVariables>;

/**
 * __useCreatePurchaseMutation__
 *
 * To run a mutation, you first call `useCreatePurchaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePurchaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPurchaseMutation, { data, loading, error }] = useCreatePurchaseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePurchaseMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreatePurchaseMutation, CreatePurchaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreatePurchaseMutation, CreatePurchaseMutationVariables>(CreatePurchaseDocument, options);
      }
export type CreatePurchaseMutationHookResult = ReturnType<typeof useCreatePurchaseMutation>;
export type CreatePurchaseMutationResult = ApolloReactCommon.MutationResult<CreatePurchaseMutation>;
export type CreatePurchaseMutationOptions = ApolloReactCommon.BaseMutationOptions<CreatePurchaseMutation, CreatePurchaseMutationVariables>;
export const UpdatePurchaseDocument = gql`
    mutation UpdatePurchase($id: ID!, $input: UpdatePurchaseInput!) {
  updatePurchase(id: $id, input: $input) {
    id
    organizationUsername
    dateSubmitted
    itemTitle
    itemCategory
    eventId
    orderStatus
    itemCost
  }
}
    `;
export type UpdatePurchaseMutationFn = ApolloReactCommon.MutationFunction<UpdatePurchaseMutation, UpdatePurchaseMutationVariables>;

/**
 * __useUpdatePurchaseMutation__
 *
 * To run a mutation, you first call `useUpdatePurchaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePurchaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePurchaseMutation, { data, loading, error }] = useUpdatePurchaseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePurchaseMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdatePurchaseMutation, UpdatePurchaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdatePurchaseMutation, UpdatePurchaseMutationVariables>(UpdatePurchaseDocument, options);
      }
export type UpdatePurchaseMutationHookResult = ReturnType<typeof useUpdatePurchaseMutation>;
export type UpdatePurchaseMutationResult = ApolloReactCommon.MutationResult<UpdatePurchaseMutation>;
export type UpdatePurchaseMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdatePurchaseMutation, UpdatePurchaseMutationVariables>;
export const DeletePurchaseDocument = gql`
    mutation DeletePurchase($id: ID!) {
  deletePurchase(id: $id)
}
    `;
export type DeletePurchaseMutationFn = ApolloReactCommon.MutationFunction<DeletePurchaseMutation, DeletePurchaseMutationVariables>;

/**
 * __useDeletePurchaseMutation__
 *
 * To run a mutation, you first call `useDeletePurchaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePurchaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePurchaseMutation, { data, loading, error }] = useDeletePurchaseMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeletePurchaseMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeletePurchaseMutation, DeletePurchaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeletePurchaseMutation, DeletePurchaseMutationVariables>(DeletePurchaseDocument, options);
      }
export type DeletePurchaseMutationHookResult = ReturnType<typeof useDeletePurchaseMutation>;
export type DeletePurchaseMutationResult = ApolloReactCommon.MutationResult<DeletePurchaseMutation>;
export type DeletePurchaseMutationOptions = ApolloReactCommon.BaseMutationOptions<DeletePurchaseMutation, DeletePurchaseMutationVariables>;
export const GetEventsDocument = gql`
    query GetEvents($limit: Int = 25, $offset: Int = 0, $status: EventStatus, $fromDate: Date, $toDate: Date) {
  events(
    limit: $limit
    offset: $offset
    status: $status
    fromDate: $fromDate
    toDate: $toDate
  ) {
    id
    organizationUsername
    title
    description
    eventImg
    locationType
    locationId
    createdBy
    eventLevel
    formData
    eventDate
    setupTime
    startTime
    endTime
    location
    eventStatus
    submittedAt
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

/**
 * __useGetEventsQuery__
 *
 * To run a query within a React component, call `useGetEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEventsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      status: // value for 'status'
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *   },
 * });
 */
export function useGetEventsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetEventsQuery, GetEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, options);
      }
export function useGetEventsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, options);
        }
// @ts-ignore
export function useGetEventsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetEventsQuery, GetEventsQueryVariables>;
export function useGetEventsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetEventsQuery | undefined, GetEventsQueryVariables>;
export function useGetEventsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, options);
        }
export type GetEventsQueryHookResult = ReturnType<typeof useGetEventsQuery>;
export type GetEventsLazyQueryHookResult = ReturnType<typeof useGetEventsLazyQuery>;
export type GetEventsSuspenseQueryHookResult = ReturnType<typeof useGetEventsSuspenseQuery>;
export type GetEventsQueryResult = ApolloReactCommon.QueryResult<GetEventsQuery, GetEventsQueryVariables>;
export const GetEventByIdDocument = gql`
    query GetEventById($id: ID!) {
  event(id: $id) {
    id
    organizationUsername
    title
    description
    eventImg
    locationType
    locationId
    createdBy
    eventLevel
    formData
    eventDate
    setupTime
    startTime
    endTime
    location
    eventStatus
    submittedAt
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

/**
 * __useGetEventByIdQuery__
 *
 * To run a query within a React component, call `useGetEventByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEventByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEventByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetEventByIdQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetEventByIdQuery, GetEventByIdQueryVariables> & ({ variables: GetEventByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetEventByIdQuery, GetEventByIdQueryVariables>(GetEventByIdDocument, options);
      }
export function useGetEventByIdLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetEventByIdQuery, GetEventByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetEventByIdQuery, GetEventByIdQueryVariables>(GetEventByIdDocument, options);
        }
// @ts-ignore
export function useGetEventByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetEventByIdQuery, GetEventByIdQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetEventByIdQuery, GetEventByIdQueryVariables>;
export function useGetEventByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetEventByIdQuery, GetEventByIdQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetEventByIdQuery | undefined, GetEventByIdQueryVariables>;
export function useGetEventByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetEventByIdQuery, GetEventByIdQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetEventByIdQuery, GetEventByIdQueryVariables>(GetEventByIdDocument, options);
        }
export type GetEventByIdQueryHookResult = ReturnType<typeof useGetEventByIdQuery>;
export type GetEventByIdLazyQueryHookResult = ReturnType<typeof useGetEventByIdLazyQuery>;
export type GetEventByIdSuspenseQueryHookResult = ReturnType<typeof useGetEventByIdSuspenseQuery>;
export type GetEventByIdQueryResult = ApolloReactCommon.QueryResult<GetEventByIdQuery, GetEventByIdQueryVariables>;
export const GetOrganizationsDocument = gql`
    query GetOrganizations($limit: Int = 25, $offset: Int = 0, $username: String) {
  organizations(limit: $limit, offset: $offset, username: $username) {
    id
    orgName
    username
    bio
    orgImg
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetOrganizationsQuery__
 *
 * To run a query within a React component, call `useGetOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      username: // value for 'username'
 *   },
 * });
 */
export function useGetOrganizationsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetOrganizationsQuery, GetOrganizationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetOrganizationsQuery, GetOrganizationsQueryVariables>(GetOrganizationsDocument, options);
      }
export function useGetOrganizationsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetOrganizationsQuery, GetOrganizationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetOrganizationsQuery, GetOrganizationsQueryVariables>(GetOrganizationsDocument, options);
        }
// @ts-ignore
export function useGetOrganizationsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetOrganizationsQuery, GetOrganizationsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetOrganizationsQuery, GetOrganizationsQueryVariables>;
export function useGetOrganizationsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetOrganizationsQuery, GetOrganizationsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetOrganizationsQuery | undefined, GetOrganizationsQueryVariables>;
export function useGetOrganizationsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetOrganizationsQuery, GetOrganizationsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetOrganizationsQuery, GetOrganizationsQueryVariables>(GetOrganizationsDocument, options);
        }
export type GetOrganizationsQueryHookResult = ReturnType<typeof useGetOrganizationsQuery>;
export type GetOrganizationsLazyQueryHookResult = ReturnType<typeof useGetOrganizationsLazyQuery>;
export type GetOrganizationsSuspenseQueryHookResult = ReturnType<typeof useGetOrganizationsSuspenseQuery>;
export type GetOrganizationsQueryResult = ApolloReactCommon.QueryResult<GetOrganizationsQuery, GetOrganizationsQueryVariables>;
export const EventsByOrganizationDocument = gql`
    query EventsByOrganization($orgUsername: String!, $limit: Int = 25, $offset: Int = 0, $status: String, $fromDate: Date, $toDate: Date) {
  eventsByOrganization(
    orgUsername: $orgUsername
    limit: $limit
    offset: $offset
    status: $status
    fromDate: $fromDate
    toDate: $toDate
  ) {
    id
    organizationUsername
    title
    description
    eventImg
    locationType
    locationId
    createdBy
    eventLevel
    formData
    eventDate
    setupTime
    startTime
    endTime
    location
    eventStatus
    submittedAt
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useEventsByOrganizationQuery__
 *
 * To run a query within a React component, call `useEventsByOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventsByOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventsByOrganizationQuery({
 *   variables: {
 *      orgUsername: // value for 'orgUsername'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      status: // value for 'status'
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *   },
 * });
 */
export function useEventsByOrganizationQuery(baseOptions: ApolloReactHooks.QueryHookOptions<EventsByOrganizationQuery, EventsByOrganizationQueryVariables> & ({ variables: EventsByOrganizationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>(EventsByOrganizationDocument, options);
      }
export function useEventsByOrganizationLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>(EventsByOrganizationDocument, options);
        }
// @ts-ignore
export function useEventsByOrganizationSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>;
export function useEventsByOrganizationSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<EventsByOrganizationQuery | undefined, EventsByOrganizationQueryVariables>;
export function useEventsByOrganizationSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>(EventsByOrganizationDocument, options);
        }
export type EventsByOrganizationQueryHookResult = ReturnType<typeof useEventsByOrganizationQuery>;
export type EventsByOrganizationLazyQueryHookResult = ReturnType<typeof useEventsByOrganizationLazyQuery>;
export type EventsByOrganizationSuspenseQueryHookResult = ReturnType<typeof useEventsByOrganizationSuspenseQuery>;
export type EventsByOrganizationQueryResult = ApolloReactCommon.QueryResult<EventsByOrganizationQuery, EventsByOrganizationQueryVariables>;
export const GetDbDumpDocument = gql`
    query GetDbDump($limit: Int = 25, $offset: Int = 0) {
  events(limit: $limit, offset: $offset) {
    id
    organizationUsername
    title
    description
    eventImg
    locationType
    locationId
    eventDate
    setupTime
    startTime
    endTime
    location
    eventStatus
    submittedAt
    createdAt
    updatedAt
    organization {
      id
      orgName
      username
      bio
    }
  }
  organizations(limit: $limit, offset: $offset) {
    id
    orgName
    username
    bio
    orgImg
    createdAt
    updatedAt
  }
  users(limit: $limit, offset: $offset) {
    id
    firstName
    lastName
    username
    profileImg
    password
    organization {
      id
      orgName
      username
      bio
      orgImg
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetDbDumpQuery__
 *
 * To run a query within a React component, call `useGetDbDumpQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDbDumpQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDbDumpQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetDbDumpQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetDbDumpQuery, GetDbDumpQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetDbDumpQuery, GetDbDumpQueryVariables>(GetDbDumpDocument, options);
      }
export function useGetDbDumpLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetDbDumpQuery, GetDbDumpQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetDbDumpQuery, GetDbDumpQueryVariables>(GetDbDumpDocument, options);
        }
// @ts-ignore
export function useGetDbDumpSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetDbDumpQuery, GetDbDumpQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetDbDumpQuery, GetDbDumpQueryVariables>;
export function useGetDbDumpSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetDbDumpQuery, GetDbDumpQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetDbDumpQuery | undefined, GetDbDumpQueryVariables>;
export function useGetDbDumpSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetDbDumpQuery, GetDbDumpQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetDbDumpQuery, GetDbDumpQueryVariables>(GetDbDumpDocument, options);
        }
export type GetDbDumpQueryHookResult = ReturnType<typeof useGetDbDumpQuery>;
export type GetDbDumpLazyQueryHookResult = ReturnType<typeof useGetDbDumpLazyQuery>;
export type GetDbDumpSuspenseQueryHookResult = ReturnType<typeof useGetDbDumpSuspenseQuery>;
export type GetDbDumpQueryResult = ApolloReactCommon.QueryResult<GetDbDumpQuery, GetDbDumpQueryVariables>;
export const GetUsersDocument = gql`
    query GetUsers($limit: Int = 25, $offset: Int = 0) {
  users(limit: $limit, offset: $offset) {
    id
    firstName
    lastName
    username
    profileImg
    password
    role
    organization {
      id
      orgName
      username
      bio
      orgImg
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
// @ts-ignore
export function useGetUsersSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUsersQuery, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUsersQuery | undefined, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = ApolloReactCommon.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const GetUserDocument = gql`
    query GetUser($id: ID!) {
  user(id: $id) {
    id
    firstName
    lastName
    username
    profileImg
    password
    role
    organization {
      id
      orgName
      username
      bio
      orgImg
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUserQuery, GetUserQueryVariables> & ({ variables: GetUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
      }
export function useGetUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
// @ts-ignore
export function useGetUserSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUserQuery, GetUserQueryVariables>;
export function useGetUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUserQuery | undefined, GetUserQueryVariables>;
export function useGetUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<typeof useGetUserSuspenseQuery>;
export type GetUserQueryResult = ApolloReactCommon.QueryResult<GetUserQuery, GetUserQueryVariables>;
export const GetPurchasesDocument = gql`
    query GetPurchases($limit: Int = 25, $offset: Int = 0) {
  purchases(limit: $limit, offset: $offset) {
    id
    organizationUsername
    dateSubmitted
    itemTitle
    itemCategory
    eventId
    orderStatus
    itemCost
    organization {
      id
      orgName
      username
    }
  }
}
    `;

/**
 * __useGetPurchasesQuery__
 *
 * To run a query within a React component, call `useGetPurchasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPurchasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPurchasesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetPurchasesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetPurchasesQuery, GetPurchasesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetPurchasesQuery, GetPurchasesQueryVariables>(GetPurchasesDocument, options);
      }
export function useGetPurchasesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetPurchasesQuery, GetPurchasesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetPurchasesQuery, GetPurchasesQueryVariables>(GetPurchasesDocument, options);
        }
// @ts-ignore
export function useGetPurchasesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetPurchasesQuery, GetPurchasesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetPurchasesQuery, GetPurchasesQueryVariables>;
export function useGetPurchasesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPurchasesQuery, GetPurchasesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetPurchasesQuery | undefined, GetPurchasesQueryVariables>;
export function useGetPurchasesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPurchasesQuery, GetPurchasesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetPurchasesQuery, GetPurchasesQueryVariables>(GetPurchasesDocument, options);
        }
export type GetPurchasesQueryHookResult = ReturnType<typeof useGetPurchasesQuery>;
export type GetPurchasesLazyQueryHookResult = ReturnType<typeof useGetPurchasesLazyQuery>;
export type GetPurchasesSuspenseQueryHookResult = ReturnType<typeof useGetPurchasesSuspenseQuery>;
export type GetPurchasesQueryResult = ApolloReactCommon.QueryResult<GetPurchasesQuery, GetPurchasesQueryVariables>;
export const GetPurchaseDocument = gql`
    query GetPurchase($id: ID!) {
  purchase(id: $id) {
    id
    organizationUsername
    dateSubmitted
    itemTitle
    itemCategory
    eventId
    orderStatus
    itemCost
    organization {
      id
      orgName
      username
    }
  }
}
    `;

/**
 * __useGetPurchaseQuery__
 *
 * To run a query within a React component, call `useGetPurchaseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPurchaseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPurchaseQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPurchaseQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetPurchaseQuery, GetPurchaseQueryVariables> & ({ variables: GetPurchaseQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetPurchaseQuery, GetPurchaseQueryVariables>(GetPurchaseDocument, options);
      }
export function useGetPurchaseLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetPurchaseQuery, GetPurchaseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetPurchaseQuery, GetPurchaseQueryVariables>(GetPurchaseDocument, options);
        }
// @ts-ignore
export function useGetPurchaseSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetPurchaseQuery, GetPurchaseQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetPurchaseQuery, GetPurchaseQueryVariables>;
export function useGetPurchaseSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPurchaseQuery, GetPurchaseQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetPurchaseQuery | undefined, GetPurchaseQueryVariables>;
export function useGetPurchaseSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPurchaseQuery, GetPurchaseQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetPurchaseQuery, GetPurchaseQueryVariables>(GetPurchaseDocument, options);
        }
export type GetPurchaseQueryHookResult = ReturnType<typeof useGetPurchaseQuery>;
export type GetPurchaseLazyQueryHookResult = ReturnType<typeof useGetPurchaseLazyQuery>;
export type GetPurchaseSuspenseQueryHookResult = ReturnType<typeof useGetPurchaseSuspenseQuery>;
export type GetPurchaseQueryResult = ApolloReactCommon.QueryResult<GetPurchaseQuery, GetPurchaseQueryVariables>;
export const PurchasesByOrganizationDocument = gql`
    query PurchasesByOrganization($orgUsername: String!, $limit: Int = 25, $offset: Int = 0) {
  purchasesByOrganization(
    orgUsername: $orgUsername
    limit: $limit
    offset: $offset
  ) {
    id
    organizationUsername
    dateSubmitted
    itemTitle
    itemCategory
    eventId
    orderStatus
    itemCost
  }
}
    `;

/**
 * __usePurchasesByOrganizationQuery__
 *
 * To run a query within a React component, call `usePurchasesByOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchasesByOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchasesByOrganizationQuery({
 *   variables: {
 *      orgUsername: // value for 'orgUsername'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function usePurchasesByOrganizationQuery(baseOptions: ApolloReactHooks.QueryHookOptions<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables> & ({ variables: PurchasesByOrganizationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>(PurchasesByOrganizationDocument, options);
      }
export function usePurchasesByOrganizationLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>(PurchasesByOrganizationDocument, options);
        }
// @ts-ignore
export function usePurchasesByOrganizationSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>;
export function usePurchasesByOrganizationSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<PurchasesByOrganizationQuery | undefined, PurchasesByOrganizationQueryVariables>;
export function usePurchasesByOrganizationSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>(PurchasesByOrganizationDocument, options);
        }
export type PurchasesByOrganizationQueryHookResult = ReturnType<typeof usePurchasesByOrganizationQuery>;
export type PurchasesByOrganizationLazyQueryHookResult = ReturnType<typeof usePurchasesByOrganizationLazyQuery>;
export type PurchasesByOrganizationSuspenseQueryHookResult = ReturnType<typeof usePurchasesByOrganizationSuspenseQuery>;
export type PurchasesByOrganizationQueryResult = ApolloReactCommon.QueryResult<PurchasesByOrganizationQuery, PurchasesByOrganizationQueryVariables>;