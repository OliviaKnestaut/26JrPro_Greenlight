import { Controller, useWatch } from "react-hook-form";
import { Radio, Input, Typography } from "antd";

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
        <div style={{ marginTop: 24 }}>

            {/* FS1 - Fire Source Type */}
            <Controller
                name="form_data.fire.type"
                control={control}
                rules={{ required: "Select a fire source type" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>What type of fire source will be used?</Text>

                        <Radio.Group
                            {...field}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value="sorc_fire_pit">
                                <div>
                                    <Text>SORC-provided fire pit</Text>
                                    <div>
                                        <Text type="secondary">
                                            Fire pit provided and managed by SORC staff
                                        </Text>
                                    </div>
                                </div>
                            </Radio>

                            <Radio value="personal_grill" style={{ marginTop: 8 }}>
                                <div>
                                    <Text>Personal grill</Text>
                                    <div>
                                        <Text type="secondary">
                                            Privately owned grill brought by organization
                                        </Text>
                                    </div>
                                </div>
                            </Radio>
                        </Radio.Group>

                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                {fieldState.error.message}
                            </Text>
                        )}
                    </div>
                )}
            />

            {/* FS1b - SORC Fire Pit Agreement */}
            {fireType === "sorc_fire_pit" && (
                <Controller
                    name="form_data.fire.sorc_agreement"
                    control={control}
                    rules={{ required: "You must agree to the additional charge to use the SORC fire pit" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <Text>
                                If you select SORC fire pit, there will be an additional charge added to your organization&apos;s account. Do you agree to this if the event is approved?
                            </Text>

                            <Radio.Group
                                {...field}
                                style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                            >
                                <Radio value="yes">Yes</Radio>
                                <Radio value="no">No</Radio>
                            </Radio.Group>

                            {fieldState.error && (
                                <Text type="danger" style={{ display: "block", marginTop: 4 }}>
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
                        <Text>Describe your fire safety plan</Text>
                        <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                            Include supervision, extinguisher access, and shutdown plan
                        </Text>

                        <Input.TextArea
                            {...field}
                            rows={4}
                            placeholder="Provide detailed fire safety procedures"
                            style={{ marginTop: 8 }}
                        />

                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

        </div>
    );
}
