import { Controller, useWatch } from "react-hook-form";
import { Input, Checkbox, Typography, Alert, Collapse, Tag } from "antd";
import { InfoCircleOutlined, WarningOutlined, CheckCircleOutlined } from "@ant-design/icons";
import FieldLabel from "../../components/FieldLabel";
import { useEffect } from "react";

const { Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

type Props = {
    control: any;
    setValue: any;
};

export default function NonVendorCosts({ control, setValue }: Props) {
    // Watch form fields to auto-select services
    const elements = useWatch({ control, name: "form_data.elements" });
    const locationType = useWatch({ control, name: "location_type" });
    const locationData = useWatch({ control, name: "form_data.location" });
    const attendees = useWatch({ control, name: "attendees" });
    const level0Confirmed = useWatch({ control, name: "form_data.level0_confirmed" });
    
    // Watch selected services to show account info section
    const selectedServices = useWatch({
        control,
        name: "form_data.non_vendor_services",
    });

    // Auto-select services based on other form selections
    useEffect(() => {
        const updates: Record<string, boolean> = {};
        let hasUpdates = false;

        // Auto-select SORC Equipment if SORC Games is selected
        if (elements?.sorc_games && !selectedServices?.sorc_equipment_rental) {
            updates.sorc_equipment_rental = true;
            hasUpdates = true;
        }

        // Auto-select Minor Background Checks if Minors Present is selected
        if (elements?.minors && !selectedServices?.minor_clearances) {
            updates.minor_clearances = true;
            hasUpdates = true;
        }

        // Auto-select A/V Support if Movies/Media is selected
        if (elements?.movies && !selectedServices?.av_support) {
            updates.av_support = true;
            hasUpdates = true;
        }

        // Auto-select Custodial & Public Safety for:
        // - Alcohol events
        // - Large events (100+ attendees)
        // - Events with minors
        const needsSafetyCustodial = 
            elements?.alcohol || 
            (attendees && parseInt(attendees) >= 100) ||
            elements?.minors;
            
        if (needsSafetyCustodial && !selectedServices?.custodial_safety) {
            updates.custodial_safety = true;
            hasUpdates = true;
        }

        // Auto-select Rec Athletics Staff for specific venues
        if (locationType === "On-Campus" && locationData?.selected) {
            const requiresAthleticsStaff = ["Vidas", "DAC", "Daskalakis Athletic Center"].some(
                venue => locationData.selected?.includes(venue)
            );
            if (requiresAthleticsStaff && !selectedServices?.rec_athletics_staff) {
                updates.rec_athletics_staff = true;
                hasUpdates = true;
            }
        }

        // Auto-select Athletics Space Fee if using athletics facilities
        if (locationType === "On-Campus" && locationData?.selected) {
            const athleticsBuildings = ["DAC", "Daskalakis Athletic Center", "Vidas", "Recreation Center"];
            if (athleticsBuildings.some(building => locationData.selected?.includes(building))) {
                if (!selectedServices?.athletics_space) {
                    updates.athletics_space = true;
                    hasUpdates = true;
                }
            }
        }

        // Apply updates if any
        if (hasUpdates) {
            Object.entries(updates).forEach(([key, value]) => {
                setValue(`form_data.non_vendor_services.${key}`, value);
            });
        }
    }, [elements, locationType, locationData, attendees, selectedServices, setValue]);

    const hasSelectedServices = selectedServices && Object.values(selectedServices).some(Boolean);

    // Helper to check if a service was auto-selected
    const isAutoSelected = (serviceValue: string): boolean => {
        if (serviceValue === "sorc_equipment_rental" && elements?.sorc_games) return true;
        if (serviceValue === "minor_clearances" && elements?.minors) return true;
        if (serviceValue === "av_support" && elements?.movies) return true;
        
        if (serviceValue === "custodial_safety") {
            return elements?.alcohol || 
                   (attendees && parseInt(attendees) >= 100) ||
                   elements?.minors;
        }
        
        if (serviceValue === "rec_athletics_staff" && locationType === "On-Campus") {
            const requiresAthleticsStaff = ["Vidas", "DAC", "Daskalakis Athletic Center"].some(
                venue => locationData?.selected?.includes(venue)
            );
            return requiresAthleticsStaff;
        }
        
        if (serviceValue === "athletics_space" && locationType === "On-Campus") {
            const athleticsBuildings = ["DAC", "Daskalakis Athletic Center", "Vidas", "Recreation Center"];
            return athleticsBuildings.some(building => locationData?.selected?.includes(building));
        }
        
        return false;
    };

    // Service categories with detailed descriptions
    const serviceCategories = [
        {
            category: "SORC Equipment & Penalty Fees",
            description: "These fees apply to any organization borrowing gear from the Student Organization Resource Center.",
            warning: "Fees are charged AFTER the event if policies are violated",
            items: [
                { 
                    value: "sorc_equipment_rental", 
                    label: "SORC Equipment Reservation",
                    details: "Late Return Fee: $25/day | No-Call No-Show: $25 | Cleaning Fee: $100 | Damage/Replacement: varies",
                    autoReason: "Auto-applied because you selected 'SORC Games' in event elements"
                },
            ]
        },
        {
            category: "Event Support & Staffing",
            description: "These are costs that often trigger a Level 2 or Level 3 status.",
            warning: "Actual costs will be determined and communicated by the department",
            items: [
                { 
                    value: "rec_athletics_staff", 
                    label: "Rec Athletics Staff",
                    details: "Intramural Officials, Game Staff, Supervisors, or Building Managers (mandatory charges apply)",
                    autoReason: "Auto-applied because your event is at Vidas or DAC"
                },
                { 
                    value: "av_support", 
                    label: "A/V Support Packages",
                    details: "Full service packages like Outdoor Movie Service or Mitchell Auditorium Support",
                    autoReason: "Auto-applied because you selected 'Movies/TV/Copyrighted Media' in event elements"
                },
                { 
                    value: "custodial_safety", 
                    label: "Custodial & Public Safety",
                    details: "Large-scale events or those with specific setup needs may require these services",
                    autoReason: "Auto-applied for alcohol events, large events (100+ attendees), or events with minors"
                },
                { 
                    value: "minor_clearances", 
                    label: "Minor Background Checks",
                    details: "Background checks for students working with children (charged to 17 or 19-account)",
                    autoReason: "Auto-applied because you selected 'Minors Present' in event elements"
                },
            ]
        },
        {
            category: "Space & Equipment Add-ons",
            description: "Additional space reservation or equipment rental fees",
            warning: "Fees vary by space and equipment type",
            items: [
                { 
                    value: "athletics_space", 
                    label: "Athletics Space Reservation",
                    details: "As of July 2022, many Athletics spaces have a base reservation fee",
                    autoReason: "Auto-applied because you selected an Athletics facility (DAC, Vidas, Recreation Center)"
                },
                { 
                    value: "non_standard_equipment", 
                    label: "Non-Standard Equipment",
                    details: "Anything not on the standard list (specialized pipe & drape, stages, etc.)",
                    autoReason: ""
                },
            ]
        }
    ];

    // Helper to get dynamic auto-reason
    const getAutoReason = (serviceValue: string): string => {
        if (serviceValue === "custodial_safety") {
            const reasons = [];
            if (elements?.alcohol) reasons.push("alcohol is being served");
            if (elements?.minors) reasons.push("minors are present");
            if (attendees && parseInt(attendees) >= 100) reasons.push("large event (100+ attendees)");
            if (reasons.length > 0) {
                return `Auto-applied because ${reasons.join(", ")}`;
            }
        }
        
        const category = serviceCategories.find(cat => 
            cat.items.some(item => item.value === serviceValue)
        );
        const item = category?.items.find(item => item.value === serviceValue);
        return item?.autoReason || "";
    };

    // Check if any services were auto-selected
    const hasAutoSelectedServices = selectedServices && Object.keys(selectedServices).some(key => 
        selectedServices[key] && isAutoSelected(key)
    );

    // Check if a specific category has auto-selected services
    const categoryHasAutoSelected = (category: typeof serviceCategories[0]): boolean => {
        return category.items.some(item => 
            selectedServices?.[item.value] && isAutoSelected(item.value)
        );
    };

    // Check if a specific category has ANY selected services (auto or manual)
    const categoryHasSelected = (category: typeof serviceCategories[0]): boolean => {
        return category.items.some(item => selectedServices?.[item.value]);
    };

    return (
        <div style={{ marginTop: 24 }}>
            {/* Alert when services are auto-applied */}
            {hasAutoSelectedServices && (
                <Alert
                    message="Services Automatically Added"
                    description="Based on your event details, we've automatically selected some services that may incur costs. Review the selections below and provide any additional details needed."
                    type="success"
                    showIcon
                    icon ={<CheckCircleOutlined />}
                    style={{ 
                        marginBottom: 16,
                        backgroundColor: "var(--sage-1)",
                        borderColor: "var(--sage-6)"
                    }}
                />
            )}
            
            {/* Alert when NO services are auto-applied - only for non-level-0 events */}
            {!level0Confirmed && !hasAutoSelectedServices && !hasSelectedServices && (
                <Alert
                    message="No Additional Costs Detected"
                    description={
                        <div>
                            <Text style={{ display: "block", marginBottom: 8 }}>
                                Based on your event details, no additional service costs have been automatically identified. 
                                Costs are automatically applied when certain requirements are detected.
                            </Text>
                            <Text>
                                If you need additional staff, equipment, or services not already covered in your event plan, 
                                please select them below.
                            </Text>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ 
                        marginBottom: 16,
                        backgroundColor: "var(--blue-1)",
                        borderColor: "var(--blue-5)"
                    }}
                />
            )}
            
            <FieldLabel>Services & Resources That May Incur Costs</FieldLabel>
            <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 16 }}>
                Select any services or resources your event will use. These don't require vendor contracts but may result in charges to your organization's account.
            </Text>

            {/* Service Selection by Category */}
            <Collapse
                defaultActiveKey={
                    hasSelectedServices 
                        ? serviceCategories.map((_, idx) => idx).filter(idx => categoryHasSelected(serviceCategories[idx]))
                        : []
                }
                style={{ marginBottom: 24 }}
                expandIconPosition="end"
            >
                {serviceCategories.map((category, idx) => {
                    const hasAutoInCategory = categoryHasAutoSelected(category);
                    const hasSelectedInCategory = categoryHasSelected(category);
                    return (
                        <Panel 
                            header={
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <InfoCircleOutlined />
                                    <Text style={{ color: "var(--green-12)" }} strong>{category.category}</Text>
                                    {hasAutoInCategory && (
                                        <Tag icon={<CheckCircleOutlined />} style={{ marginLeft: 8, backgroundColor: "var(--sage-1)", borderColor: "var(--sage-6)" }}>
                                            Auto-applied
                                        </Tag>
                                    )}
                                </div>
                            } 
                            key={idx}
                            style={{
                                backgroundColor: hasSelectedInCategory ? "var(--sage-1)" : "transparent",
                                border: hasSelectedInCategory ? "2px solid var(--sage-6)" : undefined,
                                borderRadius: hasSelectedInCategory ? 8 : undefined,
                                marginBottom: 8
                            }}
                        >
                            <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                                {category.description}
                            </Text>
                            <Alert
                                message={category.warning}
                                type="warning"
                                showIcon
                                icon={<WarningOutlined />}
                                style={{ marginBottom: 16 }}
                            />
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {category.items.map((item) => (
                                <Controller
                                    key={item.value}
                                    name={`form_data.non_vendor_services.${item.value}`}
                                    control={control}
                                    render={({ field }) => {
                                        const autoSelected = isAutoSelected(item.value);
                                        return (
                                            <div style={{ 
                                                padding: 12, 
                                                border: "1px solid var(--gray-5)", 
                                                borderRadius: 4,
                                                backgroundColor: field.value ? "var(--sage-1)" : "transparent",
                                                borderColor: field.value ? "var(--sage-6)" : "var(--gray-5)"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <Checkbox 
                                                        {...field}
                                                        checked={field.value}
                                                    >
                                                        <Text strong>{item.label}</Text>
                                                    </Checkbox>
                                                    {autoSelected && (
                                                        <Tag color="green" icon={<CheckCircleOutlined />}>
                                                            Auto-applied
                                                        </Tag>
                                                    )}
                                                </div>
                                                <Text 
                                                    type="secondary" 
                                                    style={{ display: "block", marginLeft: 24, marginTop: 4, fontSize: 12 }}
                                                >
                                                    {item.details}
                                                </Text>
                                                {autoSelected && (
                                                    <Text 
                                                        type="secondary" 
                                                        style={{ display: "block", marginLeft: 24, marginTop: 4, fontSize: 11, fontStyle: "italic" }}
                                                    >
                                                        {getAutoReason(item.value)}
                                                    </Text>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    </Panel>
                );
                })}
            </Collapse>

            {/* Additional Notes - only if services selected */}
            {hasSelectedServices && (
                <>
                    <Controller
                        name="form_data.non_vendor_services_notes"
                        control={control}
                        render={({ field }) => (
                            <div style={{ marginTop: 16, marginBottom: 16 }}>
                                <FieldLabel>
                                    Additional Notes or Special Requirements
                                </FieldLabel>
                                <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 8 }}>
                                    Optional - Provide any additional details about the services you need
                                </Text>
                                <TextArea
                                    {...field}
                                    rows={3}
                                    placeholder="e.g., Specific equipment needed, estimated number of staff, setup requirements..."
                                />
                            </div>
                        )}
                    />

                    {/* Acknowledgment Checkbox */}
                    <Controller
                        name="form_data.non_vendor_services_acknowledged"
                        control={control}
                        rules={{ 
                            required: "You must acknowledge understanding of potential charges",
                            validate: (value) => value === true || "You must check this box to proceed"
                        }}
                        render={({ field, fieldState }) => (
                            <div style={{ 
                                marginTop: 16,
                                padding: 12, 
                                backgroundColor: "var(--gold-1)", 
                                border: "1px solid var(--gold-5)",
                                borderRadius: 4 
                            }}>
                                <Checkbox 
                                    {...field}
                                    checked={field.value}
                                >
                                    <Text strong>
                                        I understand that my organization may be charged for the services selected above, and the actual costs will be determined based on usage, violations, or services rendered. <span style={{ color: "var(--red-5)" }}>*</span>
                                    </Text>
                                </Checkbox>
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, marginLeft: 24, color: "var(--red-6)" }}>
                                        {fieldState.error.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />
                </>
            )}
        </div>
    );
}

