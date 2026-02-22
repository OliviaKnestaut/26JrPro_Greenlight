import { Controller, useWatch } from "react-hook-form";
import { Checkbox, Typography, Alert } from "antd";

const { Text } = Typography;

type Props = {
    control: any;
};

export default function EventElementsSection({ control }: Props) {
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
    
    const noAdditionalElements = selectedElements?.no_additional_elements;
    
    // Watch for level 0 confirmation
    const level0Confirmed = useWatch({
        control,
        name: "form_data.level0_confirmed",
    });

    return (
        <>
            <Controller
                name="form_data.elements"
                control={control}
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
                            <Text>Which of the following apply to your event?</Text>
                            <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
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
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    );
                }}
            />

            {/* Level 0 Confirmation - shows when no additional elements is checked */}
            {noAdditionalElements && (
                <Controller
                    name="form_data.level0_confirmed"
                    control={control}
                    rules={{ 
                        required: "You must confirm this is a level 0 event",
                        validate: (value) => value === true || "Please confirm to proceed"
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
                                                Yes, I confirm this is a level 0 event
                                            </Checkbox>
                                        </div>
                                        {fieldState.error && (
                                            <Text type="danger" style={{ display: "block", marginTop: 8 }}>
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
        </>
    );
}

