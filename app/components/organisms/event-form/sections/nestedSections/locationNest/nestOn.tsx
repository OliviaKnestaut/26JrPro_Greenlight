import { useMemo } from "react";
import { Controller, useWatch, useFieldArray } from "react-hook-form";
import { Input, Select, Checkbox, Typography, InputNumber, Button } from "antd";
import { useGetOnCampusQuery } from "~/lib/graphql/generated";

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

type Props = {
    control: any;
    setValue?: (name: string, value: any, options?: { shouldDirty?: boolean; shouldValidate?: boolean }) => void;
};

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
const fallbackBuildings = [
    "Lindy Center",
    "Dornsife Center",
    "Center for Black Culture",
    "SCDI",
    "Graduate Student Lounge",
    "Outdoor Quad",
];
const BIG_LIMIT = 100000;

export default function OnCampusSection({ control, setValue }: Props) {
    const { data: onCampusData, loading: buildingsLoading } = useGetOnCampusQuery({
        variables: { limit: BIG_LIMIT, offset: 0 },
    });
    const selectedLocation = useWatch({ control, name: "form_data.location.selected" });
    const selectedRoomType = useWatch({ control, name: "form_data.location.room_type" });
    const attendeeCountRaw = useWatch({ control, name: "attendees" });
    const attendeeCountNested = useWatch({ control, name: "form_data.event.attendees" });
    const { fields: furnitureFields, append, remove } = useFieldArray({
        control,
        name: "form_data.location.furniture",
    });

    const attendeeCount = useMemo(() => {
        const value = attendeeCountRaw ?? attendeeCountNested;
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [attendeeCountRaw, attendeeCountNested]);

    const specialSpacesList = useMemo(() => {
        const spaces = new Set<string>();
        (onCampusData?.locations ?? []).forEach((loc) => {
            const buildingCode = loc?.buildingCode?.toUpperCase();
            const roomTitle = loc?.roomTitle?.toLowerCase();
            const buildingDisplayName = loc?.buildingDisplayName;

            if (
                buildingCode === "DORNCH" ||
                buildingCode === "DORNRH" ||
                roomTitle?.includes("center for black culture") ||
                roomTitle?.includes("graduate student lounge")
            ) {
                if (buildingDisplayName) {
                    spaces.add(buildingDisplayName);
                }
            }
        });
        return Array.from(spaces);
    }, [onCampusData]);

    const buildingOptions = useMemo(() => {
        const locations = onCampusData?.locations ?? [];
        const capacityFiltered = attendeeCount
            ? locations.filter((loc) => {
                const capacityValue = loc?.maxCapacity?.match(/\d+/g)?.map(Number) ?? [];
                if (capacityValue.length === 0) {
                    return true;
                }
                const maxCapacity = Math.max(...capacityValue);
                return maxCapacity >= attendeeCount;
            })
            : locations;

        const names = capacityFiltered
            .map((loc) => loc?.buildingDisplayName)
            .filter((name): name is string => Boolean(name));
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    }, [attendeeCount, onCampusData]);

    const filteredLocations = useMemo(() => {
        if (!selectedLocation) {
            return [];
        }

        const matchingLocations = (onCampusData?.locations ?? []).filter(
            (loc) => loc?.buildingDisplayName === selectedLocation
        );

        if (!attendeeCount) {
            return matchingLocations;
        }

        return matchingLocations.filter((loc) => {
            const capacityValue = loc?.maxCapacity?.match(/\d+/g)?.map(Number) ?? [];
            if (capacityValue.length === 0) {
                return true;
            }
            const maxCapacity = Math.max(...capacityValue);
            return maxCapacity >= attendeeCount;
        });
    }, [attendeeCount, onCampusData, selectedLocation]);

    const roomTypeOptions = useMemo(() => {
        const types = filteredLocations
            .map((loc) => loc?.roomType)
            .filter((type): type is string => Boolean(type));
        return Array.from(new Set(types)).sort((a, b) => a.localeCompare(b));
    }, [filteredLocations]);

    const roomTitleOptions = useMemo(() => {
        const scopedLocations = selectedRoomType
            ? filteredLocations.filter((loc) => loc?.roomType === selectedRoomType)
            : filteredLocations;
        const titles = scopedLocations
            .map((loc) => loc?.roomTitle)
            .filter((title): title is string => Boolean(title));
        return Array.from(new Set(titles)).sort((a, b) => a.localeCompare(b));
    }, [filteredLocations, selectedRoomType]);

    const isSpecialSpace = specialSpacesList.includes(selectedLocation);
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
                        <Select
                            {...field}
                            placeholder="Select building and room"
                            style={{ width: 300 }}
                            loading={buildingsLoading}
                            onChange={(value) => {
                                field.onChange(value);
                                setValue?.("form_data.location.room_type", undefined, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                                setValue?.("form_data.location.room_title", undefined, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                        >
                            {(buildingOptions.length ? buildingOptions : fallbackBuildings).map((opt) => (
                                <Option key={opt} value={opt}>{opt}</Option>
                            ))}
                        </Select>
                    </div>
                )}
            />

            {/* Select Room Type or Room Title based on maxCapacity and Campus Space Selection*/}
            <div style={{ display: "flex", flexDirection: "row", gap: 16, marginBottom: 16 }}>
                {(isIndoor || isOutdoor) && (
                    <Controller
                        name="form_data.location.room_type"
                        control={control}
                        render={({ field }) => (
                            <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                                <Text>What kind of room do you want to use?</Text>
                                <Select
                                    {...field}
                                    placeholder="Select room type"
                                    style={{ width: 300 }}
                                    loading={buildingsLoading}
                                    options={roomTypeOptions.map((type) => ({ value: type, label: type }))}
                                    onChange={(value) => {
                                        field.onChange(value);
                                        setValue?.("form_data.location.room_title", undefined, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        });
                                    }}
                                />
                            </div>
                        )}
                    />
                )}

                {(isIndoor || isOutdoor) && (
                    <Controller
                        name="form_data.location.room_title"
                        control={control}
                        render={({ field }) => (
                            <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                                <Text>What is the room number or title?</Text>
                                <Select
                                    {...field}
                                    placeholder="Select room"
                                    style={{ width: 300 }}
                                    loading={buildingsLoading}
                                    options={roomTitleOptions.map((title) => ({ value: title, label: title }))}
                                />
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Q11: Space Alignment Statement */}
            {isSpecialSpace && (
                <Controller
                    name="form_data.location.special_space_alignment"
                    control={control}
                    render={({ field }) => (
                        <div style={{ marginBottom: 16 }}>
                            <Text>You have selected a special space. Please explain how your event aligns with the values of the space.</Text>
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
                            <Text>You have selected an outdoor space. Please provide a backup plan/location in case of rain.</Text>
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
                            <Text>Will your room need any additional setup?</Text>
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
                    <Text>Will your event require any additional furniture?</Text>
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
                        <Text>Will your event require any A/V equipment?</Text>
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
                        <Checkbox {...field} checked={field.value}>Will you need electrical power beyond standard outlets?</Checkbox>
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