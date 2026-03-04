// ─── Third-party ──────────────────────────────────────────────────────────────
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Controller, useWatch, useFieldArray } from "react-hook-form";
import { Input, Select, Checkbox, Typography, InputNumber, Button, Radio } from "antd";

// ─── Local ────────────────────────────────────────────────────────────────────
import { useGetOnCampusQuery } from "~/lib/graphql/generated";
import FieldLabel from "../../../components/FieldLabel";

// ─── Ant Design sub-components ────────────────────────────────────────────────
const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

// =============================================================================
// OnCampusSection
// Nested section inside DateLocationSection — shown when location type is
// "On-Campus". Collects: building/room selection (with capacity filtering and
// pagination), optional room type, room setup, furniture (repeater), A/V needs,
// utilities, rain plan (outdoor), and special-space alignment statement.
// =============================================================================

type Props = {
    control: any;
    setValue?: (name: string, value: any, options?: { shouldDirty?: boolean; shouldValidate?: boolean }) => void;
};

const allRoomSetupOptions = [
    "Auditorium/Theater",
    "Classroom",
    "Conference/Boardroom",
    "Circle",
    "U-Shape",
    "Vendor/Fair",
    "Empty/Open Space",
];

const getSetupOptionsForRoomType = (roomType: string | undefined): string[] => {
    switch (roomType) {
        case "AUD":   // Large theaters, assembly halls, performance stages
            return ["Auditorium/Theater"];
        case "CLASS": // General instruction, lecture rooms
            return ["Classroom", "Circle", "U-Shape", "Empty/Open Space"];
        case "CONF":  // Meeting rooms, boardrooms, huddle spaces
            return ["Conference/Boardroom", "U-Shape", "Circle"];
        case "DIN":   // Cafeterias, food courts, kitchenettes
            return ["Vendor/Fair", "Empty/Open Space"];
        case "EXT":   // Lawns, plazas, patios, quadrangles, tabling spaces
            return ["Vendor/Fair", "Empty/Open Space"];
        case "FAITH": // Chapels, reflection rooms, prayer spaces
            return ["Auditorium/Theater", "Circle", "Empty/Open Space"];
        case "LAB":   // Research labs, computer labs, class labs
            return ["Empty/Open Space"];
        case "LOBBY": // Receptions, foyers, breakout areas
            return ["Vendor/Fair", "Empty/Open Space"];
        case "STUDY": // Lounges, study rooms, community areas
            return ["Circle", "Empty/Open Space"];
        default:
            return allRoomSetupOptions;
    }
};

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
    const selectedRoomTitle = useWatch({ control, name: "form_data.location.room_title" });
    const selectedRoomType = useWatch({ control, name: "form_data.location.room_type" });
    const attendeeCountRaw = useWatch({ control, name: "attendees" });
    const attendeeCountNested = useWatch({ control, name: "form_data.event.attendees" });
    const needsRoomSetup  = useWatch({ control, name: "form_data.location.needs_room_setup" }) === "yes";
    const needsFurniture  = useWatch({ control, name: "form_data.location.needs_furniture" }) === "yes";
    const needsAV         = useWatch({ control, name: "form_data.location.needs_av" }) === "yes";
    const needsPower      = useWatch({ control, name: "form_data.location.needs_power" }) === true;
    const { fields: furnitureFields, append, remove, replace: replaceFurniture } = useFieldArray({
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
        const titles = filteredLocations
            .map((loc) => loc?.roomTitle)
            .filter((title): title is string => Boolean(title));
        return Array.from(new Set(titles)).sort((a, b) => a.localeCompare(b));
    }, [filteredLocations]);

    const isSpecialSpace = specialSpacesList.includes(selectedLocation);

    // Derive the selected room's DB roomType synchronously so there's no
    // render-delay between picking a room and getting filtered setup options.
    const derivedRoomType = useMemo(() => {
        if (!selectedLocation || !selectedRoomTitle) return undefined;
        const loc = allLocations.find(
            l => l.buildingDisplayName === selectedLocation && l.roomTitle === selectedRoomTitle
        );
        return loc?.roomType as string | undefined;
    }, [selectedLocation, selectedRoomTitle, allLocations]);

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
            replaceFurniture([]);
            setValue?.("form_data.location.av_needs", undefined);
            setValue?.("form_data.location.rain_location", undefined);
        }
    }, [selectedLocation, setValue]);

    // Auto-derive room_type from the selected room title so the user doesn't
    // have to pick it manually — it's silently populated from the DB record.
    useEffect(() => {
        if (!selectedRoomTitle || !selectedLocation) return;
        if (derivedRoomType) {
            setValue?.("form_data.location.room_type", derivedRoomType);
        }
    }, [selectedRoomTitle, selectedLocation, derivedRoomType, setValue]);

    // Clear room_setup when the room changes so stale incompatible setups don't persist.
    useEffect(() => {
        setValue?.("form_data.location.room_setup", undefined);
    }, [selectedRoomTitle, setValue]);

    const setupOptions = useMemo(() => {
        if (isOutdoor) return ["Vendor/Fair", "Empty/Open Space"];
        return getSetupOptionsForRoomType(derivedRoomType);
    }, [isOutdoor, derivedRoomType]);

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
                            style={{ width: "49%", marginTop: 8 }}
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

            {/* Room selection — room type is auto-derived after the user picks a room */}
            {(isIndoor || isOutdoor) && selectedLocation && (
                <Controller
                    name="form_data.location.room_title"
                    control={control}
                    rules={{ required: "Room number or title is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                            <FieldLabel required>What is the room number or title?</FieldLabel>
                            <Select
                                {...field}
                                key={selectedLocation}
                                value={field.value ?? undefined}
                                placeholder="Select room"
                                style={{ width: "49%", marginTop: 8 }}
                                loading={buildingsLoading}
                                status={fieldState.error ? "error" : ""}
                                options={roomTitleOptions.map((title) => ({ value: title, label: title }))}
                            />
                            {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
                        </div>
                    )}
                />
            )}

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
                <>
                    <Controller
                        name="form_data.location.needs_room_setup"
                        control={control}
                        rules={{ required: "Please indicate whether your location needs additional setup" }}
                        render={({ field, fieldState }) => (
                            <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                    <FieldLabel required>Will your location need any additional setup?</FieldLabel>
                                </div>
                                <Radio.Group
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                        if (e.target.value === "no") setValue?.("form_data.location.room_setup", undefined);
                                    }}
                                >
                                    <Radio value="yes">Yes</Radio>
                                    <Radio value="no">No</Radio>
                                </Radio.Group>
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                )}
                            </div>
                        )}
                    />
                    {needsRoomSetup && (
                        <Controller
                            name="form_data.location.room_setup"
                            control={control}
                            rules={{ required: "Please select your setup type" }}
                            render={({ field, fieldState }) => (
                                <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                                    <FieldLabel required style={{ marginBottom: 8 }}>What type of setup will you need?</FieldLabel>
                                    <Select {...field} value={field.value} placeholder="Select location setup" style={{ width: "49%", marginTop: 8 }} status={fieldState.error ? "error" : ""}>
                                        {setupOptions.map((opt) => (
                                            <Option key={opt} value={opt}>{opt}</Option>
                                        ))}
                                    </Select>
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                    )}
                                </div>
                            )}
                        />
                    )}
                </>
            )}

            {/* Q14: Furniture Repeater */}
            {(isIndoor || isOutdoor) && (
                <>
                    <Controller
                        name="form_data.location.needs_furniture"
                        control={control}
                        rules={{ required: "Please indicate whether your event requires additional furniture" }}
                        render={({ field, fieldState }) => (
                            <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                    <FieldLabel required>Will your event require any additional furniture?</FieldLabel>
                                </div>
                                <Radio.Group
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                        if (e.target.value === "no") {
                                            replaceFurniture([]);
                                        } else {
                                            // Auto-add one row so the user sees the inputs immediately
                                            if (furnitureFields.length === 0) append({ type: undefined, quantity: 1 });
                                        }
                                    }}
                                >
                                    <Radio value="yes">Yes</Radio>
                                    <Radio value="no">No</Radio>
                                </Radio.Group>
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                )}
                            </div>
                        )}
                    />
                    {needsFurniture && (
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                            <FieldLabel required style={{ marginBottom: 8 }}>What kind of furniture do you need, and in what quantities?</FieldLabel>
                            {furnitureFields.map((f, index) => (
                        <div key={f.id} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <Controller
                                name={`form_data.location.furniture.${index}.type`}
                                control={control}
                                rules={{ required: "Furniture type is required" }}
                                render={({ field, fieldState }) => (
                                    <Select {...field} value={field.value} placeholder="Furniture Type" style={{ width: "25%" }} status={fieldState.error ? "error" : ""}>
                                        {furnitureOptions.map((opt) => (
                                            <Option key={opt} value={opt}>{opt}</Option>
                                        ))}
                                    </Select>
                                )}
                            />
                            <Controller
                                name={`form_data.location.furniture.${index}.quantity`}
                                control={control}
                                rules={{ required: "Quantity is required", min: { value: 1, message: "Must be at least 1" } }}
                                render={({ field, fieldState }) => (
                                    <InputNumber
                                        {...field}
                                        min={1}
                                        placeholder="Qty"
                                        style={{ width: "12.5%" }}
                                        status={fieldState.error ? "error" : ""}
                                        onWheel={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.blur()}
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
                </>
            )}

            {/* Q15: A/V Needs */}
            {isIndoor && (
                <>
                    <Controller
                        name="form_data.location.needs_av"
                        control={control}
                        rules={{ required: "Please indicate whether your event requires A/V equipment" }}
                        render={({ field, fieldState }) => (
                            <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                    <FieldLabel required>Will your event require any A/V equipment?</FieldLabel>
                                </div>
                                <Radio.Group
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                        if (e.target.value === "no") setValue?.("form_data.location.av_needs", []);
                                    }}
                                >
                                    <Radio value="yes">Yes</Radio>
                                    <Radio value="no">No</Radio>
                                </Radio.Group>
                                {fieldState.error && (
                                    <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                )}
                            </div>
                        )}
                    />
                    {needsAV && (
                        <Controller
                            name="form_data.location.av_needs"
                            control={control}
                            rules={{ required: "Please select at least one A/V equipment option" }}
                            render={({ field, fieldState }) => (
                                <div style={{ marginBottom: 24 }}>
                                    <FieldLabel required style={{ marginBottom: 8 }}>What A/V equipment will you need?</FieldLabel>
                                    <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Select all that apply</Text>
                                    <Checkbox.Group
                                        options={avOptions}
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        style={{ display: "flex", flexDirection: "column" }}
                                    />
                                    {fieldState.error && (
                                        <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                                    )}
                                </div>
                            )}
                        />
                    )}
                </>
            )}

            {(isIndoor || isOutdoor) && (
                <Controller
                    name="form_data.location.needs_power"
                    control={control}
                    rules={{ validate: (value) => value != null || "Please indicate whether your event requires additional power sources" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                <FieldLabel required>Will your event require any additional power sources?</FieldLabel>
                            </div>
                            <Radio.Group
                                options={[
                                    { label: "Yes", value: true },
                                    { label: "No", value: false }
                                ]}
                                value={field.value}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    if (e.target.value === false) {
                                        setValue?.("form_data.location.utilities", undefined);
                                    }
                                }}
                            />
                            {fieldState.error && (
                                <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />
            )}

            {/* Q16–Q17: Utility details — only shown when needs_power is true */}
            {(isIndoor || isOutdoor) && needsPower && (
                <>
                    {/* Q16: Power */}
                    <Controller
                        name="form_data.location.utilities.power_required"
                        control={control}
                        render={({ field }) => (
                            <div style={{ marginBottom: 16 }}>
                                <Checkbox {...field} checked={field.value}>Will you need electrical power beyond standard outlets?</Checkbox>
                            </div>
                        )}
                    />

                    {/* Q16a: Power Details */}
                    {useWatch({ control, name: "form_data.location.utilities.power_required" }) && (
                        <Controller
                            name="form_data.location.utilities.power_details"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} placeholder="Specify amperage or wattage requirements" />
                            )}
                        />
                    )}

                    {/* Q17: Outdoor Water */}
                    {isOutdoor && (
                        <Controller
                            name="form_data.location.utilities.water_required"
                            control={control}
                            render={({ field }) => (
                                <Checkbox {...field} checked={field.value}>Will you need outdoor water access?</Checkbox>
                            )}
                        />
                    )}
                </>
            )}
        </div>
    );
}

