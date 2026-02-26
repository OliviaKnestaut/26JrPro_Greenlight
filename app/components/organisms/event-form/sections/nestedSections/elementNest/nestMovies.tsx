import { Controller, useWatch } from "react-hook-form";
import { Radio, Upload, Typography, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import FieldLabel from "../../../components/FieldLabel";
import { formatPhoneNumber } from "~/lib/formatters";

const { Text } = Typography;
const { TextArea } = Input;

type Props = {
    control: any;
};

const movieOptions = [
    { label: "Option 1: Get written copyright permission", value: "option_1_written_permission" },
    { label: "Option 2: Work with vendor to obtain copyright permissions", value: "option_2_vendor" },
    { label: "Option 3: Hosting an educational lecture/activity", value: "option_3_educational" },
    { label: "Option 4: Hosting a closed event with 50 or less people", value: "option_4_closed_event" },
];

export default function MoviesSection({ control }: Props) {
    const selectedOption = useWatch({
        control,
        name: "form_data.movies.option_type",
    });

    return (
        <div >

            {/* Movie Option Selection */}
            <Controller
                name="form_data.movies.option_type"
                control={control}
                rules={{ required: "Please select an option" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <FieldLabel required>How do you have permission to show this movie?</FieldLabel>
                        <Radio.Group
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            {movieOptions.map((opt) => (
                                <Radio key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Radio>
                            ))}
                        </Radio.Group>
                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* OPTION 1: Org Obtains Written Permission */}
            {selectedOption === "option_1_written_permission" && (
                <>
                    <Text strong style={{ display: "block", marginBottom: 16 }}>
                        Option 1: Organization Obtains Written Permission
                    </Text>

                    <Controller
                        name="form_data.movies.option_1.movie_name"
                        control={control}
                        rules={{ required: "Movie name is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Name of Movie</FieldLabel>
                                <Input {...field} placeholder="Enter movie name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.movies.option_1.company_name"
                        control={control}
                        rules={{ required: "Company/Individual name is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Company/Individual Name</FieldLabel>
                                <Input {...field} placeholder="Enter name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <Controller
                            name="form_data.movies.option_1.contact_first_name"
                            control={control}
                            rules={{ required: "First name is required" }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Contact Person's First Name</FieldLabel>
                                    <Input {...field} placeholder="First name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />

                        <Controller
                            name="form_data.movies.option_1.contact_last_name"
                            control={control}
                            rules={{ required: "Last name is required" }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Contact Person's Last Name</FieldLabel>
                                    <Input {...field} placeholder="Last name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <Controller
                            name="form_data.movies.option_1.email"
                            control={control}
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Email Address</FieldLabel>
                                    <Input {...field} type="email" placeholder="email@example.com" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />

                        <Controller
                            name="form_data.movies.option_1.phone"
                            control={control}
                            rules={{ required: "Phone number is required" }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Phone Number</FieldLabel>
                                    <Input {...field} placeholder="(555) 123-4567" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />
                    </div>

                    <Controller
                        name="form_data.movies.option_1.mailing_address"
                        control={control}
                        rules={{ required: "Mailing address is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Mailing Address (Street, City, State, Zip)</FieldLabel>
                                <Input {...field} placeholder="123 Main St, City, State 12345" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.movies.option_1.permission_file"
                        control={control}
                        rules={{ required: "Written permission documentation is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Upload Written Permission Documentation</FieldLabel>
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
                </>
            )}

            {/* OPTION 2: The Org Purchases the Rights */}
            {selectedOption === "option_2_vendor" && (
                <>
                    <Text strong style={{ display: "block", marginBottom: 16 }}>
                        Option 2: The Organization Purchases the Rights to Show a Film
                    </Text>

                    <Controller
                        name="form_data.movies.option_2.company_name"
                        control={control}
                        rules={{ required: "Company/Individual name is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Company/Individual Name</FieldLabel>
                                <Input {...field} placeholder="Enter name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <Controller
                            name="form_data.movies.option_2.contact_first_name"
                            control={control}
                            rules={{ required: "First name is required" }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Contact Person's First Name</FieldLabel>
                                    <Input {...field} placeholder="First name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />

                        <Controller
                            name="form_data.movies.option_2.contact_last_name"
                            control={control}
                            rules={{ required: "Last name is required" }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Contact Person's Last Name</FieldLabel>
                                    <Input {...field} placeholder="Last name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <Controller
                            name="form_data.movies.option_2.email"
                            control={control}
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Email Address</FieldLabel>
                                    <Input {...field} type="email" placeholder="email@example.com" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />

                        <Controller
                            name="form_data.movies.option_2.phone"
                            control={control}
                            rules={{
                                required: "Phone number is required",
                                validate: (value) =>
                                    /^\(\d{3}\) \d{3}-\d{4}$/.test(value) || "Enter a valid 10-digit phone number"
                            }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Phone Number</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="(555) 123-4567"
                                        maxLength={14}
                                        style={{ marginTop: 8 }}
                                        status={fieldState.error ? "error" : ""}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value);
                                            field.onChange(formatted);
                                        }}
                                    />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />
                    </div>

                    <Controller
                        name="form_data.movies.option_2.purchase_documentation"
                        control={control}
                        rules={{ required: "Purchase documentation is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Upload Purchase Documentation</FieldLabel>
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
                </>
            )}

            {/* OPTION 3: Educational Lecture */}
            {selectedOption === "option_3_educational" && (
                <>
                    <Text strong style={{ display: "block", marginBottom: 16 }}>
                        Option 3: Organization Hosts an Educational Lecture
                    </Text>

                    <Controller
                        name="form_data.movies.option_3.movie_name"
                        control={control}
                        rules={{ required: "Movie name is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Name of Movie</FieldLabel>
                                <Input {...field} placeholder="Enter movie name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.movies.option_3.facilitator_name"
                        control={control}
                        rules={{ required: "Facilitator name is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Facilitator's Name</FieldLabel>
                                <Input {...field} placeholder="Full name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.movies.option_3.facilitator_email"
                        control={control}
                        rules={{
                            required: "Drexel email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@drexel\.edu$/i,
                                message: "Must be a valid Drexel email address"
                            }
                        }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Facilitator's Drexel Email Address</FieldLabel>
                                <Input {...field} type="email" placeholder="abc123@drexel.edu" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <Controller
                            name="form_data.movies.option_3.facilitator_title"
                            control={control}
                            rules={{ required: "Job title is required" }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Facilitator's Job Title at Drexel</FieldLabel>
                                    <Input {...field} placeholder="e.g., Associate Professor" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />

                        <Controller
                            name="form_data.movies.option_3.facilitator_department"
                            control={control}
                            rules={{ required: "College/Department is required" }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required>Facilitator's College/Department</FieldLabel>
                                    <Input {...field} placeholder="e.g., College of Computing" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                    {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                                </div>
                            )}
                        />
                    </div>

                    <Controller
                        name="form_data.movies.option_3.discussion_questions"
                        control={control}
                        rules={{ required: "Discussion questions are required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Discussion Questions Planned with Facilitator</FieldLabel>
                                <TextArea
                                    {...field}
                                    rows={4}
                                    placeholder="List the discussion questions..."
                                    style={{ marginTop: 8 }}
                                    status={fieldState.error ? "error" : ""}
                                />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.movies.option_3.educational_relation"
                        control={control}
                        rules={{ required: "This explanation is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required subtitle="Explain how it will contribute to the educational growth and knowledge of members">How does this film relate to organization activities/goals/mission?</FieldLabel>
                                <TextArea
                                    {...field}
                                    rows={4}
                                    placeholder="Explain the educational value..."
                                    style={{ marginTop: 8 }}
                                    status={fieldState.error ? "error" : ""}
                                />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />
                </>
            )}

            {/* OPTION 4: Closed Event (50 or less) */}
            {selectedOption === "option_4_closed_event" && (
                <>
                    <Text strong style={{ display: "block", marginBottom: 16 }}>
                        Option 4: Hosting a Closed Event with 50 or Less People
                    </Text>

                    <Controller
                        name="form_data.movies.option_4.movie_name"
                        control={control}
                        rules={{ required: "Movie name is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Name of Movie</FieldLabel>
                                <Input {...field} placeholder="Enter movie name" style={{ marginTop: 8 }} status={fieldState.error ? "error" : ""} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />
                </>
            )}

        </div>
    );
}

