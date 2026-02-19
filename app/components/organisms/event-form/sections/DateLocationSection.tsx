import { Controller, useWatch } from "react-hook-form";
import { Input, DatePicker, TimePicker, InputNumber, Radio, Typography } from "antd";
import dayjs from "dayjs";
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
                        <Text>What is the date of your event?</Text>
                        <DatePicker
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : null)}
                            style={{ display: "block", marginTop: 8 }}
                        />
                        {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
                    </div>
                )}
            />

            {/* Q7: Start and End Time */}
            <div style={{ marginBottom: 24 }}>
                <Text>What is the start and end time of your event?</Text>
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    <Controller
                        name="start_time"
                        control={control}
                        rules={{ required: "Start time is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">Start Time</Text>
                                <TimePicker
                                    value={field.value ? dayjs(field.value, "h:mm A") : null}
                                    format="h:mm A"
                                    use12Hours
                                    onChange={(time) => field.onChange(time ? time.format("h:mm A") : null)}
                                    style={{ display: "block", width: "100%", marginTop: 4 }}
                                />
                                {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="end_time"
                        control={control}
                        rules={{ required: "End time is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">End Time</Text>
                                <TimePicker
                                    value={field.value ? dayjs(field.value, "h:mm A") : null}
                                    format="h:mm A"
                                    use12Hours
                                    onChange={(time) => field.onChange(time ? time.format("h:mm A") : null)}
                                    style={{ display: "block", width: "100%", marginTop: 4 }}
                                />
                                {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
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
                        <Text>Does your event require additional setup or takedown time?</Text>
                        <Text type="secondary">If so, please provide the number of minutes. If not, you can leave this blank or enter 0.</Text>
                        <InputNumber
                            {...field}
                            min={0}
                            placeholder="Ex: 30"
                            style={{ display: "block", marginTop: 8 }}
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
                        <Text>Where will this event take place?</Text>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value="Virtual">Virtual</Radio>
                            <Radio value="On-Campus">On-Campus</Radio>
                            <Radio value="Off-Campus">Off-Campus</Radio>
                        </Radio.Group>
                        {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
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
                            <Text>Please provide the virtual event link</Text>
                            <Input
                                {...field}
                                placeholder="https://zoom.us/meeting/..."
                                style={{ display: "block", marginTop: 8 }}
                            />
                            {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
                        </div>
                    )}
                />
            )}
        </>
    );
}

