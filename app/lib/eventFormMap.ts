// eventFormMap.ts
export interface EventFormField {
  label: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  nested?: Record<string, EventFormField>;
}

// Mapping matching EventOverviewContent structure
export const eventFormMap: Record<string, EventFormField> = {
  // --- Header ---
  header: {
    label: 'Header Info',
    type: 'object',
    nested: {
      eventName: { label: 'Event Name', type: 'string' },
      eventStatus: { label: 'Status', type: 'string' },
      createdByUser: {
        label: 'Created By',
        type: 'object',
        nested: {
          firstName: { label: 'First Name', type: 'string' },
          lastName: { label: 'Last Name', type: 'string' },
          profileImg: { label: 'Profile Image', type: 'string' },
        },
      },
    },
  },

  // --- Tags / Quick Info below header ---
  quickTags: {
    label: 'Event Quick Tags',
    type: 'object',
    nested: {
      date: { label: 'Event Date', type: 'string' },
      startTime: { label: 'Start Time', type: 'string' },
      locationName: { label: 'Location', type: 'string' },
    },
  },

  // --- Stat Cards ---
  stats: {
    label: 'Event Stats',
    type: 'object',
    nested: {
      eventLevel: { label: 'Event Level', type: 'string' },
      estimatedCost: { label: 'Estimated Cost', type: 'number' },
      attendees: { label: 'Estimated Attendees', type: 'number' },
      locationType: { label: 'Location Type', type: 'string' },
    },
  },

  // --- Event Details Card ---
  eventDetails: {
    label: 'Event Details',
    type: 'object',
    nested: {
      name: { label: 'Event Name', type: 'string' },
      description: { label: 'Description', type: 'string' },
      attendees: { label: 'Expected Attendees', type: 'number' },
      organization_ids: { label: 'Co-hosting Organizations', type: 'array' },
    },
  },

  // --- Date & Location Card ---
  dateLocation: {
    label: 'Date & Location',
    type: 'object',
    nested: {
      locationType: { label: 'Location Type', type: 'string' },
      date: { label: 'Event Date', type: 'string' },
      startTime: { label: 'Start Time', type: 'string' },
      endTime: { label: 'End Time', type: 'string' },
      setupTime: { label: 'Setup Time', type: 'string' },
      onCampus: {
        label: 'On-Campus Details',
        type: 'object',
        nested: {
          selected: { label: 'Campus Space', type: 'string' },
          roomType: { label: 'Room Type', type: 'string' },
          roomTitle: { label: 'Room Title/Number', type: 'string' },
          specialSpaceAlignment: { label: 'Special Space Alignment', type: 'string' },
          rainLocation: { label: 'Rain Plan', type: 'string' },
          roomSetup: { label: 'Room Setup', type: 'string' },
          furniture: { label: 'Furniture', type: 'array' },
          av: { label: 'A/V Equipment', type: 'array' },
          utilities: { label: 'Utilities', type: 'object' },
        },
      },
      offCampus: {
        label: 'Off-Campus Details',
        type: 'object',
        nested: {
          address: { label: 'Address', type: 'string' },
          googleMapsLink: { label: 'Google Maps Link', type: 'string' },
          travelType: { label: 'Travel Type', type: 'string' },
          transportation: { label: 'Transportation', type: 'string' },
          tripLeader: { label: 'Trip Leader', type: 'string' },
          tripLeaderEmergencyContact: { label: 'Emergency Contact', type: 'object' },
          lodging: { label: 'Lodging', type: 'string' },
          eapFile: { label: 'Emergency Action Plan', type: 'string' },
        },
      },
    },
  },

  // --- Event Elements Card ---
  eventElements: {
    label: 'Event Elements',
    type: 'object',
    nested: {
      food: { label: 'Food', type: 'object' },
      alcohol: { label: 'Alcohol', type: 'object' },
      minors: { label: 'Minors Present', type: 'object' },
      movies: { label: 'Movies/Media', type: 'object' },
      raffles: { label: 'Raffles/Prizes', type: 'object' },
      fire: { label: 'Fire Safety', type: 'object' },
      sorcGames: { label: 'SORC Games', type: 'object' },
    },
  },

  // --- Budget & Purchase Card ---
  budgetPurchase: {
    label: 'Budget & Purchase',
    type: 'object',
    nested: {
      totalEstimatedCost: { label: 'Total Estimated Cost', type: 'number' },
      account: { label: 'Account Code', type: 'string' },
      vendor: { label: 'Vendor Needed', type: 'boolean' },
      vendorsList: { label: 'Vendors/Contracts', type: 'array' },
    },
  },
};