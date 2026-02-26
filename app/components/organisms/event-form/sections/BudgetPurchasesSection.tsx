import { useState } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { Input, Button, Select, Typography, InputNumber, Radio, Upload, Checkbox, Alert, Popover, Divider } from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import FieldLabel from "../components/FieldLabel";
import NonVendorCosts from "./nestedSections/NonVendorCosts";
import { formatPhoneNumber } from "~/lib/formatters";

const { Text } = Typography;
const { Option } = Select;

type Props = {
    control: any;
    setValue: any;
};

export default function BudgetPurchasesSection({ control, setValue }: Props) {
    // Watch for vendors and elements to conditionally require fields
    const vendorFields = useWatch({
        control,
        name: "form_data.vendors",
    });

    const selectedElements = useWatch({
        control,
        name: "form_data.elements",
    });

    // Watch for level 0 confirmation from event elements
    const level0Confirmed = useWatch({
        control,
        name: "form_data.level0_confirmed",
    });

    // Watch for non-vendor services
    const selectedServices = useWatch({
        control,
        name: "form_data.non_vendor_services",
    });

    // Determine if there are any vendors added
    const hasVendors = vendorFields && vendorFields.length > 0;

    // Determine if any elements are selected
    const hasElements = selectedElements && Object.values(selectedElements).some(Boolean);

    // Determine if any non-vendor services are selected
    const hasServices = selectedServices && Object.values(selectedServices).some(Boolean);

    // Vendors repeater
    const { fields, append: appendVendor, remove: removeVendor } = useFieldArray({
        control,
        name: "form_data.vendors",
    });

    const [showSpecialServices, setShowSpecialServices] = useState(false);
    const canRevealSpecialServices = hasVendors || hasElements || hasServices;
    const shouldShowSpecialServices = !level0Confirmed && (canRevealSpecialServices || showSpecialServices);

    return (
        <div style={{ marginBottom: 24 }}>
            {/* Level 0 Event Notice */}
            {level0Confirmed && (
                <Alert
                    message="Level 0 Event - No Purchases Allowed"
                    description="You indicated this is a level 0 event. This means you are unable to make any purchases."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Only show vendor section if NOT a level 0 event */}
            {!level0Confirmed && (
                <>
                    <h5 style={{ display: "block", marginBottom: 8 }}>
                        Vendors
                    </h5>
                    <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                        Add any vendors you will pay directly for this event.
                    </Text>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                        <FieldLabel>What contracts requests (vendors) are you planning to use for your event?</FieldLabel>
                        <Text type="secondary" style={{}}>(Optional)</Text>
                    </div>
                </>
            )}

            {fields.map((field, index) => (
                <div key={field.id} style={{
                    marginTop: 16,
                    padding: 16,
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    position: "relative"
                }}>
                    <MinusCircleOutlined
                        onClick={() => removeVendor(index)}
                        style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            fontSize: 18,
                            color: "var(--red-5)",
                            cursor: "pointer"
                        }}
                    />

                    {/* Vendor Type */}
                    <Controller
                        name={`form_data.vendors.${index}.type`}
                        control={control}
                        rules={hasVendors ? { required: "Vendor type is required" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required={hasVendors}>What type of vendor is this?</FieldLabel>
                                <Select
                                    {...field}
                                    placeholder="Select vendor type"
                                    style={{ width: "100%", marginTop: 8 }}
                                    status={fieldState.error ? "error" : ""}
                                >
                                    <Option value="food">Food</Option>
                                    <Option value="paid_speaker">Paid Speaker</Option>
                                    <Option value="non_paid_speaker">Non-paid Speaker</Option>
                                    <Option value="inflatable_game">Inflatable/Game Company (i.e. Bettes Bounces, Dunk Tank, Photo Booth)</Option>
                                    <Option value="performer">Performer/Entertainer (DJ, Musician, Dance Artist, etc.)</Option>
                                    <Option value="outside_venue">Outside venue where you are hosting an event</Option>
                                    <Option value="photographer">Photographer</Option>
                                    <Option value="audio_video">Audio/Video Equipment (NOT DUST)</Option>
                                    <Option value="other">Other</Option>
                                </Select>
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        {/* Vendor/Company Name */}
                        <Controller
                            name={`form_data.vendors.${index}.companyName`}
                            control={control}
                            rules={hasVendors ? { required: "Vendor/Company name is required" } : {}}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required={hasVendors} style={{ marginBottom: 8 }}>Vendor/Company/Agency Name</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Enter vendor or company name, or N/A"
                                        status={fieldState.error ? "error" : ""}
                                    />
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                            {fieldState.error.message}
                                        </Text>
                                    )}
                                </div>
                            )}
                        />

                        {/* Name of person in contact with / performing */}
                        <Controller
                            name={`form_data.vendors.${index}.contactPersonName`}
                            control={control}
                            rules={hasVendors ? { required: "Contact person name is required" } : {}}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required={hasVendors}>Contact Person Name</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Enter contact or performer name"
                                        style={{ marginTop: 8 }}
                                        status={fieldState.error ? "error" : ""}
                                    />
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                            {fieldState.error.message}
                                        </Text>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        {/* Contact Email */}
                        <Controller
                            name={`form_data.vendors.${index}.contactEmail`}
                            control={control}
                            rules={hasVendors ? {
                                required: "Contact email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                                    message: "Enter a valid email address"
                                }
                            } : {}}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required={hasVendors}>Contact Email Address</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="vendor@example.com"
                                        style={{ marginTop: 8 }}
                                        status={fieldState.error ? "error" : ""}
                                    />
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                            {fieldState.error.message}
                                        </Text>
                                    )}
                                </div>
                            )}
                        />

                        {/* Contact Phone */}
                        <Controller
                            name={`form_data.vendors.${index}.contactPhone`}
                            control={control}
                            rules={{
                                required: "Phone number is required",
                                validate: (value) =>
                                    /^\(\d{3}\) \d{3}-\d{4}$/.test(value) || "Enter a valid 10-digit phone number"
                            }}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required={hasVendors}>Contact Phone Number</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="(123) 456-7890"
                                        maxLength={14}
                                        style={{ marginTop: 8 }}
                                        status={fieldState.error ? "error" : ""}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value);
                                            field.onChange(formatted);
                                        }}
                                    />
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                            {fieldState.error.message}
                                        </Text>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        {/* Have you worked with this vendor before? */}
                        <Controller
                            name={`form_data.vendors.${index}.workedBefore`}
                            control={control}
                            rules={hasVendors ? { required: "Please select an option" } : {}}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required={hasVendors}>Have you worked with this vendor before?</FieldLabel>
                                    <Radio.Group {...field} style={{ display: "block", marginTop: 8 }}>
                                        <Radio value="yes">Yes</Radio>
                                        <Radio value="no">No</Radio>
                                        <Radio value="not_sure">Not Sure</Radio>
                                    </Radio.Group>
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                            {fieldState.error.message}
                                        </Text>
                                    )}
                                </div>
                            )}
                        />

                        {/* Is vendor a current/recent Drexel student? */}
                        <Controller
                            name={`form_data.vendors.${index}.isDrexelStudent`}
                            control={control}
                            rules={hasVendors ? { required: "Please select an option" } : {}}
                            render={({ field, fieldState }) => (
                                <div style={{ flex: 1 }}>
                                    <FieldLabel required={hasVendors}>Is the vendor a current Drexel student or have they been within the last year?</FieldLabel>
                                    <Radio.Group {...field} style={{ display: "block", marginTop: 8 }}>
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
                    </div>

                    {/* Payment Amount */}
                    <Controller
                        name={`form_data.vendors.${index}.estimatedCost`}
                        control={control}
                        rules={hasVendors ? { required: "Payment amount is required" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required={hasVendors}>Amount the vendor is being paid</FieldLabel>
                                <InputNumber
                                    {...field}
                                    min={0}
                                    step={1}
                                    style={{ display: "block", marginTop: 8, width: 200 }}
                                    formatter={(value) =>
                                        value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                                    }
                                    parser={(value) =>
                                        value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
                                    }
                                    status={fieldState.error ? "error" : ""}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />

                    {/* Upload Quote */}
                    {/* <Controller
                        name={`form_data.vendors.${index}.quote_file`}
                        control={control}
                        render={({ field }) => (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                    <FieldLabel>Please upload official quote from the vendor, if you have received one.</FieldLabel>
                                    <Text type="secondary" style={{}}>(Optional)</Text>
                                </div>
                                <Upload
                                    beforeUpload={() => false}
                                    maxCount={1}
                                    onChange={(info) => {
                                        const file = info.fileList[0]?.originFileObj;
                                        field.onChange(file);
                                    }}
                                >
                                    <div style={{ cursor: "pointer" }}>
                                        <UploadOutlined /> Click to Upload
                                    </div>
                                </Upload>
                            </div>
                        )}
                    /> */}

                    {/* Description of what vendor is doing */}
                    <Controller
                        name={`form_data.vendors.${index}.description`}
                        control={control}
                        rules={hasVendors ? { required: "Vendor description is required" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required={hasVendors}>Please give a brief, but detailed description of what exactly this vendor is doing for your event</FieldLabel>
                                <Input.TextArea
                                    {...field}
                                    rows={3}
                                    placeholder="Describe vendor services"
                                    style={{ marginTop: 8 }}
                                    status={fieldState.error ? "error" : ""}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />

                    {/* Equipment/service org is providing */}
                    <Controller
                        name={`form_data.vendors.${index}.org_providing`}
                        control={control}
                        rules={hasVendors ? { required: "Please specify what you are providing, or write N/A" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required={hasVendors}>Student Organization will provide the following equipment/service</FieldLabel>
                                <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 8 }}>If you are not providing anything please write N/A</Text>
                                <Input.TextArea
                                    {...field}
                                    rows={2}
                                    placeholder="Enter equipment/services or N/A"
                                    status={fieldState.error ? "error" : ""}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />
                </div>
            ))}



            {/* Only show Add Vendor button if NOT a level 0 event */}
            {!level0Confirmed && (
                <Button
                    type="dashed"
                    onClick={() => appendVendor({
                        type: "",
                        companyName: "",
                        contactPersonName: "",
                        contactEmail: "",
                        contactPhone: "",
                        workedBefore: "",
                        isDrexelStudent: "",
                        amount: 0,
                        quote_file: null,
                        description: "",
                        org_providing: ""
                    })}
                    icon={<PlusOutlined />}
                    style={{ marginTop: 16, width: "100%" }}
                >
                    Add Vendor
                </Button>
            )}

            {/* Vendor Letter Notice - Single checkbox for all vendors */}
            {hasVendors && (
                <Controller
                    name="form_data.vendors_notice_acknowledged"
                    control={control}
                    rules={{
                        required: "You must acknowledge reading the vendor letter notice",
                        validate: (value) => value === true || "You must check this box to proceed"
                    }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginTop: 24, marginBottom: 16, padding: 12, backgroundColor: "#f0f0f0", borderRadius: 4 }}>
                            <Checkbox {...field} checked={field.value}>
                                I have read the vendor letter notice and have or will send the letter to my vendor(s). <span style={{ color: "var(--red-5)" }}>*</span>
                            </Checkbox>
                            {fieldState.error && (
                                <div><Text type="danger" style={{ display: "block", marginTop: 4, fontSize: 12, color: "var(--red-6)" }}>
                                    {fieldState.error.message}
                                </Text></div>
                            )}
                        </div>
                    )}
                />
            )}

            {!level0Confirmed && !shouldShowSpecialServices && (
                <Button type="link" onClick={() => setShowSpecialServices(true)} style={{ paddingLeft: 0 }}>
                    Add special services or equipment
                </Button>
            )}

            {shouldShowSpecialServices && (
                <>
                    <Divider style={{ borderColor: "var(--gray-5)", marginTop: 72, marginBottom: 45 }} />
                    <h5 style={{ display: "block", marginTop: 24, marginBottom: 8 }}>
                        Special Services and/or Equipment (e.g. AV, SORC Games, Fire Pit, etc.)
                    </h5>
                    <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                        Select any non-vendor services or equipment that may incur fees.
                    </Text>
                    {/* Non-Vendor Costs Section - Only show if NOT a level 0 event */}
                    <NonVendorCosts control={control} setValue={setValue} />
                </>
            )}

            {/* Only show funding questions if NOT a level 0 event and has vendors, elements, or services */}
            {(hasVendors || hasElements || hasServices) && !level0Confirmed && (
                <>
                    <Divider style={{ borderColor: "var(--gray-5)", marginTop: 72, marginBottom: 45 }} />
                    <h5 style={{ display: "block", marginTop: 24, marginBottom: 8 }}>
                        Account Information for Funding
                    </h5>
                    <div style={{ marginTop: 24 }}>
                        <Text strong style={{ display: "block", marginBottom: 8 }}>
                            Funding Information Required
                        </Text>
                        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                            You have selected services that may incur costs. Please provide your account information below.
                        </Text>
                    </div>
                    <FieldLabel required style={{ marginTop: 24 }}>How will you be funding your event?</FieldLabel>
                    <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 8 }}>
                        {hasServices ? "This funding source will be used for any vendor payments and service charges" : "Select the funding source for this event"}
                    </Text>
                    <Controller
                        name="form_data.budget.source"
                        control={control}
                        rules={{ required: "Funding source is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginTop: 8 }}>
                                <Select
                                    {...field}
                                    placeholder="Select Funding Source"
                                    style={{ width: "49%" }}
                                    status={fieldState.error ? "error" : ""}
                                >
                                    <Option value="SAFAC">SAFAC (17 Account)</Option>
                                    <Option value="Rollover">Rollover/Fundraised (19 Account)</Option>
                                    <Option value="Department">Department</Option>
                                    <Option value="FSL">FSL</Option>
                                </Select>
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <div style={{ marginTop: 24 }}>
                        <FieldLabel required>
                            What account number will be used to fund this event?
                            <Popover
                                content={
                                    <div style={{ maxWidth: 400 }}>
                                        <Text style={{ display: "block", marginBottom: 8 }}>
                                            Your account number should be 10 digits in the format: <strong>XX-XXXXXX</strong>
                                        </Text>
                                        <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 8 }}>
                                            <li style={{ marginBottom: 4 }}>
                                                <Text><strong>17 Account:</strong> SAFAC funding (cannot be used for members-only events)</Text>
                                            </li>
                                            <li style={{ marginBottom: 4 }}>
                                                <Text><strong>19 Account:</strong> Rollover/Fundraised money (required for closed/members-only events)</Text>
                                            </li>
                                        </ul>
                                        <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                                            Example: 17-123456 or 19-789012
                                        </Text>
                                    </div>
                                }
                                title="Account Number Format"
                                trigger="click"
                            >
                                <InfoCircleOutlined
                                    style={{
                                        marginLeft: 8,
                                        color: "var(--blue-6)",
                                        cursor: "pointer",
                                        fontSize: 16
                                    }}
                                />
                            </Popover>
                        </FieldLabel>
                        <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 8 }}>
                            {hasServices ? "This account will be charged for vendor payments and any service fees" : "Provide the account number for event expenses"}
                        </Text>
                    </div>

                    <Controller
                        name="form_data.budget.account_number"
                        control={control}
                        rules={{
                            required: "Account number is required",
                            pattern: {
                                value: /^\d{2}-\d{6}$/,
                                message: "Account number must be in format XX-XXXXXX (e.g., 17-123456 or 19-123456)"
                            }
                        }}
                        render={({ field, fieldState }) => (
                            <div style={{ marginTop: 8 }}>
                                <Input
                                    {...field}
                                    placeholder="XX-XXXXXX (e.g., 17-123456)"
                                    style={{ width: "49%" }}
                                    status={fieldState.error ? "error" : ""}
                                    maxLength={10}
                                />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />
                </>
            )}
        </div>
    );
}

