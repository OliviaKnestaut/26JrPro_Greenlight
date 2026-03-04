// ─── Third-party ──────────────────────────────────────────────────────────────
import { Controller, useWatch } from "react-hook-form";
import { Input, DatePicker, TimePicker, InputNumber, Radio, Typography } from "antd";
import dayjs from "dayjs";
import { useRef } from "react";

// ─── Local ────────────────────────────────────────────────────────────────────
import FieldLabel from "../components/FieldLabel";

// ─── Ant Design sub-components ────────────────────────────────────────────────
const { Text } = Typography;

// =============================================================================
// DateLocationSection
// Form section 2 of the event flow.
// Collects: event date, start/end times, optional setup time,
//           location type, and (conditionally) a virtual event link.
// =============================================================================

type Props = {
    control: any;
    getValues: any;
    setValue?: any;
    trigger?: any;
};

export default function DateLocationSection({ control, getValues, setValue, trigger }: Props) {

    // ── Watched fields ───────────────────────────────────────────────────────
    // Track location type so we can conditionally show the virtual link field
    const locationType = useWatch({ control, name: "location_type" });
    // Track whether user opted in to setup time
    const needsSetupTime = useWatch({ control, name: "form_data.needs_setup_time" }) === "yes";
    // Track start time so end time picker can mirror its AM/PM period
    const startTimeValue = useWatch({ control, name: "start_time" });

    // ── Derived values ───────────────────────────────────────────────────────
    // Used to prevent selecting past dates in the DatePicker
    const today = dayjs().startOf("day");

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* Q6 — Event Date --------------------------------------------- */}
            <Controller
                name="event_date"
                control={control}
                rules={{ required: "Event date is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 24 }}>
                        <FieldLabel required>
                            What is the date of your event?
                        </FieldLabel>

                        <DatePicker
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) =>
                                field.onChange(
                                    date ? date.format("YYYY-MM-DD") : null
                                )
                            }
                            style={{
                                display: "block",
                                marginTop: 8,
                                width: "49%",
                            }}
                            disabledDate={(current) => {
                                if (!current) return false;
                                return current.startOf("day").isBefore(today);
                            }}
                            status={fieldState.error ? "error" : ""}
                        />

                        {fieldState.error && (
                            <Text
                                type="danger"
                                style={{
                                    display: "block",
                                    marginTop: 4,
                                    color: "var(--red-6)",
                                }}
                            >
                                {fieldState.error.message}
                            </Text>
                        )}
                    </div>
                )}
            />

            {/* Q7 — Start & End Time -------------------------------------- */}
            <div style={{ marginBottom: 24 }}>
                <FieldLabel required>
                    What is the start and end time of your event?
                </FieldLabel>

                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    {/* Start Time */}
                    <Controller
                        name="start_time"
                        control={control}
                        rules={{ required: "Start time is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ flex: 1 }}>
                                <Text
                                    type="secondary"
                                    style={{
                                        display: "block",
                                        marginBottom: 4,
                                    }}
                                >
                                    Start Time
                                </Text>

                                <TimePicker
                                    value={
                                        field.value
                                            ? dayjs(field.value, "h:mm A")
                                            : null
                                    }
                                    format="h:mm A"
                                    use12Hours
                                    needConfirm={false}
                                    minuteStep={5}
                                    onChange={(time) => {
                                        field.onChange(time ? time.format("h:mm A") : null);
                                        // Re-validate end time whenever start changes
                                        trigger?.("end_time");
                                    }}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                    }}
                                    status={fieldState.error ? "error" : ""}
                                />

                                {fieldState.error && (
                                    <Text
                                        type="danger"
                                        style={{
                                            display: "block",
                                            marginTop: 4,
                                            color: "var(--red-6)",
                                        }}
                                    >
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />

                    {/* End Time */}
                    <Controller
                        name="end_time"
                        control={control}
                        rules={{
                            required: "End time is required",
                            validate: (value) => {
                                const start = getValues("start_time");
                                const date = getValues("event_date");

                                if (!start || !value || !date) return true;

                                const startDateTime = dayjs(
                                    `${date} ${start}`,
                                    "YYYY-MM-DD h:mm A"
                                );

                                const endDateTime = dayjs(
                                    `${date} ${value}`,
                                    "YYYY-MM-DD h:mm A"
                                );

                                if (!endDateTime.isAfter(startDateTime)) {
                                    return "End time must be after start time";
                                }

                                return true;
                            },
                        }}
                        render={({ field, fieldState }) => (
                            <div style={{ flex: 1 }}>
                                <Text
                                    type="secondary"
                                    style={{
                                        display: "block",
                                        marginBottom: 4,
                                    }}
                                >
                                    End Time
                                </Text>

                                <TimePicker
                                    value={
                                        field.value
                                            ? dayjs(field.value, "h:mm A")
                                            : null
                                    }
                                    format="h:mm A"
                                    use12Hours
                                    minuteStep={5}
                                    needConfirm={false}
                                    defaultOpenValue={(() => {
                                        // When the picker opens with no value, mirror start time's AM/PM
                                        if (startTimeValue) {
                                            const start = dayjs(startTimeValue, "h:mm A");
                                            const isPM = start.hour() >= 12;
                                            return isPM ? dayjs().hour(12).minute(0) : dayjs().hour(8).minute(0);
                                        }
                                        return dayjs().hour(8).minute(0);
                                    })()}
                                    onChange={(time) => {
                                        field.onChange(time ? time.format("h:mm A") : null);
                                        trigger?.("end_time");
                                    }}
                                    disabledTime={() => {
                                        const startVal = getValues("start_time");
                                        if (!startVal) return {};
                                        const startDayjs = dayjs(startVal, "h:mm A");
                                        const startHour = startDayjs.hour();
                                        const startMinute = startDayjs.minute();
                                        return {
                                            disabledHours: () =>
                                                Array.from({ length: startHour }, (_, i) => i),
                                            disabledMinutes: (selectedHour: number) =>
                                                selectedHour === startHour
                                                    ? Array.from({ length: startMinute + 5 }, (_, i) => i)
                                                    : [],
                                        };
                                    }}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                    }}
                                    status={fieldState.error ? "error" : ""}
                                />

                                {fieldState.error && (
                                    <Text
                                        type="danger"
                                        style={{
                                            display: "block",
                                            marginTop: 4,
                                            color: "var(--red-6)",
                                        }}
                                    >
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Q8 — Setup / Takedown Time ---------------------------------- */}
            <Controller
                name="form_data.needs_setup_time"
                control={control}
                rules={{ required: "Please indicate whether your event requires additional setup or takedown time" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: needsSetupTime ? 16 : 24 }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                            <FieldLabel required>Does your event require additional setup or takedown time?</FieldLabel>
                        </div>
                        <Radio.Group
                            {...field}
                            onChange={(e) => {
                                field.onChange(e.target.value);
                                if (e.target.value === "no") {
                                    setValue("setup_time", null);
                                }
                            }}
                        >
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                        </Radio.Group>
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                {fieldState.error.message}
                            </Text>
                        )}
                    </div>
                )}
            />

            {needsSetupTime && (
                <Controller
                    name="setup_time"
                    control={control}
                    rules={{ required: "Please enter the estimated setup and takedown time" }}
                    render={({ field, fieldState }) => (
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                <FieldLabel required>
                                    Enter the estimated TOTAL amount of additional setup and takedown time (in minutes)
                                </FieldLabel>
                            </div>
                            <InputNumber
                                {...field}
                                min={0}
                                placeholder="Ex: 30 minutes"
                                formatter={(value) => value != null && value !== '' ? `${value} minutes` : ''}
                                parser={(value) => value ? Number(value.replace(/\s*minutes/g, '')) : undefined}
                                style={{ display: "block", width: "49%" }}
                                status={fieldState.error ? "error" : ""}
                                onWheel={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.blur()}
                            />
                            {fieldState.error && (
                                <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                    {fieldState.error.message}
                                </Text>
                            )}
                        </div>
                    )}
                />
            )}

            {/* Q9 — Location Type ----------------------------------------- */}
            <Controller
                name="location_type"
                control={control}
                rules={{ required: "Please select a location type" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 24 }}>
                        <FieldLabel required>
                            Where will this event take place?
                        </FieldLabel>

                        <Radio.Group
                            {...field}
                            onChange={(e) =>
                                field.onChange(e.target.value)
                            }
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                marginTop: 8,
                            }}
                        >
                            <Radio value="Virtual">Virtual</Radio>
                            <Radio value="On-Campus">On-Campus</Radio>
                            <Radio value="Off-Campus">Off-Campus</Radio>
                        </Radio.Group>

                        {fieldState.error && (
                            <Text
                                type="danger"
                                style={{
                                    display: "block",
                                    marginTop: 4,
                                    color: "var(--red-6)",
                                }}
                            >
                                {fieldState.error.message}
                            </Text>
                        )}
                    </div>
                )}
            />

            {/* Q9a — Virtual link (shown only when locationType === "Virtual") */}
            {locationType === "Virtual" && (
                <Controller
                    name="virtual_link"
                    control={control}
                    rules={{ required: "Virtual event link is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 24 }}>
                            <FieldLabel required>
                                Please provide the virtual event link
                            </FieldLabel>

                            <Input
                                {...field}
                                placeholder="https://zoom.us/meeting/..."
                                style={{
                                    display: "block",
                                    marginTop: 8,
                                }}
                                status={fieldState.error ? "error" : ""}
                            />

                            {fieldState.error && (
                                <Text
                                    type="danger"
                                    style={{
                                        display: "block",
                                        marginTop: 4,
                                        color: "var(--red-6)",
                                    }}
                                >
                                    {fieldState.error.message}
                                </Text>
                            )}
                        </div>
                    )}
                />
            )}
        </>
    );
}