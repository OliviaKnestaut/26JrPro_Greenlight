import { Controller, useWatch } from "react-hook-form";
import { Radio, Checkbox, Typography, Input, Upload, Alert } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

type Props = {
    control: any;
};

const travelOptions = [
    { label: "Regional day trip", value: "regional" },
    { label: "Domestic overnight", value: "domestic_overnight" },
    { label: "International travel", value: "international" },
];

const transportationOptions = [
    "Walking",
    "Public transit (SEPTA)",
    "Personal vehicles",
    "Rental vehicles",
    "Chartered bus",
    "Flight",
];

export default function OffCampusSection({ control }: Props) {
    const travelType = useWatch({
        control,
        name: "form_data.travel.type",
    });

    const overnight = useWatch({
        control,
        name: "form_data.travel.overnight",
    });

    return (
        <div style={{ marginTop: 24 }}>

            {/* Q18 — Travel Type */}
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

            {/* International Pop-Up Notice */}
            {travelType === "international" && (
                <Alert
                    type="warning"
                    showIcon
                    message="International Travel Notice"
                    description="If you are looking to travel outside of the United States for any reason you need to work through the Office of International Programs."
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Q19 — Transportation */}
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

            {/* Q20 — Overnight Lodging */}
            {travelType !== "regional" && (
                <Controller
                    name="form_data.travel.overnight"
                    control={control}
                    rules={{ required: "Please select Yes or No" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <Text>Will overnight lodging be required?</Text>
                            <Radio.Group
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                                style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                            >
                                <Radio value={true}>Yes</Radio>
                                <Radio value={false}>No</Radio>
                            </Radio.Group>
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />
            )}

            {/* Q21a — Lodging Details */}
            {overnight === true && travelType !== "regional" && (
                <Controller
                    name="form_data.travel.lodging"
                    control={control}
                    rules={{ required: "Provide lodging details" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <Text>Provide Lodging Details</Text>
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

            {/* Q21 — Emergency Action Plan Upload */}
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
        </div>
    );
}
