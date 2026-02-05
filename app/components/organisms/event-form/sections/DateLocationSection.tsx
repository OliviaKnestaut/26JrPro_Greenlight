import { Controller } from "react-hook-form"
import { DatePicker, Typography, Radio, Select } from "antd"

const { Text } = Typography
const { RangePicker } = DatePicker

type Props = {
    control: any
}

export default function DateLocationSection({ control }: Props) {
    return (
        <>

            <Controller
                name="location"
                control={control}
                render={({ field }) => (
                    <div style={{ marginBottom: 24 }}>
                        <Text strong>Location Type</Text>
                        <Radio.Group {...field}>
                            <Radio value="on-campus">On-Campus</Radio>
                            <Radio value="off-campus">Off-Campus</Radio>
                            <Radio value="virtual">Virtual</Radio>
                        </Radio.Group>
                    </div>
                )}
            />

            {/* Date & Time */}
            <Controller
                name="event.dateRange"
                control={control}
                rules={{ required: "Start and end time are required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                        <Text strong>Event Date & Time</Text>
                        <RangePicker
                            value={field.value}
                            onChange={field.onChange}
                            showTime
                            status={fieldState.error ? "error" : ""}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Location */}
            <Controller
                name="location.name"
                control={control}
                rules={{ required: "Location name is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                        <Text strong>Location</Text>
                        <Select
                            {...field}
                            placeholder="Select a location"
                            status={fieldState.error ? "error" : ""}
                            options={[
                                { label: "Lebow 311", value: "Lebow 311" },
                                { label: "Nesbitt 253", value: "Nesbitt 253" },
                                { label: "URBN 247", value: "URBN 247" },
                            ]}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

        </>
    )
}
