import { Controller } from "react-hook-form";
import { Checkbox, Typography } from "antd";

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
    ];

    return (
        <Controller
            name="form_data.elements"
            control={control}
            rules={{
                validate: (val) =>
                    val && Object.values(val).some(Boolean) || "At least one element must be selected"
            }}
            render={({ field, fieldState }) => {
                // Convert the object to an array of selected keys for the Checkbox.Group
                const selectedKeys = Object.keys(field.value || {}).filter(
                    (key) => field.value[key]
                );

                const onChange = (checkedValues: string[]) => {
                    // Convert back to object mapping for form_data.elements
                    const updated = elementOptions.reduce((acc, option) => {
                        acc[option.value] = checkedValues.includes(option.value);
                        return acc;
                    }, {} as Record<string, boolean>);

                    field.onChange(updated);
                };

                return (
                    <div style={{ marginBottom: 24 }}>
                        <Text>Which of the following apply to your event?</Text>
                        <Checkbox.Group
                            value={selectedKeys}
                            options={elementOptions}
                            onChange={onChange}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                );
            }}
        />
    );
}

