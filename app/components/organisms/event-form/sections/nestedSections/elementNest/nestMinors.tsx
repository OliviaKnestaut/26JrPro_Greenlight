import { Controller, useWatch } from "react-hook-form";
import { InputNumber, Input, Upload, Typography, Select, Radio } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useGetUsersQuery } from "~/lib/graphql/generated";
import FieldLabel from "../../../components/FieldLabel";

const { Text } = Typography;
const { TextArea } = Input;

type Props = {
    control: any;
};

export default function MinorsSection({ control }: Props) {
    // Fetch users for student contact selection
    const { data: usersData, loading: usersLoading } = useGetUsersQuery({
        variables: { limit: 200, offset: 0 },
        errorPolicy: "all"
    });

    const users = usersData?.users || [];

    return (
        <div style={{ marginTop: 24 }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Student Point of Contact 
                </Text>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Select a student to be included on emails to HR regarding this event
                </Text>

            {/* Student Contact (from roster) */}
            <div style={{ marginBottom: 24 }}>
                <Controller
                    name="form_data.minors.student_contact_id"
                    control={control}
                    rules={{ required: "Please select a student contact" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <FieldLabel required subtitle="Select a student to be included on emails to HR regarding this event">
                                Student Point of Contact
                            </FieldLabel>
                            <Select
                                {...field}
                                showSearch
                                placeholder="Search and select a member"
                                style={{ display: "block", marginTop: 8 }}
                                loading={usersLoading}
                                status={fieldState.error ? "error" : ""}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={users.map(user => ({
                                    value: user.id,
                                    label: `${user.firstName || ''} ${user.lastName || ''} (@${user.username})`.trim()
                                }))}
                            />
                            {fieldState.error && (
                                <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* External Organizations/Partners */}
            <Controller
                name="form_data.minors.external_partners"
                control={control}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel subtitle="List the specific role of any external partners (if applicable)">
                            Are you partnering with any external organization or individuals?
                        </FieldLabel>
                        <TextArea
                            {...field}
                            rows={3}
                            placeholder="e.g., ABC Youth Organization - Providing volunteers and workshop materials"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Intended Audience and Recruitment */}
            <Controller
                name="form_data.minors.audience_recruitment"
                control={control}
                rules={{ required: "Please describe the intended audience and recruitment method" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required subtitle="Who is the intended audience? How are minors being recruited to participate?">
                            Who is your intended audience and how are you recruiting this audience?
                        </FieldLabel>
                        <TextArea
                            {...field}
                            rows={3}
                            placeholder="Describe the target audience and how you plan to recruit minors..."
                            style={{ marginTop: 8 }}
                            status={fieldState.error ? "error" : ""}
                        />
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Expected Number of Minors by Grade Level */}
            <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Expected Number of Minors by Grade Level
                </Text>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Controller
                        name="form_data.minors.count_early_childhood"
                        control={control}
                        rules={{ min: { value: 0, message: "Cannot be negative" } }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Text>Early Childhood (infant - Pre-K)</Text>
                                <InputNumber {...field} min={0} style={{ display: "block", marginTop: 8, width: "100%" }} />
                                {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.minors.count_elementary"
                        control={control}
                        rules={{ min: { value: 0, message: "Cannot be negative" } }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Text>Elementary (grades K-5)</Text>
                                <InputNumber {...field} min={0} style={{ display: "block", marginTop: 8, width: "100%" }} />
                                {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.minors.count_middle_school"
                        control={control}
                        rules={{ min: { value: 0, message: "Cannot be negative" } }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Text>Middle School (grades 6-8)</Text>
                                <InputNumber {...field} min={0} style={{ display: "block", marginTop: 8, width: "100%" }} />
                                {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.minors.count_high_school"
                        control={control}
                        rules={{ min: { value: 0, message: "Cannot be negative" } }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Text>High School (grades 9-12)</Text>
                                <InputNumber {...field} min={0} style={{ display: "block", marginTop: 8, width: "100%" }} />
                                {fieldState.error && <Text type="danger">{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Overnight Housing */}
            <Controller
                name="form_data.minors.overnight_housing"
                control={control}
                rules={{ required: "Please select Yes or No" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required>Does the activity require overnight housing?</FieldLabel>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value={true}>Yes</Radio>
                            <Radio value={false}>No</Radio>
                        </Radio.Group>
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Drexel Transportation */}
            <Controller
                name="form_data.minors.drexel_transportation"
                control={control}
                rules={{ required: "Please select Yes or No" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required>Does the activity require Drexel Transportation?</FieldLabel>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value={true}>Yes</Radio>
                            <Radio value={false}>No</Radio>
                        </Radio.Group>
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Parent/Guardian Attendance */}
            <Controller
                name="form_data.minors.parent_attendance_required"
                control={control}
                rules={{ required: "Please select Yes or No" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required>Will the activity require each minor's parent or guardian to attend the whole time?</FieldLabel>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value={true}>Yes</Radio>
                            <Radio value={false}>No</Radio>
                        </Radio.Group>
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
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
                        <FieldLabel required>Upload Required Minors Documentation</FieldLabel>
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            onChange={(info) => {
                                const file = info.fileList[0]?.originFileObj;
                                field.onChange(file);
                            }}
                            style={{ marginTop: 8 }}
                        >
                            <div>
                                <UploadOutlined /> Click to Upload
                            </div>
                        </Upload>
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                {fieldState.error.message}
                            </Text>
                        )}
                    </div>
                )}
            />

        </div>
    );
}

