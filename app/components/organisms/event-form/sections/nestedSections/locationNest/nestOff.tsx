import { Controller, useWatch } from "react-hook-form";
import { Radio, Checkbox, Typography, Input, Upload, Alert, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useGetUsersQuery } from "~/lib/graphql/generated";

const { Text } = Typography;
const { TextArea } = Input;

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
        <div style={{ marginTop: 24 }}>

            {/* Off Campus Location Address */}
            <Controller
                name="form_data.location.off_campus_address"
                control={control}
                rules={{ required: "Please provide the off campus location" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Where is this event being held off campus?</Text>
                        <Input
                            {...field}
                            placeholder="Enter street address or location name"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
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
                        <Text>Google Maps Link (Optional)</Text>
                        <Input
                            {...field}
                            placeholder="https://maps.google.com/..."
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Travel Type */}
            <Controller
                name="form_data.travel.type"
                control={control}
                rules={{ required: "Please select a travel type" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>What type of travel does this event involve?</Text>
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
                            <Text type="danger">{fieldState.error.message}</Text>
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
                        rules={{ required: "Please select a transportation method" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <Text>How will participants be transported?</Text>
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
                                    <Text type="danger">{fieldState.error.message}</Text>
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
                            rules={{ required: "Please select a trip leader" }}
                            render={({ field, fieldState }) => (
                                <div style={{ marginBottom: 16 }}>
                                    <Text>Select Trip Leader</Text>
                                    <Select
                                        {...field}
                                        showSearch
                                        placeholder="Search and select a member"
                                        style={{ display: "block", marginTop: 8 }}
                                        loading={usersLoading}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={users.map(user => ({
                                            value: user.id,
                                            label: `${user.firstName || ''} ${user.lastName || ''} (@${user.username})`.trim()
                                        }))}
                                    />
                                    {fieldState.error && (
                                        <Text type="danger">{fieldState.error.message}</Text>
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
                                        <Text>Emergency Contact Name</Text>
                                        <Input
                                            {...field}
                                            placeholder="Full name"
                                            style={{ marginTop: 8 }}
                                        />
                                        {fieldState.error && (
                                            <Text type="danger">{fieldState.error.message}</Text>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name="form_data.travel.trip_leader_emergency_contact.phone"
                                control={control}
                                rules={{ required: "Emergency contact phone is required" }}
                                render={({ field, fieldState }) => (
                                    <div style={{ flex: 1 }}>
                                        <Text>Emergency Contact Phone</Text>
                                        <Input
                                            {...field}
                                            placeholder="(555) 123-4567"
                                            style={{ marginTop: 8 }}
                                        />
                                        {fieldState.error && (
                                            <Text type="danger">{fieldState.error.message}</Text>
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
                            <Text>Where will participants be staying overnight?</Text>
                            <TextArea
                                {...field}
                                rows={4}
                                placeholder="Hotel name, address, number of rooms, supervision plan, etc."
                                style={{ marginTop: 8 }}
                            />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />
            )}

            {/* Emergency Action Plan Upload - Show only for regional and domestic_overnight */}
            {(travelType === "regional" || travelType === "domestic_overnight") && (
                <Controller
                    name="form_data.travel.eap_file"
                    control={control}
                    rules={{ required: "Emergency Action Plan upload is required for travel events" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <Text>
                                Upload an Emergency Action Plan (Required for Travel Events)
                            </Text>
                            <br />
                            <Upload
                                beforeUpload={() => false}
                                maxCount={1}
                                onChange={(info) => {
                                    const file = info.fileList[0]?.originFileObj;
                                    field.onChange(file);
                                }}
                            >
                                <div>
                                    <UploadOutlined /> Click to Upload
                                </div>
                            </Upload>
                            {fieldState.error && (
                                <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                    {fieldState.error.message}
                                </Text>
                            )}
                        </div>
                    )}
                />
            )}
        </div>
    );
}
