import { Controller } from "react-hook-form";
import { Radio, Input, Typography } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

type Props = {
    control: any;
};

export default function AlcoholSection({ control }: Props) {
    return (
        <div style={{ marginTop: 24 }}>

            {/* A1 — Alcohol Type */}
            <Controller
                name="form_data.alcohol.type"
                control={control}
                rules={{ required: "Select alcohol type" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>What type of alcohol will be served?</Text>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value="beer_wine">Beer & Wine only</Radio>
                            <Radio value="full_bar">Full bar</Radio>
                        </Radio.Group>
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* A2 — Alcohol Vendor */}
            <Controller
                name="form_data.alcohol.vendor"
                control={control}
                rules={{ required: "Alcohol vendor name is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Alcohol vendor name</Text>
                        <Input
                            {...field}
                            placeholder="Enter licensed vendor name"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* A3 — Chaperone Information */}
            <div style={{ marginBottom: 16 }}>
                <Text>Chaperone Information</Text>

                <Controller
                    name="form_data.alcohol.chaperone.name"
                    control={control}
                    rules={{ required: "Chaperone name is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginTop: 8 }}>
                            <Input {...field} placeholder="Full Name" />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="form_data.alcohol.chaperone.email"
                    control={control}
                    rules={{
                        required: "Email is required",
                        pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Enter a valid email address",
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginTop: 8 }}>
                            <Input {...field} placeholder="Email Address" />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="form_data.alcohol.chaperone.phone"
                    control={control}
                    rules={{ required: "Phone number is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginTop: 8 }}>
                            <Input {...field} placeholder="Phone Number" />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* A4 — ID Checking Procedures */}
            <Controller
                name="form_data.alcohol.id_procedure"
                control={control}
                rules={{ required: "Describe ID checking procedures" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Describe ID checking procedures</Text>
                        <TextArea
                            {...field}
                            rows={4}
                            placeholder="Explain how IDs will be verified and wristband/age control methods."
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* A5 — FSL Event */}
            <Controller
                name="form_data.fsl.is_fsl"
                control={control}
                rules={{ required: "Select Yes or No" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Is this an FSL event?</Text>
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

        </div>
    );
}
