// ─── Third-party ──────────────────────────────────────────────────────────────
import { Controller, useWatch } from "react-hook-form";
import { Radio, Checkbox, Typography, Input, Alert, Select } from "antd";

// ─── Local ────────────────────────────────────────────────────────────────────
import { useGetUsersQuery } from "~/lib/graphql/generated";
import FieldLabel from "../../../components/FieldLabel";
import { formatPhoneNumber } from "~/lib/formatters";

// ─── Ant Design sub-components ────────────────────────────────────────────────
const { Text }     = Typography;
const { TextArea } = Input;

// =============================================================================
// OffCampusSection
// Nested section inside DateLocationSection — shown when location type is
// "Off-Campus". Collects: off-campus address, optional Google Maps link,
// travel type, transportation method, trip leader and emergency contacts,
// and lodging details for domestic overnight travel.
// =============================================================================

type Props = {
    control: any;
    setValue?: any;
};

const travelOptions = [
    { label: "Regional Day Trip", value: "regional" },
    { label: "Domestic Overnight", value: "domestic_overnight" },
    { label: "International Travel", value: "international" },
];

const transportationOptions = [
    "Walking",
    "Public transit (SEPTA)",
    "Personal vehicles",
    "Rental vehicles",
    "Chartered bus",
    "Flight",
];

export default function OffCampusSection({ control, setValue }: Props) {
    const travelType = useWatch({
        control,
        name: "form_data.travel.type",
    });

    // Fetch users for trip leader selection
    const { data: usersData, loading: usersLoading } = useGetUsersQuery({
        variables: { limit: 200, offset: 0 },
        errorPolicy: "all"
    });

    const users = usersData?.users || [];



    return (
        <div >

            {/* Off Campus Location Address */}
            <Controller
                name="form_data.location.off_campus_address"
                control={control}
                rules={{ required: "Off-campus location is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required>Where is this event being held off campus?</FieldLabel>
                        <Input
                            {...field}
                            placeholder="Enter street address or location name"
                            style={{ marginTop: 8 }}
                            status={fieldState.error ? "error" : ""}
                        />
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Google Maps Link */}
            <Controller
                name="form_data.location.google_maps_link"
                control={control}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                            <FieldLabel>Google Maps Link</FieldLabel>
                            <Text type="secondary">Provide a link to help locate the venue (Optional)</Text>
                        </div>
                        <Input
                            {...field}
                            placeholder="https://maps.google.com/..."
                        />
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Travel Type */}
            <Controller
                name="form_data.travel.type"
                control={control}
                rules={{ required: "Travel type is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required>What type of travel does this event involve?</FieldLabel>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            {travelOptions.map((opt) => (
                                <Radio key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Radio>
                            ))}
                        </Radio.Group>

                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* International Travel Warning */}
            {travelType === "international" && (
                <Alert
                    type="warning"
                    showIcon
                    message="International Travel Notice"
                    description="If you are looking to travel outside of the United States for any reason you need to work through the Office of International Programs."
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Transportation - Show only for regional and domestic_overnight */}
            {(travelType === "regional" || travelType === "domestic_overnight") && (
                <>
                    <Controller
                        name="form_data.travel.transportation"
                        control={control}
                        rules={{ required: "Transportation method is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>How will participants be transported?</FieldLabel>
                                <Radio.Group
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                                >
                                    {transportationOptions.map((opt) => (
                                        <Radio key={opt} value={opt}>
                                            {opt}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                )}
                            </div>
                        )}
                    />

                    {/* Trip Leader Information */}
                    <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ display: "block", marginBottom: 8 }}>
                            Trip Leader
                        </Text>
                        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                            Select the trip leader from your organization roster. We'll use their contact information on file.
                        </Text>

                        {/* Trip Leader Selection */}
                        <Controller
                            name="form_data.travel.trip_leader_id"
                            control={control}
                            rules={{ required: "Trip leader is required" }}
                            render={({ field, fieldState }) => (
                                <div style={{ marginBottom: 16 }}>
                                    <FieldLabel required>Select Trip Leader</FieldLabel>
                                    <Select
                                        {...field}
                                        showSearch
                                        placeholder="Search and select a member"
                                        style={{ display: "block", marginTop: 8 }}
                                        loading={usersLoading}
                                        status={fieldState.error ? "error" : ""}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={users.map(user => ({
                                            value: user.id,
                                            label: `${user.firstName || ''} ${user.lastName || ''} (@${user.username})`.trim()
                                        }))}
                                    />
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                    )}
                                </div>
                            )}
                        />

                        {/* Emergency Contact */}
                        <Text strong style={{ display: "block", marginBottom: 16 }}>
                            Emergency Contact for Trip Leader (Not Attending Event)
                        </Text>

                        <div style={{ display: "flex", gap: 16 }}>
                            <Controller
                                name="form_data.travel.trip_leader_emergency_contact.name"
                                control={control}
                                rules={{ required: "Emergency contact name is required" }}
                                render={({ field, fieldState }) => (
                                    <div style={{ flex: 1 }}>
                                        <FieldLabel required>Emergency Contact Name</FieldLabel>
                                        <Input
                                            {...field}
                                            placeholder="Full name"
                                            style={{ marginTop: 8 }}
                                            status={fieldState.error ? "error" : ""}
                                        />
                                        {fieldState.error && (
                                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name="form_data.travel.trip_leader_emergency_contact.phone"
                                control={control}
                                rules={{
                                    required: "Phone number is required",
                                    validate: (value) =>
                                        /^\(\d{3}\) \d{3}-\d{4}$/.test(value) || "Enter a valid 10-digit phone number"
                                }}
                                render={({ field, fieldState }) => (
                                    <div style={{ flex: 1 }}>
                                        <FieldLabel required>Emergency Contact Phone</FieldLabel>
                                        <Input
                                            {...field}
                                            placeholder="(555) 123-4567"
                                            maxLength={14}
                                            style={{ marginTop: 8 }}
                                            status={fieldState.error ? "error" : ""}
                                            onChange={(e) => {
                                                const formatted = formatPhoneNumber(e.target.value);
                                                field.onChange(formatted);
                                            }}
                                        />
                                        {fieldState.error && (
                                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Lodging Details - Show only for domestic_overnight */}
            {travelType === "domestic_overnight" && (
                <Controller
                    name="form_data.travel.lodging"
                    control={control}
                    rules={{ required: "Lodging details are required for overnight travel" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <FieldLabel required>Where will participants be staying overnight?</FieldLabel>
                            <TextArea
                                {...field}
                                rows={4}
                                placeholder="Hotel name, address, number of rooms, supervision plan, etc."
                                style={{ marginTop: 8 }}
                                status={fieldState.error ? "error" : ""}
                            />
                            {fieldState.error && (
                                <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />
            )}

        </div>
    );
}

