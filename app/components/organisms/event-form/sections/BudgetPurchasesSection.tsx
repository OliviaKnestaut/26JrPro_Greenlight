import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { Input, Button, Select, Typography, InputNumber, Radio, Upload, Checkbox, Alert } from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

type Props = {
    control: any;
};

export default function BudgetPurchasesSection({ control }: Props) {
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

    // Determine if there are any vendors added
    const hasVendors = vendorFields && vendorFields.length > 0;

    // Determine if any elements are selected
    const hasElements = selectedElements && Object.values(selectedElements).some(Boolean);

    // Vendors repeater
    const { fields, append: appendVendor, remove: removeVendor } = useFieldArray({
        control,
        name: "form_data.vendors",
    });

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
                    <Text style={{ display: "block", marginTop: 24 }}>What contracts requests (vendors) are you planning to use for your event?</Text>
                    <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                        Add all vendors you will be working with for this event.
                    </Text>
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
                            color: "#ff4d4f",
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
                                <Text>What type of vendor is this?</Text>
                                <Select
                                    {...field}
                                    placeholder="Select vendor type"
                                    style={{ width: "100%", marginTop: 8 }}
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
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />

                    {/* Vendor/Company Name */}
                    <Controller
                        name={`form_data.vendors.${index}.companyName`}
                        control={control}
                        rules={hasVendors ? { required: "Vendor/Company name is required" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <Text>Vendor/Company/Agency Name (N/A if you are not working through a company)</Text>
                                <Input
                                    {...field}
                                    placeholder="Enter vendor or company name, or N/A"
                                    style={{ marginTop: 8 }}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
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
                            <div style={{ marginBottom: 16 }}>
                                <Text>Name(s) of person(s) you are in contact with and/or the person performing</Text>
                                <Input
                                    {...field}
                                    placeholder="Enter contact or performer name"
                                    style={{ marginTop: 8 }}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />

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
                            <div style={{ marginBottom: 16 }}>
                                <Text>Contact Email Address</Text>
                                <Input
                                    {...field}
                                    placeholder="vendor@example.com"
                                    style={{ marginTop: 8 }}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
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
                        rules={hasVendors ? { required: "Contact phone number is required" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <Text>Contact Phone Number</Text>
                                <Input
                                    {...field}
                                    placeholder="(123) 456-7890"
                                    style={{ marginTop: 8 }}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />

                    {/* Have you worked with this vendor before? */}
                    <Controller
                        name={`form_data.vendors.${index}.workedBefore`}
                        control={control}
                        rules={hasVendors ? { required: "Please select an option" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <Text>Have you worked with this vendor before?</Text>
                                <Radio.Group {...field} style={{ display: "block", marginTop: 8 }}>
                                    <Radio value="yes">Yes</Radio>
                                    <Radio value="no">No</Radio>
                                    <Radio value="not_sure">Not Sure</Radio>
                                </Radio.Group>
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
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
                            <div style={{ marginBottom: 16 }}>
                                <Text>Is the vendor a current Drexel student or have they been within the last year?</Text>
                                <Radio.Group {...field} style={{ display: "block", marginTop: 8 }}>
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

                    {/* Payment Amount */}
                    <Controller
                        name={`form_data.vendors.${index}.amount`}
                        control={control}
                        rules={hasVendors ? { required: "Amount is required" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <Text>Amount the vendor is being paid</Text>
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
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />

                    {/* Upload Quote */}
                    <Controller
                        name={`form_data.vendors.${index}.quote_file`}
                        control={control}
                        render={({ field }) => (
                            <div style={{ marginBottom: 16 }}>
                                <Text>Please upload official quote from the vendor, if you have received one.</Text>
                                <br />
                                <Upload 
                                    beforeUpload={() => false} 
                                    maxCount={1} 
                                    onChange={(info) => {
                                        const file = info.fileList[0]?.originFileObj;
                                        field.onChange(file);
                                    }}
                                    style={{ marginTop: 8 }}
                                >
                                    <div style={{ cursor: "pointer" }}>
                                        <UploadOutlined /> Click to Upload
                                    </div>
                                </Upload>
                            </div>
                        )}
                    />

                    {/* Description of what vendor is doing */}
                    <Controller
                        name={`form_data.vendors.${index}.description`}
                        control={control}
                        rules={hasVendors ? { required: "Description is required" } : {}}
                        render={({ field, fieldState }) => (
                            <div style={{ marginBottom: 16 }}>
                                <Text>Please give a brief, but detailed description of what exactly this vendor is doing for your event</Text>
                                <Input.TextArea
                                    {...field}
                                    rows={3}
                                    placeholder="Describe vendor services"
                                    style={{ marginTop: 8 }}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
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
                                <Text>Student Organization will provide the following equipment/service (if you are not providing anything please write N/A)</Text>
                                <Input.TextArea
                                    {...field}
                                    rows={2}
                                    placeholder="Enter equipment/services or N/A"
                                    style={{ marginTop: 8 }}
                                />
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4 }}>
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
                                I have read the vendor letter notice and have or will send the letter to my vendor(s).
                            </Checkbox>
                            {fieldState.error && (
                                <div><Text type="danger" style={{ display: "block", marginTop: 4, fontSize: 12 }}>
                                    {fieldState.error.message}
                                </Text></div>
                            )}
                        </div>
                    )}
                />
            )}

            {/* Only show funding questions if NOT a level 0 event and has vendors or elements */}
            {(hasVendors || hasElements) && !level0Confirmed && (
                <>
                    <Text style={{ display: "block", marginTop: 24 }}>How will you be funding your event?</Text>
                    <Controller
                        name="form_data.budget.source"
                        control={control}
                        rules={{ required: "Funding source is required" }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Select {...field} placeholder="Select Funding Source" style={{ width: 240 }}>
                                    <Option value="SAFAC">SAFAC</Option>
                                    <Option value="Rollover">Rollover</Option>
                                    <Option value="Department">Department</Option>
                                    <Option value="FSL">FSL</Option>
                                </Select>
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4 }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />

                    <Text style={{ display: "block", marginTop: 24 }}>What account number will be used to fund this event?</Text>
                    <Controller
                        name="form_data.budget.account_number"
                        control={control}
                        rules={{ required: "Account number is required" }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Input {...field} placeholder="Enter Account Number" style={{ width: 240 }} />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4 }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />
                </>
            )}

            {/* <Text style={{ display: "block", marginTop: 24 }}>28. Cash Handling</Text>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
                <Controller
                    name="form_data.budget.cash_collection.enabled"
                    control={control}
                    render={({ field }) => <Checkbox {...field} checked={field.value}>Collect Cash?</Checkbox>}
                />
                <Controller
                    name="form_data.budget.cash_collection.estimated_amount"
                    control={control}
                    render={({ field }) => <InputNumber {...field} placeholder="Estimated Amount" min={0} />}
                />
            </div> */}
        </div>
    );
}
