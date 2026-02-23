import { Controller, useWatch } from "react-hook-form";
import { Checkbox, Typography, Alert } from "antd";
import FieldLabel from "../components/FieldLabel";
import { useEffect } from "react";

const { Text } = Typography;

type Props = {
    control: any;
    setValue: any;
};

export default function EventElementsSection({ control, setValue }: Props) {
    // Define checkbox options
    const elementOptions = [
        { label: "Food", value: "food" },
        { label: "Alcohol", value: "alcohol" },
        { label: "Minors Present", value: "minors" },
        { label: "Movies / TV / Copyrighted Media", value: "movies" },
        { label: "Raffles or Prizes", value: "raffles" },
        { label: "Fire Pits or Grills", value: "fire" },
        { label: "SORC Games", value: "sorc_games" },
        { label: "This event requires no additional elements", value: "no_additional_elements" },
    ];

    // Watch for elements to check if no_additional_elements is selected
    const selectedElements = useWatch({
        control,
        name: "form_data.elements",
    });
    
    // Watch for location type and attendees (affects Level 0 eligibility)
    const locationType = useWatch({
        control,
        name: "location_type",
    });
    
    const attendees = useWatch({
        control,
        name: "attendees",
    });
    
    const noAdditionalElements = selectedElements?.no_additional_elements;
    
    // Check if any OTHER elements are selected (which would make it NOT level 0)
    const hasOtherElements = selectedElements && Object.keys(selectedElements).some(
        key => key !== "no_additional_elements" && selectedElements[key] === true
    );
    
    // Check if location is off-campus (Level 1+)
    const isOffCampus = locationType === "Off-Campus";
    
    // Check if attendees >= 150 (Level 2+)
    const hasHighAttendance = attendees && parseInt(attendees) >= 150;
    
    // Combined check: event is NOT eligible for Level 0 if any disqualifying factors exist
    const hasLevel0Conflicts = hasOtherElements || isOffCampus || hasHighAttendance;
    
    // Watch for level 0 confirmation
    const level0Confirmed = useWatch({
        control,
        name: "form_data.level0_confirmed",
    });

    // Clear level 0 confirmation if user adds disqualifying factors
    useEffect(() => {
        if (hasLevel0Conflicts && level0Confirmed) {
            setValue("form_data.level0_confirmed", false);
        }
    }, [hasLevel0Conflicts, level0Confirmed, setValue]);

    return (
        <>
            <Controller
                name="form_data.elements"
                control={control}
                rules={{
                    validate: (value) => {
                        const hasSelection = value && Object.values(value).some(Boolean);
                        return hasSelection || "Please select at least one option";
                    }
                }}
                render={({ field, fieldState }) => {
                    // Convert the object to an array of selected keys for the Checkbox.Group
                    const selectedKeys = Object.keys(field.value || {}).filter(
                        (key) => field.value[key]
                    );

                    const onChange = (checkedValues: string[]) => {
                        // If "no_additional_elements" is checked, clear all other selections
                        if (checkedValues.includes("no_additional_elements")) {
                            const updated = elementOptions.reduce((acc, option) => {
                                acc[option.value] = option.value === "no_additional_elements";
                                return acc;
                            }, {} as Record<string, boolean>);
                            field.onChange(updated);
                        } else {
                            // Convert back to object mapping for form_data.elements
                            const updated = elementOptions.reduce((acc, option) => {
                                acc[option.value] = checkedValues.includes(option.value);
                                return acc;
                            }, {} as Record<string, boolean>);
                            field.onChange(updated);
                        }
                    };

                    return (
                        <div style={{ marginBottom: 24 }}>
                            <FieldLabel required>Which of the following apply to your event?</FieldLabel>
                            <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 8 }}>
                                Select all that apply
                            </Text>
                            <div style={{ 
                                display: "flex", 
                                flexDirection: "column",
                                padding: fieldState.error ? 12 : 0,
                                border: fieldState.error ? "1px solid var(--red-6)" : "none",
                                borderRadius: fieldState.error ? 4 : 0,
                                backgroundColor: fieldState.error ? "var(--red-1)" : "transparent"
                            }}>
                                {elementOptions.map((option) => {
                                    const isNoElementsOption = option.value === "no_additional_elements";
                                    const isDisabled = !isNoElementsOption && noAdditionalElements;
                                    
                                    return (
                                        <Checkbox
                                            key={option.value}
                                            checked={selectedKeys.includes(option.value)}
                                            disabled={isDisabled}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    onChange([...selectedKeys, option.value]);
                                                } else {
                                                    onChange(selectedKeys.filter(k => k !== option.value));
                                                }
                                            }}
                                        >
                                            {option.label}
                                        </Checkbox>
                                    );
                                })}
                            </div>
                            {fieldState.error && (
                                <Text type="danger" style={{ display: "block", marginTop: 8, fontWeight: 500, color: "var(--red-6)" }}>
                                    {fieldState.error.message}
                                </Text>
                            )}
                        </div>
                    );
                }}
            />

            {/* Level 0 Confirmation - shows when ONLY no additional elements is checked */}
            {noAdditionalElements && !hasLevel0Conflicts && (
                <Controller
                    name="form_data.level0_confirmed"
                    control={control}
                    rules={{ 
                        required: "You must confirm this is a level 0 event",
                        validate: (value) => value === true || "Please check the box to confirm"
                    }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 24 }}>
                            <Alert
                                message="Level 0 Event Confirmation"
                                description={
                                    <div>
                                        <Text>
                                            You have indicated your event requires no extra elements (food, alcohol, etc.) and no travel. 
                                            Can you confirm this is a level 0 event?
                                        </Text>
                                        <div style={{ marginTop: 12 }}>
                                            <Checkbox 
                                                {...field} 
                                                checked={field.value}
                                            >
                                                Yes, I confirm this is a level 0 event <span style={{ color: "var(--red-5)" }}>*</span>
                                            </Checkbox>
                                        </div>
                                        {fieldState.error && (
                                            <Text type="danger" style={{ display: "block", marginTop: 8, color: "var(--red-6)" }}>
                                                {fieldState.error.message}
                                            </Text>
                                        )}
                                    </div>
                                }
                                type="warning"
                                showIcon
                            />
                        </div>
                    )}
                />
            )}
            
            {/* Warning when user has disqualifying factors for Level 0 */}
            {noAdditionalElements && hasLevel0Conflicts && (
                <Alert
                    message="Cannot Be Level 0 Event"
                    description={
                        <div>
                            <Text>This event cannot be classified as Level 0 due to the following:</Text>
                            <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                                {hasOtherElements && <li>Event elements selected (food, alcohol, minors, etc.) require additional resources</li>}
                                {isOffCampus && <li>Off-campus location requires higher event level</li>}
                                {hasHighAttendance && <li>Events with 150+ attendees require higher event level</li>}
                            </ul>
                            <Text>Please unselect "no additional elements" or adjust the conflicting selections.</Text>
                        </div>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}
        </>
    );
}


