import { Controller, useWatch } from "react-hook-form";
import { Input, DatePicker, TimePicker, InputNumber, Radio, Typography } from "antd";
import dayjs from "dayjs";
import FieldLabel from "../components/FieldLabel";

const { TextArea } = Input;
const { Text } = Typography;


type Props = {
    control: any;
};

export default function DateLocationSection({ control }: Props) {
    // Watch location_type for conditional field (virtual link)
    const locationType = useWatch({
        control,
        name: "location_type",
    });

    return (
        <>
            {/* Q6: Event Date */}
            <Controller
                name="event_date"
                control={control}
                rules={{ required: "Event date is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 24 }}>
                        <FieldLabel required>What is the date of your event?</FieldLabel>
                        <DatePicker
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : null)}
                            style={{ display: "block", marginTop: 8, width: "49%" }}
                            status={fieldState.error ? "error" : ""}
                        />
                        {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                    </div>
                )}
            />

            {/* Q7: Start and End Time */}
            <div style={{ marginBottom: 24 }}>
                <FieldLabel required>What is the start and end time of your event?</FieldLabel>
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    <Controller
                        name="start_time"
                        control={control}
                        rules={{ required: "Start time is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ flex: 1 }}>
                                <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Start Time</Text>
                                <TimePicker
                                    value={field.value ? dayjs(field.value, "h:mm A") : null}
                                    format="h:mm A"
                                    use12Hours
                                    minuteStep={5}
                                    onChange={(time) => field.onChange(time ? time.format("h:mm A") : null)}
                                    style={{ display: "block", width: "100%" }}
                                    status={fieldState.error ? "error" : ""}
                                />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="end_time"
                        control={control}
                        rules={{ required: "End time is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ flex: 1 }}>
                                <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>End Time</Text>
                                <TimePicker
                                    value={field.value ? dayjs(field.value, "h:mm A") : null}
                                    format="h:mm A"
                                    use12Hours
                                    minuteStep={5}
                                    onChange={(time) => field.onChange(time ? time.format("h:mm A") : null)}
                                    style={{ display: "block", width: "100%" }}
                                    status={fieldState.error ? "error" : ""}
                                />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Q8: Setup/Takedown Time */}
            <Controller
                name="setup_time"
                control={control}
                render={({ field }) => (
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                            <FieldLabel>Does your event require additional setup or takedown time? </FieldLabel>
                            <Text type="secondary" style={{  }}>(Optional)</Text>
                        </div>
                        <InputNumber
                            {...field}
                            min={0}
                            placeholder="Ex: 30"
                            style={{ display: "block", width: "49%" }}
                        />
                    </div>
                )}
            />

            {/* Q9: Location Type */}
            <Controller
                name="location_type"
                control={control}
                rules={{ required: "Please select a location type" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 24 }}>
                        <FieldLabel required>Where will this event take place?</FieldLabel>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value="Virtual">Virtual</Radio>
                            <Radio value="On-Campus">On-Campus</Radio>
                            <Radio value="Off-Campus">Off-Campus</Radio>
                        </Radio.Group>
                        {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                    </div>
                )}
            />

            {/* Conditional: Virtual Event Link */}
            {locationType === "Virtual" && (
                <Controller
                    name="virtual_link"
                    control={control}
                    rules={{ required: "Virtual event link is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 24 }}>
                            <FieldLabel required>Please provide the virtual event link</FieldLabel>
                            <Input
                                {...field}
                                placeholder="https://zoom.us/meeting/..."
                                style={{ display: "block", marginTop: 8 }}
                                status={fieldState.error ? "error" : ""}
                            />
                            {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                        </div>
                    )}
                />
            )}
        </>
    );
}


