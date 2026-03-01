import { Controller, useWatch } from "react-hook-form";
import { Radio, Input, Typography } from "antd";
import FieldLabel from "../../../components/FieldLabel";

const { Text } = Typography;

type Props = {
    control: any;
};

export default function FireSafetySection({ control }: Props) {
    const fireType = useWatch({
        control,
        name: "form_data.fire.type",
    });

    return (
        <div >

            {/* FS1 - Fire Source Type */}
            <Controller
                name="form_data.fire.type"
                control={control}
                rules={{ required: "Select a fire source type" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required>What type of fire source will be used?</FieldLabel>

                        <Radio.Group
                            {...field}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value="fire_pit_package">
                                University Provided Fire Pit Package
                            </Radio>

                            <Radio value="personal_fire_pit" style={{ marginTop: 8 }}>
                                Personal Grill, Fire Pit or Other Open Flame (must be approved by the University and meet all safety requirements)
                            </Radio>

                            <Radio value="grill_closed_event" style={{ marginTop: 8 }}>
                                Grill ONLY for a closed event for 50 or less organization members
                            </Radio>
                        </Radio.Group>

                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                {fieldState.error.message}
                            </Text>
                        )}
                    </div>
                )}
            />

            {/* FS1b - Fire Pit Package Agreement */}
            {fireType === "fire_pit_package" && (
                <Controller
                    name="form_data.fire.fire_pit_agreement"
                    control={control}
                    rules={{
                        required: "You must agree to any charges for using the Fire Pit Package",
                        validate: (value) => value === "yes" || "You must select a different fire source"
                    }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <FieldLabel required>
                                If you select the Fire Pit Package, there may be additional charges added to your organization's account. Do you agree to proceed?
                            </FieldLabel>

                            <Radio.Group
                                {...field}
                                style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
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
            )}

            {/* FS2 - Fire Safety Plan */}
            <Controller
                name="form_data.fire.safety_plan"
                control={control}
                rules={{
                    required: "Fire safety plan description is required",
                }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required subtitle="Include supervision, extinguisher access, and shutdown plan">
                            Describe your fire safety plan
                        </FieldLabel>

                        <Input.TextArea
                            {...field}
                            rows={4}
                            placeholder="Provide detailed fire safety procedures"
                            style={{ marginTop: 8 }}
                            status={fieldState.error ? "error" : ""}
                        />

                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

        </div>
    );
}

