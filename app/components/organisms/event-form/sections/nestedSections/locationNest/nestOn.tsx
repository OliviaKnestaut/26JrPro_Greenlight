import { Controller, useWatch, useFieldArray } from "react-hook-form";
import { Input, Select, Checkbox, Typography, InputNumber, Button } from "antd";

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

type Props = {
    control: any;
};

const specialSpaces = [
    "Lindy Center",
    "Dornsife Center",
    "Center for Black Culture",
    "SCDI",
    "Graduate Student Lounge",
];

const indoorRoomOptions = [
    "Auditorium/Theater",
    "Classroom",
    "Conference/Boardroom",
    "Circle",
    "U-Shape",
    "Vendor/Fair",
    "Empty/Open Space",
];

const furnitureOptions = [
    "Chairs",
    "Banquet Tables",
    "Cocktail Tables",
    "Podium",
    "Stage",
    "Pipe & Drape",
];

const avOptions = ["Projector", "Microphone(s)", "Speakers", "Laptop / HDMI hookup"];

export default function OnCampusSection({ control }: Props) {
    const selectedLocation = useWatch({ control, name: "form_data.location.selected" });
    const { fields: furnitureFields, append, remove } = useFieldArray({
        control,
        name: "form_data.location.furniture",
    });

    const isSpecialSpace = specialSpaces.includes(selectedLocation);
    const isOutdoor = selectedLocation?.toLowerCase().includes("outdoor"); // simple example
    const isIndoor = !isOutdoor;

    return (
        <div style={{ marginTop: 24 }}>
            {/* Q10: Campus Space */}
            <Controller
                name="form_data.location.selected"
                control={control}
                rules={{ required: "Select a campus space" }}
                render={({ field }) => (
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                        <Text>Which campus space will your event be held in?</Text>
                        <Select {...field} placeholder="Select building and room" style={{ width: 300 }}>
                            <Option value="Lindy Center">Lindy Center</Option>
                            <Option value="Dornsife Center">Dornsife Center</Option>
                            <Option value="Center for Black Culture">Center for Black Culture</Option>
                            <Option value="SCDI">SCDI</Option>
                            <Option value="Graduate Student Lounge">Graduate Student Lounge</Option>
                            <Option value="Outdoor Quad">Outdoor Quad</Option>
                        </Select>
                    </div>
                )}
            />

            {/* Q11: Space Alignment Statement */}
            {isSpecialSpace && (
                <Controller
                    name="form_data.location.special_space_alignment"
                    control={control}
                    render={({ field }) => (
                        <div style={{ marginBottom: 16 }}>
                            <Text>Space Alignment Statement</Text>
                            <TextArea
                                {...field}
                                rows={3}
                                placeholder="Explain how your event aligns with the values of the space."
                            />
                        </div>
                    )}
                />
            )}

            {/* Q12: Rain Plan */}
            {isOutdoor && (
                <Controller
                    name="form_data.location.rain_location"
                    control={control}
                    render={({ field }) => (
                        <div style={{ marginBottom: 16 }}>
                            <Text>Rain Plan / Backup Location</Text>
                            <Input {...field} placeholder="What is your backup plan?" />
                        </div>
                    )}
                />
            )}

            {/* Q13: Room Setup */}
            {isIndoor && (
                <Controller
                    name="form_data.location.room_setup"
                    control={control}
                    render={({ field }) => (
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                            <Text>Room Setup</Text>
                            <Select {...field} placeholder="Select room setup" style={{ width: 300 }}>
                                {indoorRoomOptions.map((opt) => (
                                    <Option key={opt} value={opt}>{opt}</Option>
                                ))}
                            </Select>
                        </div>
                    )}
                />
            )}

            {/* Q14: Furniture Repeater */}
            {isIndoor && (
                <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                    <Text>Furniture Needed</Text>
                    {furnitureFields.map((f, index) => (
                        <div key={f.id} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <Controller
                                name={`form_data.location.furniture.${index}.type`}
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} placeholder="Furniture Type" style={{ width: 180 }}>
                                        {furnitureOptions.map((opt) => (
                                            <Option key={opt} value={opt}>{opt}</Option>
                                        ))}
                                    </Select>
                                )}
                            />
                            <Controller
                                name={`form_data.location.furniture.${index}.quantity`}
                                control={control}
                                render={({ field }) => <InputNumber {...field} placeholder="Quantity" min={1} />}
                            />
                            <Button danger onClick={() => remove(index)}>Remove</Button>
                        </div>
                    ))}
                    <Button type="dashed" onClick={() => append({ type: "", quantity: 1 })} style={{ marginTop: 8 }}>
                        Add Furniture
                    </Button>
                </div>
            )}

            {/* Q15: AV Equipment */}
            <Controller
                name="form_data.av"
                control={control}
                render={({ field }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>A/V Equipment Needed</Text>
                        <Checkbox.Group {...field} options={avOptions} />
                    </div>
                )}
            />

            {/* Q16: Power */}
            <Controller
                name="form_data.utilities.power_required"
                control={control}
                render={({ field }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Checkbox {...field} checked={field.value}>Electrical power beyond standard outlets?</Checkbox>
                    </div>
                )}
            />

            {/* Q16a: Power Details */}
            {useWatch({ control, name: "form_data.utilities.power_required" }) && (
                <Controller
                    name="form_data.utilities.power_details"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} placeholder="Specify amperage or wattage requirements" />
                    )}
                />
            )}

            {/* Q17: Outdoor Water */}
            {isOutdoor && (
                <Controller
                    name="form_data.utilities.water_required"
                    control={control}
                    render={({ field }) => (
                        <Checkbox {...field} checked={field.value}>Will you need outdoor water access?</Checkbox>
                    )}
                />
            )}
        </div>
    );
}