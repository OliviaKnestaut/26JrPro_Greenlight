import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Controller, useWatch, useFieldArray } from "react-hook-form";
import { Input, Select, Checkbox, Typography, InputNumber, Button } from "antd";
import { useGetOnCampusQuery } from "~/lib/graphql/generated";
import FieldLabel from "../../../components/FieldLabel";

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
const INITIAL_LIMIT = 500;
const PAGE_SIZE = 500;

export default function OnCampusSection({ control, setValue }: Props) {
    const [allLocations, setAllLocations] = useState<any[]>([]);
    const [currentOffset, setCurrentOffset] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true);
    const isFetchingRef = useRef(false);

    const { data: onCampusData, loading: buildingsLoading, fetchMore } = useGetOnCampusQuery({
        variables: { limit: INITIAL_LIMIT, offset: 0 },
    });

    useEffect(() => {
        if (onCampusData?.locations) {
            setAllLocations(onCampusData.locations);
            if (onCampusData.locations.length < INITIAL_LIMIT) {
                setHasMoreData(false);
            }
        }
    }, [onCampusData]);

    const loadMoreLocations = useCallback(async () => {
        if (!hasMoreData || buildingsLoading || isFetchingRef.current) return;

        isFetchingRef.current = true;
        const nextOffset = currentOffset + PAGE_SIZE;
        try {
            const result = await fetchMore({
                variables: { limit: PAGE_SIZE, offset: nextOffset },
            });

            if (result.data?.locations) {
                const newLocations = result.data.locations;
                setAllLocations((prev) => [...prev, ...newLocations]);
                setCurrentOffset(nextOffset);

                if (newLocations.length < PAGE_SIZE) {
                    setHasMoreData(false);
                }
            }
        } catch (error) {
            console.error("Error loading more locations:", error);
            setHasMoreData(false);
        } finally {
            isFetchingRef.current = false;
        }
    }, [hasMoreData, buildingsLoading, currentOffset, fetchMore]);

    useEffect(() => {
        if (hasMoreData && allLocations.length > 0) {
            loadMoreLocations();
        }
    }, [allLocations.length, hasMoreData, loadMoreLocations]);

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
        allLocations.forEach((loc) => {
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
    }, [allLocations]);

    const capacityFilteredLocations = useMemo(() => {
        if (!attendeeCount) {
            return allLocations;
        }
        return allLocations.filter((loc) => {
            const capacityValue = loc?.maxCapacity?.match(/\d+/g)?.map(Number) ?? [];
            if (capacityValue.length === 0) {
                return true;
            }
            const maxCapacity = Math.max(...capacityValue);
            return maxCapacity >= attendeeCount;
        });
    }, [attendeeCount, allLocations]);

    const buildingOptions = useMemo(() => {
        const names = capacityFilteredLocations
            .map((loc) => loc?.buildingDisplayName)
            .filter((name): name is string => Boolean(name));
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    }, [capacityFilteredLocations]);

    const filteredLocations = useMemo(() => {
        if (!selectedLocation) {
            return [];
        }
        return capacityFilteredLocations.filter(
            (loc) => loc?.buildingDisplayName === selectedLocation
        );
    }, [capacityFilteredLocations, selectedLocation]);

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
    const selectedRoomTitle = useWatch({ control, name: "form_data.location.room_title" });

    const isOutdoor = useMemo(() => {
        if (!selectedLocation || !selectedRoomTitle) return false;

        const loc = allLocations.find(
            l => l.buildingDisplayName === selectedLocation && l.roomTitle === selectedRoomTitle
        );

        if (!loc) return false;

        // 1. Always outdoor by building display name
        if (["Parks & Walks", "Outdoor Recreation"].includes(loc.buildingDisplayName)) return true;

        // 2. Outdoor by building code
        if (["GG", "VIDAS"].includes(loc.buildingCode)) return true;

        // 3. Kelly Hall Lawn special case
        if (loc.roomTitle.toLowerCase().includes("lawn")) return true;

        return false;
    }, [selectedLocation, selectedRoomTitle, allLocations]);

    const isIndoor = !isOutdoor;

    useEffect(() => {
        if (selectedLocation) {
            setValue?.("form_data.location.room_type", undefined);
            setValue?.("form_data.location.room_title", undefined);
            setValue?.("form_data.location.room_setup", undefined);
            setValue?.("form_data.location.furniture", []);
            setValue?.("form_data.location.av_needs", undefined);
            setValue?.("form_data.location.rain_location", undefined);
        }
    }, [selectedLocation, setValue]);

    return (
        <div >
            {/* Q10: Campus Space */}
            <Controller
                name="form_data.location.selected"
                control={control}
                rules={{ required: "Campus space selection is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                        <FieldLabel required>Which campus space will your event be held in?</FieldLabel>
                        <Select
                            {...field}
                            value={field.value}
                            placeholder="Select building and room"
                            style={{ width: 300, marginTop: 8 }}
                            loading={buildingsLoading}
                            status={fieldState.error ? "error" : ""}
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
                        {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                    </div>
                )}
            />

            {/* Select Room Type or Room Title based on maxCapacity and Campus Space Selection*/}
            <div style={{ display: "flex", flexDirection: "row", gap: 16, marginBottom: 16 }}>
                {(isIndoor || isOutdoor) && (
                    <Controller
                        name="form_data.location.room_type"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                    <FieldLabel>What kind of room do you want to use?</FieldLabel>
                                    <Text type="secondary" style={{}}>(Optional)</Text>
                                </div>

                                <Select
                                    {...field}
                                    value={field.value}
                                    placeholder="Select room type (optional)"
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
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                            </div>
                        )}
                    />
                )}

                {(isIndoor || isOutdoor) && (
                    <Controller
                        name="form_data.location.room_title"
                        control={control}
                        rules={{ required: "Room number or title is required" }}
                        render={({ field, fieldState }) => (
                            <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                                <FieldLabel required>What is the room number or title?</FieldLabel>
                                <Select
                                    {...field}
                                    value={field.value}
                                    placeholder="Select room"
                                    style={{ width: 300, marginTop: 8 }}
                                    loading={buildingsLoading}
                                    status={fieldState.error ? "error" : ""}
                                    options={roomTitleOptions.map((title) => ({ value: title, label: title }))}
                                />
                                {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
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
                    rules={{ required: "Campus space alignment explanation is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <FieldLabel>You have selected a special space. Please explain how your event aligns with the values of the space.</FieldLabel>
                            <TextArea
                                {...field}
                                rows={3}
                                placeholder="Explain how your event aligns with the values of the space."
                                style={{ marginTop: 8 }}
                            />
                            {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                        </div>
                    )}
                />
            )}

            {/* Q12: Rain Plan */}
            {isOutdoor && (
                <Controller
                    name="form_data.location.rain_location"
                    control={control}
                    rules={{ required: "Rain plan is required for outdoor events" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 16 }}>
                            <FieldLabel required>You have selected an outdoor space. Please provide a backup plan/location in case of rain.</FieldLabel>
                            <Input {...field} placeholder="What is your backup plan?" style={{ marginTop: 8 }} />
                            {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                        </div>
                    )}
                />
            )}

            {/* Q13: Room Setup */}
            {(isIndoor || isOutdoor) && (
                <Controller
                    name="form_data.location.room_setup"
                    control={control}
                    render={({ field }) => (
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                            <FieldLabel>Will your room need any additional setup?</FieldLabel>
                            <Text type="secondary" style={{}}>(Optional)</Text>
                            <Select {...field} value={field.value} placeholder="Select room setup" style={{ width: 300, marginTop: 8 }}>
                                {indoorRoomOptions.map((opt) => (
                                    <Option key={opt} value={opt}>{opt}</Option>
                                ))}
                            </Select>
                        </div>
                    )}
                />
            )}

            {/* Q14: Furniture Repeater */}
            {(isIndoor || isOutdoor) && (
                <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                        <FieldLabel>Will your event require any additional furniture?</FieldLabel>
                        <Text type="secondary" style={{}}>(Optional)</Text>
                    </div>
                    {furnitureFields.map((f, index) => (
                        <div key={f.id} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <Controller
                                name={`form_data.location.furniture.${index}.type`}
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} value={field.value} placeholder="Furniture Type" style={{ width: "25%" }}>
                                        {furnitureOptions.map((opt) => (
                                            <Option key={opt} value={opt}>{opt}</Option>
                                        ))}
                                    </Select>
                                )}
                            />
                            <Controller
                                name={`form_data.location.furniture.${index}.quantity`}
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        {...field}
                                        min={1}
                                        placeholder="Qty"
                                        style={{ width: "12.5%" }}
                                    />
                                )}
                            />
                            <Button type="link" onClick={() => remove(index)}>
                                Remove
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="dashed"
                        onClick={() => append({ type: undefined, quantity: 1 })}
                        style={{ marginTop: 8, width: "50%" }}
                    >
                        + Add Furniture
                    </Button>
                </div>
            )}

            {/* Q15: A/V Needs */}
            {isIndoor && (
                <Controller
                    name="form_data.location.av_needs"
                    control={control}
                    render={({ field }) => (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                <FieldLabel>What A/V equipment will you need?</FieldLabel>
                                <Text type="secondary" style={{}}>(Optional)</Text>
                            </div>
                            <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Select all that apply</Text>
                            <Checkbox.Group
                                options={avOptions}
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                style={{ display: "flex", flexDirection: "column" }}
                            />
                        </div>
                    )}
                />
            )}
        </div>
    );
}

