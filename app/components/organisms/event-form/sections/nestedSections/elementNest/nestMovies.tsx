import { Controller, useWatch, useFieldArray } from "react-hook-form";
import { Radio, Upload, Button, Typography, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Props = {
    control: any;
};

const permissionOptions = [
    { label: "Purchased public performance rights", value: "public_performance_rights" },
    { label: "Written permission from copyright holder", value: "written_permission" },
    { label: "Vendor-provided license", value: "vendor_license" },
    { label: "Educational use (class-related)", value: "educational_use" },
];

export default function MoviesSection({ control }: Props) {
    const permissionType = useWatch({
        control,
        name: "form_data.movies.permission_type",
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "form_data.movies.docs",
    });

    const isEducational = permissionType === "educational_use";

    return (
        <div style={{ marginTop: 24 }}>

            {/* M1 — Permission Type */}
            <Controller
                name="form_data.movies.permission_type"
                control={control}
                rules={{ required: "Select a permission type" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>How do you have permission to show this content?</Text>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            {permissionOptions.map((opt) => (
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

            {/* M2 — Supporting Documentation Upload */}
            <div style={{ marginBottom: 16 }}>
                <Text>Upload supporting documentation</Text>

                {fields.map((fieldItem, index) => (
                    <div key={fieldItem.id} style={{ marginTop: 8 }}>
                        <Controller
                            name={`form_data.movies.docs.${index}`}
                            control={control}
                            rules={{ required: "Documentation file is required" }}
                            render={({ field, fieldState }) => (
                                <>
                                    <Upload
                                        beforeUpload={() => false}
                                        maxCount={1}
                                        onChange={(info) => {
                                            const file = info.fileList[0]?.originFileObj;
                                            field.onChange(file);
                                        }}
                                    >
                                        <Button icon={<UploadOutlined />}>
                                            Upload File
                                        </Button>
                                    </Upload>
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                            {fieldState.error.message}
                                        </Text>
                                    )}
                                </>
                            )}
                        />

                        <Button
                            danger
                            size="small"
                            style={{ marginTop: 4 }}
                            onClick={() => remove(index)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}

                <Button
                    type="dashed"
                    style={{ marginTop: 8 }}
                    onClick={() => append(null)}
                >
                    Add Document
                </Button>
            </div>

            {/* M3 — Faculty Facilitator (Educational Only) */}
            {isEducational && (
                <Controller
                    name="form_data.movies.facilitator"
                    control={control}
                    rules={{ required: "Faculty facilitator is required for educational use" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <Text>Faculty Facilitator (Educational Use Only)</Text>
                            <Input
                                {...field}
                                placeholder="Enter faculty name"
                                style={{ marginTop: 8 }}
                            />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />
            )}

        </div>
    );
}
