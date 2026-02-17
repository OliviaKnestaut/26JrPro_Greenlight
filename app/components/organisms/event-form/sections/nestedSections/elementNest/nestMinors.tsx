import { Controller } from "react-hook-form";
import { InputNumber, Input, Upload, Button, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Props = {
    control: any;
};

export default function MinorsSection({ control }: Props) {
    return (
        <div style={{ marginTop: 24 }}>

            {/* MN1 — Approximate Number of Minors */}
            <Controller
                name="form_data.minors.count"
                control={control}
                rules={{
                    required: "Enter approximate number of minors",
                    min: { value: 0, message: "Cannot be negative" },
                }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Approximate number of minors attending</Text>
                        <InputNumber
                            {...field}
                            min={0}
                            style={{ display: "block", marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* MN2 — Age Breakdown */}
            <div style={{ marginBottom: 16 }}>
                <Text>Age breakdown of minors</Text>

                <Controller
                    name="form_data.minors.age_breakdown.age_0_5"
                    control={control}
                    rules={{ min: { value: 0, message: "Cannot be negative" } }}
                    render={({ field }) => (
                        <div style={{ marginTop: 8 }}>
                            <Text>Ages 0–5</Text>
                            <InputNumber {...field} min={0} style={{ marginLeft: 12 }} />
                        </div>
                    )}
                />

                <Controller
                    name="form_data.minors.age_breakdown.age_6_12"
                    control={control}
                    rules={{ min: { value: 0, message: "Cannot be negative" } }}
                    render={({ field }) => (
                        <div style={{ marginTop: 8 }}>
                            <Text>Ages 6–12</Text>
                            <InputNumber {...field} min={0} style={{ marginLeft: 12 }} />
                        </div>
                    )}
                />

                <Controller
                    name="form_data.minors.age_breakdown.age_13_17"
                    control={control}
                    rules={{ min: { value: 0, message: "Cannot be negative" } }}
                    render={({ field }) => (
                        <div style={{ marginTop: 8 }}>
                            <Text>Ages 13–17</Text>
                            <InputNumber {...field} min={0} style={{ marginLeft: 12 }} />
                        </div>
                    )}
                />
            </div>

            {/* MN3 — Responsible Coordinator */}
            <Controller
                name="form_data.minors.coordinator"
                control={control}
                rules={{ required: "Responsible coordinator name is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Responsible coordinator name</Text>
                        <Input
                            {...field}
                            placeholder="Enter coordinator name"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* MN4 — Documentation Upload */}
            <Controller
                name="form_data.minors.file"
                control={control}
                rules={{ required: "Minors documentation is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Upload required minors documentation</Text>
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            onChange={(info) => {
                                const file = info.fileList[0]?.originFileObj;
                                field.onChange(file);
                            }}
                        >
                            <Button icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                                Upload File
                            </Button>
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
