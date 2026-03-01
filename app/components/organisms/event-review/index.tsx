import React, { useState, useEffect } from "react";
import { Typography, Card, Button, message, Alert } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation, useGetOnCampusQuery, useGetUserQuery, useGetUsersQuery } from '~/lib/graphql/generated';
import ProgressTimeline from "../../molecules/event-flow/progress-timeline";
import SuccessModal from "../../molecules/event-flow/success-modal";
import DiscardModal from "../../molecules/event-flow/discard-modal";
import ScrollToTop from "../../atoms/ScrollToTop";
import { useAuth } from "~/auth/AuthProvider";
import { formatTime, formatDateMDY, formatDuration } from '~/lib/formatters';
import { calculateEventLevel } from "~/vendor/calendar/components/utils";
import { useEventForm } from "~/context/eventFormContext";

const { Title, Paragraph, Link, Text } = Typography;

export function EventReview() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [createdEventId, setCreatedEventId] = useState<string | null>(null);
    const [draftAlertMessage, setDraftAlertMessage] = useState<'created' | 'updated' | ''>('');
    const [createEvent, { loading: isSubmitting }] = useCreateEventMutation();
    const [updateEvent] = useUpdateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const { data: locationsData } = useGetOnCampusQuery({ variables: { limit: 5000, offset: 0 } });
    const { formData: rawFormData, setFormData: setContextFormData, clearFormData } = useEventForm();
    const [formData, setFormData] = useState<any>(null);

    // Normalize formData to match Overview structure
    useEffect(() => {
        if (!rawFormData) return;
        const raw = rawFormData;
        const mapped = {
            event: {
                name: raw.title || '',
                description: raw.description || '',
                attendees: raw.attendees || '',
                dateRange: raw.event_date ? [raw.event_date, raw.event_date] : [],
            },
            eventStatus: raw.eventStatus || 'N/A',
            startTime: raw.start_time || 'N/A',
            endTime: raw.end_time || 'N/A',
            setupTime: raw.setup_time || 'N/A',
            eventLevel: raw.event_level ? `Level ${raw.event_level}` : 'N/A',
            createdBy: raw.createdBy || 'You',

            location: {
                name: raw.location_name || '',
                type: raw.location_type || '',
                selected: raw.form_data?.location?.selected || '',
                room_type: raw.form_data?.location?.room_type || '',
                virtual_link: raw.form_data?.location?.virtual_link || '',
            },

            onCampus: raw.form_data?.location || null,

            form_data: {
                location: raw.form_data?.location || {},
                travel: raw.form_data?.travel || {},
                food: raw.form_data?.food || {},
                fire: raw.form_data?.fire || {},
                level0_confirmed: raw.form_data?.level0_confirmed,
                vendors: raw.form_data?.vendors || [],
                vendors_notice_acknowledged: raw.form_data?.vendors_notice_acknowledged,
                non_vendor_services: raw.form_data?.non_vendor_services || {},
                non_vendor_services_notes: raw.form_data?.non_vendor_services_notes || '',
                non_vendor_services_acknowledged: raw.form_data?.non_vendor_services_acknowledged,
                funding: raw.form_data?.funding || { account_number: raw.account || '', funding_source: '' },
                elements: raw.form_data?.elements || {},
                offCampus: raw.form_data?.offCampus || {},
            },

            food: raw.form_data?.food || null,
            alcohol: raw.form_data?.alcohol || null,
            minors: raw.form_data?.minors || null,
            movies: raw.form_data?.movies || null,
            raffles: raw.form_data?.raffles || null,
            fire: raw.form_data?.fire || null,
            sorc_games: raw.form_data?.sorc_games || null,

            vendors: raw.form_data?.vendors || [],
            budget: raw.budget?.total_purchase || raw.form_data?.budget?.total_purchase || '',
            account: raw.budget?.account_code || raw.form_data?.budget?.account_number || '',
            vendor: raw.budget?.vendor_needed === true ? 'yes' : 'no',

            event_img: raw.event_img,
            event_img_preview: raw.event_img_preview,
            event_img_name: raw.event_img_name,
        };
        setFormData(mapped);
    }, [rawFormData]);

    const renderField = (
        label: string,
        value: any,
        options?: {
            preserveWhitespace?: boolean;
            transform?: (val: any) => React.ReactNode;
        }
    ) => {
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
        ) {
            return null;
        }

        const displayValue = options?.transform
            ? options.transform(value)
            : Array.isArray(value)
                ? value.join(", ")
                : value;

        return (
            <div style={{ marginBottom: 16 }}>
                <Title level={5}>{label}</Title>
                <Paragraph
                    style={{
                        whiteSpace: options?.preserveWhitespace ? "pre-wrap" : "normal"
                    }}
                >
                    {displayValue}
                </Paragraph>
            </div>
        );
    };

    // PRETTY LABELS

    // If there's a trip leader ID in the form data, fetch their user data to display their name instead of just the ID
    const tripLeaderId = formData?.form_data?.travel?.trip_leader_id;
    const { data: tripLeaderData } = useGetUserQuery({
        variables: { id: tripLeaderId as string },
        skip: !tripLeaderId
    });
    const tripLeader = tripLeaderData?.user || null;

    // Pretty labels for SORC game types
    const gameLabels: Record<string, string> = {
        mechanical_bull: "Mechanical Bull",
        velcro_wall: "Velcro Wall",
        human_hamster_balls: "Human Hamster Balls",
        giant_slide: "Giant Slide",
        obstacle_course: "Obstacle Course",
        dunk_tank: "Dunk Tank",
        bungee_run: "Bungee Run",
        jousting_arena: "Jousting Arena",
        giant_connect_four: "Giant Connect Four",
        giant_jenga: "Giant Jenga",
        carnival_game_booths: "Carnival Game Booths",
        casino_tables: "Casino Tables",
        photo_booth: "Photo Booth",
        inflatable_sports_games: "Inflatable Sports Games",
    };

    // Pretty labels for non-vendor service types
    const nonVendorServiceLabels: Record<string, string> = {
        av_support: "A/V Support",
        custodial_safety: "Custodial & Safety",
        public_safety: "Public Safety",
        facilities: "Facilities/Custodial",
        parking: "Parking Services",
        signage: "Signage & Wayfinding",
        furniture_rental: "University Furniture Rental"
    };

    const creatorUsername = formData?.event?.createdBy;
    const { data: userData, loading: userLoading } = useGetUsersQuery({
        variables: { limit: 1, offset: 0, username: creatorUsername },
        skip: !creatorUsername || creatorUsername === 'N/A'
    });

    const creatorUser = userData?.users?.[0];

    const calculateEstimatedCost = (formData: any): string => {
        let total = 0;
        let hasCosts = false;

        // Add non-food vendor costs.
        // Food-type vendors are excluded because the food section's estimated_cost
        // already captures that spend — counting both would double the food cost.
        if (formData?.form_data?.vendors && Array.isArray(formData.form_data.vendors)) {
            formData.form_data.vendors.forEach((vendor: any) => {
                if (vendor.type === "food") return; // skip — covered by food section
                const cost = parseFloat(vendor.estimatedCost);
                if (!isNaN(cost) && cost > 0) {
                    total += cost;
                    hasCosts = true;
                }
            });
        }

        // Add food section cost
        if (formData?.form_data?.food?.estimated_cost) {
            const cost = parseFloat(formData.form_data.food.estimated_cost);
            if (!isNaN(cost) && cost > 0) {
                total += cost;
                hasCosts = true;
            }
        }

        // Add raffle prize cost (field is raffles.estimated_cost)
        if (formData?.form_data?.raffles?.estimated_cost) {
            const cost = parseFloat(formData.form_data.raffles.estimated_cost);
            if (!isNaN(cost) && cost > 0) {
                total += cost;
                hasCosts = true;
            }
        }

        return hasCosts ? total.toFixed(2) : 'N/A';
    };

    // Pass rawFormData (the original RHF getValues() snapshot) to the ProgressTimeline
    // so that defaultIsSectionComplete can check fields by their real form field names
    // (title, location_type, etc.). The local `formData` is a remapped display object
    // with different key names (event.name, location.type, etc.) and would always
    // evaluate as incomplete.
    const getValues = () => rawFormData || {};

    const handleEditSection = (sectionKey: string) => {
        try {
            navigate(`/event-form${id ? `/${id}` : ''}`, {
                state: { editingSection: sectionKey }
            })
        }
        catch (err) {
            console.error("Error navigating to edit section:", err);
        }
    };

    const buildMutationInput = (data: any, eventStatus: string = "REVIEW", isUpdate: boolean = false) => {
        if (!user) {
            throw new Error("User must be authenticated to build mutation input");
        }

        const convert12to24Hour = (time12h: any): string => {
            if (!time12h || typeof time12h !== 'string') return '';
            const trimmed = time12h.trim();
            if (!trimmed) return '';

            // Check if already in 24-hour format (HH:mm:ss or HH:mm)
            const time24Match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
            if (time24Match && !trimmed.match(/AM|PM/i)) {
                const hours = String(parseInt(time24Match[1])).padStart(2, '0');
                const minutes = time24Match[2];
                const seconds = time24Match[3] || '00';
                return `${hours}:${minutes}:${seconds}`;
            }

            // Parse 12-hour format (HH:mm AM/PM)
            const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (!match) return trimmed;
            let hours = parseInt(match[1]);
            const minutes = match[2];
            const period = match[3].toUpperCase();
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            const hours24 = String(hours).padStart(2, '0');
            return `${hours24}:${minutes}:00`;
        };

        const locationType = data.location_type?.toUpperCase().replace(/-/g, '_');
        const convertedStartTime = data.start_time ? convert12to24Hour(data.start_time) : undefined;
        const convertedEndTime = data.end_time ? convert12to24Hour(data.end_time) : undefined;
        const convertedSetupTime = data.setup_time ? convert12to24Hour(data.setup_time) : undefined;
        let mappedLocationId: number | undefined = undefined;
        let mappedLocationString: string | undefined = undefined;

        if (data.location_type === "On-Campus" && locationsData?.locations) {
            const selectedBuilding = data.form_data?.location?.selected;
            const selectedRoomType = data.form_data?.location?.room_type;
            const selectedRoomTitle = data.form_data?.location?.room_title;

            if (selectedBuilding && selectedRoomTitle) {
                const matchedLocation = locationsData.locations.find((loc) => {
                    const buildingMatch = loc?.buildingDisplayName === selectedBuilding;
                    const roomTypeMatch = !selectedRoomType || loc?.roomType === selectedRoomType;
                    const roomTitleMatch = loc?.roomTitle === selectedRoomTitle;
                    return buildingMatch && roomTypeMatch && roomTitleMatch;
                });

                if (matchedLocation) {
                    mappedLocationId = parseInt(matchedLocation.id);
                    mappedLocationString = `${matchedLocation.buildingCode} ${matchedLocation.roomTitle}`;
                }
            }
        } else if (data.location_type === "Virtual") {
            mappedLocationString = "Virtual";
        } else if (data.location_type === "Off-Campus") {
            mappedLocationString = "Off Campus";
        }

        const determinedLevel = calculateEventLevel(data);
        const orgUsername = user?.organization?.username || user?.username;

        const mutationInput: any = {
            title: data.title,
            description: data.description,
            eventDate: data.event_date,
            locationType: locationType,
            eventLevel: determinedLevel,
            eventStatus: eventStatus,
            formData: JSON.stringify({
                ...data.form_data,
                attendees: data.attendees,
                event_img: typeof data.event_img === 'string' ? data.event_img : undefined,
                event_img_name: data.event_img_name,
                createdByUser: {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImg: user.profileImg,
                },
            }),
        };

        // Only include these fields for CREATE operations, not UPDATE
        if (!isUpdate) {
            mutationInput.organizationUsername = orgUsername;
            mutationInput.createdBy = user.username;
        }

        if (typeof data.event_img === 'string' && data.event_img) mutationInput.eventImg = data.event_img;
        if (convertedStartTime) mutationInput.startTime = convertedStartTime;
        if (convertedEndTime) mutationInput.endTime = convertedEndTime;
        if (convertedSetupTime) mutationInput.setupTime = convertedSetupTime;
        if (mappedLocationString) mutationInput.location = mappedLocationString;
        if (mappedLocationId) mutationInput.locationId = mappedLocationId;

        return mutationInput;
    };

    const slugify = (str: string) => {
        return (str || 'event')
            .toString()
            .normalize('NFKD')
            .replace(/\s+/g, '_')
            .replace(/[^A-Za-z0-9_-]/g, '')
            .toLowerCase()
            .substring(0, 120);
    };

    const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type || 'image/jpeg' });
    };

    const uploadImage = async (file: File, desiredName?: string) => {
        const fd = new FormData();
        fd.append('event_img', file);
        if (desiredName) fd.append('desired_name', desiredName);
        const getUploadUrl = () => {
            if (import.meta.env.DEV) {
                return '/~ojk25/graphql/upload_event_image.php';
            } else {
                return '/~ojk25/graphql/upload_event_image.php';
            }
        };

        const resp = await fetch(getUploadUrl(), {
            method: 'POST',
            body: fd
        });

        const text = await resp.text();
        let parsed: any = null;
        try { parsed = JSON.parse(text); } catch (e) { parsed = null; }

        if (!resp.ok) {
            if (parsed && parsed.error) {
                const parts = [parsed.error];
                if (parsed.upload_error_code) parts.push(`code:${parsed.upload_error_code}`);
                if (parsed.upload_max_filesize) parts.push(`upload_max_filesize:${parsed.upload_max_filesize}`);
                if (parsed.post_max_size) parts.push(`post_max_size:${parsed.post_max_size}`);
                throw new Error(parts.join(' | '));
            }
            throw new Error(`Upload failed: ${resp.status} ${text}`);
        }

        if (parsed) {
            if (!parsed.success) {
                const parts = [parsed.error || 'Upload endpoint returned an error'];
                if (parsed.upload_error_code) parts.push(`code:${parsed.upload_error_code}`);
                throw new Error(parts.join(' | '));
            }
            return parsed;
        }

        throw new Error(`Upload succeeded but returned invalid JSON: ${text}`);
    };

    const prepareEventImage = async (data: any, desiredName: string) => {
        let rawValue = data.event_img;

        if (!rawValue) return undefined;

        // Already saved filename
        if (typeof rawValue === "string") {
            return rawValue;
        }

        // Ant Upload object
        if (rawValue?.originFileObj instanceof File) {
            rawValue = rawValue.originFileObj;
        }

        // Direct File
        if (rawValue instanceof File) {
            message.loading({ content: 'Uploading image...', key: 'upload' });
            const uploadResp = await uploadImage(rawValue, desiredName);
            const filenameToSave =
                uploadResp.filename || uploadResp.url || uploadResp.path;
            message.success({ content: 'Image uploaded', key: 'upload', duration: 1 });
            return filenameToSave;
        }

        // Base64 fallback
        if (data.event_img_preview && data.event_img_name) {
            const file = await dataUrlToFile(
                data.event_img_preview,
                data.event_img_name
            );
            message.loading({ content: 'Uploading image...', key: 'upload' });
            const uploadResp = await uploadImage(file, desiredName);
            const filenameToSave =
                uploadResp.filename || uploadResp.url || uploadResp.path;
            message.success({ content: 'Image uploaded', key: 'upload', duration: 1 });
            return filenameToSave;
        }

        // Anything else is unsafe — do NOT pass to GraphQL
        return undefined;
    };

    const handleSaveDraft = async () => {
        if (!user || !formData) return;
        const dataToUse = { ...formData };
        const desired = id ? `${id}_${slugify(formData.title || '')}` : `${slugify(formData.title || '')}_${Date.now()}`;
        try {
            const filename = await prepareEventImage(dataToUse, desired);
            if (filename) dataToUse.event_img = filename;
        } catch (err) {
            console.error('❌ Image upload failed:', err);
            message.error('Image upload failed. Please try again.');
            return;
        }
        const mutationInput = buildMutationInput(dataToUse, "DRAFT", !!id);

        if (id) {
            await updateEvent({ variables: { id, input: mutationInput } });
            setDraftAlertMessage('updated');
            setTimeout(() => setDraftAlertMessage(''), 3000);
        } else {
            const { data: result } = await createEvent({ variables: { input: mutationInput } });
            if (result?.createEvent?.id) {
                setDraftAlertMessage('created');
                setTimeout(() => setDraftAlertMessage(''), 3000);
                navigate(`/event-review/${result.createEvent.id}`);
            }
        }
    };

    const deleteEventImage = async (filename: string) => {
        if (!filename || import.meta.env.DEV) return;
        try {
            const fd = new FormData();
            fd.append('filename', filename);
            await fetch('/~ojk25/graphql/delete_event_image.php', { method: 'POST', body: fd });
        } catch (err) {
            console.warn('⚠️ Could not delete event image from server:', err);
        }
    };

    const handleDiscard = async () => {
        if (id) {
            // Delete the uploaded image from the server before removing the DB record
            const imgFilename = rawFormData?.event_img;
            if (typeof imgFilename === 'string' && imgFilename) {
                await deleteEventImage(imgFilename);
            }
            await deleteEvent({ variables: { id } });
        }

        try {
            clearFormData();
        } catch (err) {
            console.error("❌ Error clearing form data:", err);
        }

        setIsDiscardModalOpen(false);
        message.success("Draft discarded");
        navigate("/");
    };

    const handleSubmit = async () => {
        if (!user || !formData) {
            message.error("Missing user or form data");
            return;
        }
        const dataToUse = { ...formData };
        const desired = id ? `${id}_${slugify(formData.title || '')}` : `${slugify(formData.title || '')}_${Date.now()}`;
        try {
            const filename = await prepareEventImage(dataToUse, desired);
            if (filename) dataToUse.event_img = filename;
        } catch (err) {
            console.error('❌ Image upload failed:', err);
            message.error('Image upload failed. Please try again.');
            return;
        }
        const mutationInput = buildMutationInput(dataToUse, "REVIEW", !!id);

        if (id) {
            const { data: result } = await updateEvent({ variables: { id, input: mutationInput } });
            if (result?.updateEvent?.id) {
                try {
                    clearFormData();
                } catch (err) {
                    console.error("❌ Error clearing form data:", err);
                }
                setCreatedEventId(result.updateEvent.id);
                setIsModalOpen(true);
            }
        } else {
            const { data: result } = await createEvent({ variables: { input: mutationInput } });
            if (result?.createEvent?.id) {
                try {
                    clearFormData();
                } catch (err) {
                    console.error("❌ Error clearing form data:", err);
                }
                setCreatedEventId(result.createEvent.id);
                setIsModalOpen(true);
            }
        }
    };

    if (!formData) return <div className="container mx-auto p-8">Loading...</div>;

    return (
        <div className="container m-8 w-auto">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                <h2 style={{ margin: 0 }}>Review Your Event</h2>
                <p>Please review all details before submitting your event for approval.</p>
            </div>
            <div style={{ marginBottom: 24, marginTop: 24, display: "flex", justifyContent: "center" }}>
                <ProgressTimeline getValues={getValues} currentEditingSection="review" visitedSections={["eventDetails", "dateLocation", "eventElements", "budgetPurchase", "review"]} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* EVENT DETAILS SECTION */}
                <Card
                    id="review-section-1"
                    style={{
                        border: "solid",
                        borderColor: "var(--color-border-default)",
                        borderWidth: "1px",
                        scrollMarginTop: "2rem",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3}>Event Details</Title>
                        <Button type="text" icon={<EditOutlined style={{ color: '#333', fontSize: '18px' }} />} onClick={() => handleEditSection('eventDetails')} />
                    </div>
                    {/* Robust event image preview logic */}
                    {(() => {
                        let src = null;
                        let filename = null;
                        if (formData.event_img) {
                            if (typeof formData.event_img === 'string') {
                                // Use backend uploads path for filename
                                src = `${(import.meta.env?.BASE_URL || '/') + 'uploads/event_img/' + formData.event_img}`.replace(/\\/g, '/');
                                filename = formData.event_img;
                            } else if (formData.event_img instanceof File) {
                                src = URL.createObjectURL(formData.event_img);
                                filename = formData.event_img.name;
                            } else if (formData.event_img?.url) {
                                src = formData.event_img.url;
                                filename = formData.event_img.name || formData.event_img.url;
                            } else if (formData.event_img?.thumbUrl) {
                                src = formData.event_img.thumbUrl;
                                filename = formData.event_img.name || formData.event_img.thumbUrl;
                            }
                        }
                        // Fallback to preview if present
                        if (formData.event_img_preview) {
                            src = formData.event_img_preview;
                        }
                        if (formData.event_img_name) {
                            filename = formData.event_img_name;
                        }
                        if (!src || !filename) return null;
                        return (
                            <div className="ant-upload-list-item ant-upload-list-item-done" style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "1rem 0.75rem",
                                border: "1px solid var(--color-border-default)",
                                borderRadius: "4px",
                                width: "25rem",
                                marginBottom: 8
                            }}>
                                <a className="ant-upload-list-item-thumbnail" href={src} target="_blank" rel="noopener noreferrer">
                                    <img alt={filename} className="ant-upload-list-item-image" src={src} style={{ maxHeight: "4rem", maxWidth: "4rem" }} />
                                </a>
                                <a target="_blank" rel="noopener noreferrer" className="ant-upload-list-item-name" title={filename} href={src} style={{ color: "#1890ff", textDecoration: "none" }}>
                                    {filename}
                                </a>
                            </div>
                        );
                    })()}

                    {renderField("Event Name", formData?.event?.name)}
                    {renderField("Description", formData?.event?.description, {
                        preserveWhitespace: true
                    })}
                    {renderField("Attendees", formData?.event?.attendees)}
                </Card>

                {/* DATE & LOCATION SECTION */}
                <Card
                    id="review-section-2"
                    style={{
                        border: "solid",
                        borderColor: "var(--color-border-default)",
                        borderWidth: "1px",
                        scrollMarginTop: "2rem",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3}>Date & Location</Title>
                        <Button type="text" icon={<EditOutlined style={{ color: '#333', fontSize: '18px' }} />} onClick={() => handleEditSection('eventDetails')} />
                    </div>

                    {renderField("Location Type", formData?.location?.type)}
                    {renderField("Event Date", formatDateMDY(formData?.event?.dateRange?.[0]))}
                    {renderField("Start Time", formatTime(formData?.startTime))}
                    {renderField("End Time", formatTime(formData?.endTime))}
                    {renderField("Setup Time", formatDuration(formData?.setupTime))}

                    {/* IF EVENT WAS VIRTUAL */}

                    {formData?.location?.type === "Virtual" && (
                        renderField("Virtual Event Link", formData?.location?.virtual_link)
                    )}

                    {/* IF EVENT WAS ON CAMPUS  */}

                    {formData?.location?.type === "On Campus" && formData?.onCampus && (
                        <>
                            {renderField("On Campus Location", formData?.location?.selected)}
                            {renderField("Room Type", formData?.location?.room_type)}
                            {renderField("Room Title/Number", formData.onCampus.room_title)}

                            {renderField(
                                "Special Space Alignment",
                                formData.onCampus.special_space_alignment,
                                { preserveWhitespace: true }
                            )}

                            {renderField("Rain Plan", formData.onCampus.rain_location)}

                            {renderField("Room Setup", formData.onCampus.room_setup)}

                            {/* Furniture (array of objects — needs custom render) */}
                            {Array.isArray(formData.onCampus.furniture) &&
                                formData.onCampus.furniture.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <Title level={5}>Furniture</Title>
                                        {formData.onCampus.furniture.map((f: any, idx: number) => (
                                            <Paragraph key={idx}>
                                                {f.type} × {f.quantity}
                                            </Paragraph>
                                        ))}
                                    </div>
                                )}

                            {renderField("A/V Equipment", formData.onCampus.av)}

                            {/* Utilities */}
                            {formData.onCampus.utilities?.power_required &&
                                renderField(
                                    "Power Required",
                                    formData.onCampus.utilities.power_details
                                        ? `Yes (${formData.onCampus.utilities.power_details})`
                                        : "Yes"
                                )}

                            {formData.onCampus.utilities?.water_required &&
                                renderField("Water Access Required", "Yes")}
                        </>
                    )}

                    {/* IF EVENT WAS OFF CAMPUS */}
                    {formData?.location?.type === "Off Campus" && (
                        <div
                            style={{
                                marginTop: 24,
                                paddingTop: 16,
                                borderTop: "1px solid #f0f0f0"
                            }}
                        >
                            <Title level={4}>Off-Campus Details</Title>

                            {renderField(
                                "Address",
                                formData?.form_data?.location?.off_campus_address
                            )}

                            {formData?.form_data?.location?.google_maps_link &&
                                renderField(
                                    "Google Maps Link",
                                    formData.form_data.location.google_maps_link,
                                    {
                                        transform: (val) => (
                                            <Link href={val} target="_blank">
                                                View on Maps
                                            </Link>
                                        )
                                    }
                                )}

                            {renderField(
                                "Travel Type",
                                formData?.form_data?.travel?.type
                            )}

                            {renderField(
                                "Transportation",
                                formData?.form_data?.travel?.transportation
                            )}

                            {renderField(
                                "Trip Leader",
                                tripLeader
                                    ? `${tripLeader.firstName || ""} ${tripLeader.lastName || ""} (@${tripLeader.username})`.trim()
                                    : null
                            )}

                            {/* Emergency Contact */}
                            {formData?.form_data?.travel?.trip_leader_emergency_contact &&
                                renderField(
                                    "Emergency Contact",
                                    formData.form_data.travel.trip_leader_emergency_contact,
                                    {
                                        transform: (contact) =>
                                            contact?.name
                                                ? contact.phone
                                                    ? `${contact.name} - ${contact.phone}`
                                                    : contact.name
                                                : null
                                    }
                                )}

                            {renderField(
                                "Lodging",
                                formData?.form_data?.travel?.lodging,
                                { preserveWhitespace: true }
                            )}

                            {formData?.form_data?.travel?.eap_file &&
                                renderField(
                                    "Emergency Action Plan",
                                    formData.form_data.travel.eap_file,
                                    {
                                        transform: (file) =>
                                            typeof file === "string"
                                                ? file
                                                : file?.name || "Uploaded"
                                    }
                                )}
                        </div>
                    )}
                </Card>

                {/* EVENT ELEMENTS SECTION */}
                <Card
                    id="review-section-3"
                    style={{
                        border: "solid",
                        borderColor: "var(--color-border-default)",
                        borderWidth: "1px",
                        scrollMarginTop: "2rem",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3}>Event Elements</Title>
                        <Button type="text" icon={<EditOutlined style={{ color: '#333', fontSize: '18px' }} />} onClick={() => handleEditSection('eventDetails')} />
                    </div>
                    {/* NONE */}
                    {!formData?.food && !formData?.alcohol && !formData?.minors && !formData?.movies && !formData?.raffles && !formData?.fire && !formData?.sorc_games && (
                        <Paragraph>No special elements selected</Paragraph>
                    )}

                    {/* FOOD SECTION */}

                    {renderField(
                        "Food Option",
                        formData?.food?.type === "potluck"
                            ? "Potluck-style event (closed event for 50 or less organization members only)"
                            : formData?.form_data?.food?.type === "under_500_dragonlink"
                                ? "Under $500 - Purchase request through DragonLink (not Chestnut Street)"
                                : formData?.form_data?.food?.type === "over_500_chestnut"
                                    ? "Over $500 - Ordering through Chestnut Street Catering"
                                    : formData?.form_data?.food?.type === "over_500_exception"
                                        ? "Over $500 - Requesting catering exception"
                                        : formData?.form_data?.food?.type === "offcampus_restaurant"
                                            ? "Off-campus restaurant or food service establishment"
                                            : undefined
                    )}

                    {formData?.food?.vendor &&
                        renderField(
                            "Vendor / Restaurant",
                            formData?.food?.vendor
                        )}

                    {formData?.food?.estimated_cost != null &&
                        renderField(
                            "Estimated Cost",
                            `$${Number(
                                formData?.food?.estimated_cost
                            ).toLocaleString()}`
                        )}

                    {/* ALCOHOL SECTION */}

                    {formData?.alcohol && (
                        <div style={{ marginTop: 24 }}>
                            <Title level={4}>Alcohol Details</Title>

                            {renderField(
                                "Alcohol Vendor",
                                formData?.alcohol?.vendor
                            )}

                            {renderField(
                                "Event Type",
                                formData?.alcohol?.event_type === "drexel_only"
                                    ? "Drexel Students Only Event - No guests"
                                    : formData?.alcohol?.event_type === "date_party"
                                        ? "Date Party / Invitation Only Event"
                                        : formData?.alcohol?.event_type === "multiple_org"
                                            ? "Multiple Organization Event"
                                            : formData?.alcohol?.event_type === "alumni"
                                                ? "Alumni Event"
                                                : undefined
                            )}

                            {/* Faculty / Staff */}
                            {formData?.alcohol?.faculty_staff && (
                                <>
                                    {renderField(
                                        "Faculty/Staff Name",
                                        formData?.alcohol?.faculty_staff?.name
                                    )}

                                    {renderField(
                                        "Faculty/Staff Title",
                                        formData?.alcohol?.faculty_staff?.title
                                    )}

                                    {renderField(
                                        "Faculty/Staff Email",
                                        formData?.alcohol?.faculty_staff?.email
                                    )}

                                    {renderField(
                                        "Faculty/Staff Phone",
                                        formData?.alcohol?.faculty_staff?.phone
                                    )}
                                </>
                            )}

                            {renderField(
                                "Guests Under 21",
                                formData?.alcohol?.guests_under_21 === "yes"
                                    ? "Yes"
                                    : formData?.alcohol?.guests_under_21 === "no"
                                        ? "No"
                                        : undefined
                            )}

                            {renderField(
                                "ID Checking Procedure",
                                formData?.alcohol?.id_procedure,
                                { preserveWhitespace: true }
                            )}

                            {renderField(
                                "Food Available at Event",
                                formData?.alcohol?.food_description,
                                { preserveWhitespace: true }
                            )}

                            {/* Agreement Checklist */}
                            {formData?.alcohol?.checklist && (
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5}>Alcohol Policy Agreements</Title>

                                    {renderField(
                                        "ID Check Procedure Defined",
                                        formData?.alcohol?.checklist?.id_check ? "Agreed" : null
                                    )}

                                    {renderField(
                                        "Approved Vendor Providing Service",
                                        formData?.alcohol?.checklist?.approved_vendor ? "Agreed" : null
                                    )}

                                    {renderField(
                                        "Hard Liquor Charged to Individual",
                                        formData?.alcohol?.checklist?.hard_liquor_charge ? "Agreed" : null
                                    )}

                                    {renderField(
                                        "No Drinking Games",
                                        formData?.alcohol?.checklist?.no_drinking_games ? "Agreed" : null
                                    )}

                                    {renderField(
                                        "No Liquor with University Funds",
                                        formData?.alcohol?.checklist?.no_liquor_university_funds ? "Agreed" : null
                                    )}

                                    {renderField(
                                        "Food Available Throughout Event",
                                        formData?.alcohol?.checklist?.food_available ? "Agreed" : null
                                    )}

                                    {renderField(
                                        "Non-Salty Options Available",
                                        formData?.alcohol?.checklist?.non_salty_options ? "Agreed" : null
                                    )}

                                    {renderField(
                                        "Heavy Appetizers Minimum",
                                        formData?.alcohol?.checklist?.heavy_appetizers ? "Agreed" : null
                                    )}

                                    {renderField(
                                        "Alcohol Cutoff Policy",
                                        formData?.alcohol?.checklist?.cutoff_time ? "Agreed" : null
                                    )}
                                </div>
                            )}

                            {renderField(
                                "Electronic Signature",
                                formData?.alcohol?.signature_name
                            )}
                        </div>
                    )}


                    {/* MINORS SECTION */}

                    {formData?.minors && (
                        <div style={{ marginTop: 24 }}>
                            <Title level={4}>Minors Information</Title>

                            {renderField(
                                "Student Point of Contact",
                                formData?.minors?.student_contact_id || null
                            )}

                            {renderField(
                                "External Partners",
                                formData?.minors?.external_partners,
                                { preserveWhitespace: true }
                            )}

                            {renderField(
                                "Intended Audience & Recruitment",
                                formData?.minors?.audience_recruitment,
                                { preserveWhitespace: true }
                            )}

                            {(formData?.minors?.count_early_childhood ||
                                formData?.minors?.count_elementary ||
                                formData?.minors?.count_middle_school ||
                                formData?.minors?.count_high_school) && (
                                    <div style={{ marginTop: 16 }}>
                                        <Title level={5}>Expected Number of Minors</Title>

                                        {renderField(
                                            "Early Childhood (infant - Pre-K)",
                                            formData?.minors?.count_early_childhood
                                        )}

                                        {renderField(
                                            "Elementary (K-5)",
                                            formData?.minors?.count_elementary
                                        )}

                                        {renderField(
                                            "Middle School (6-8)",
                                            formData?.minors?.count_middle_school
                                        )}

                                        {renderField(
                                            "High School (9-12)",
                                            formData?.minors?.count_high_school
                                        )}

                                        {renderField(
                                            "Total Minors",
                                            (Number(formData?.minors?.count_early_childhood || 0) +
                                                Number(formData?.minors?.count_elementary || 0) +
                                                Number(formData?.minors?.count_middle_school || 0) +
                                                Number(formData?.minors?.count_high_school || 0)) || null
                                        )}
                                    </div>
                                )}

                            {renderField(
                                "Overnight Housing Required",
                                formData?.minors?.overnight_housing === true
                                    ? "Yes"
                                    : formData?.minors?.overnight_housing === false
                                        ? "No"
                                        : null
                            )}

                            {renderField(
                                "Drexel Transportation Required",
                                formData?.minors?.drexel_transportation === true
                                    ? "Yes"
                                    : formData?.minors?.drexel_transportation === false
                                        ? "No"
                                        : null
                            )}

                            {renderField(
                                "Parent/Guardian Attendance Required",
                                formData?.minors?.parent_attendance_required === true
                                    ? "Yes"
                                    : formData?.minors?.parent_attendance_required === false
                                        ? "No"
                                        : null
                            )}

                            {renderField(
                                "Minors Documentation Uploaded",
                                formData?.minors?.file ? "File Uploaded" : null
                            )}
                        </div>
                    )}

                    {/* MOVIES SECTION */}

                    {formData?.movies && (
                        <div style={{ marginTop: 24 }}>
                            <Title level={4}>Movie Permissions</Title>

                            {renderField(
                                "Permission Type",
                                formData?.movies?.option_type === "option_1_written_permission"
                                    ? "Option 1: Written Copyright Permission"
                                    : formData?.movies?.option_type === "option_2_vendor"
                                        ? "Option 2: Purchased Rights Through Vendor"
                                        : formData?.movies?.option_type === "option_3_educational"
                                            ? "Option 3: Educational Lecture"
                                            : formData?.movies?.option_type === "option_4_closed_event"
                                                ? "Option 4: Closed Event (50 or less attendees)"
                                                : null
                            )}

                            {/* OPTION 1 */}
                            {formData?.movies?.option_type === "option_1_written_permission" && (
                                <>
                                    <Title level={5} style={{ marginTop: 16 }}>
                                        Organization Obtains Written Permission
                                    </Title>

                                    {renderField("Movie Name", formData?.movies?.option_1?.movie_name)}

                                    {renderField("Company/Individual Name", formData?.movies?.option_1?.company_name)}

                                    {renderField(
                                        "Contact Name",
                                        formData?.movies?.option_1?.contact_first_name ||
                                            formData?.movies?.option_1?.contact_last_name
                                            ? `${formData?.movies?.option_1?.contact_first_name || ""} ${formData?.movies?.option_1?.contact_last_name || ""
                                            }`
                                            : null
                                    )}

                                    {renderField("Email", formData?.movies?.option_1?.email)}

                                    {renderField("Phone", formData?.movies?.option_1?.phone)}

                                    {renderField("Mailing Address", formData?.movies?.option_1?.mailing_address)}

                                    {renderField(
                                        "Written Permission Documentation",
                                        formData?.movies?.option_1?.permission_file
                                            ? "File Uploaded"
                                            : null
                                    )}
                                </>
                            )}

                            {/* OPTION 2 */}
                            {formData?.movies?.option_type === "option_2_vendor" && (
                                <>
                                    <Title level={5} style={{ marginTop: 16 }}>
                                        Organization Purchases Rights
                                    </Title>

                                    {renderField("Company/Individual Name", formData?.movies?.option_2?.company_name)}

                                    {renderField(
                                        "Contact Name",
                                        formData?.movies?.option_2?.contact_first_name ||
                                            formData?.movies?.option_2?.contact_last_name
                                            ? `${formData?.movies?.option_2?.contact_first_name || ""} ${formData?.movies?.option_2?.contact_last_name || ""
                                            }`
                                            : null
                                    )}

                                    {renderField("Email", formData?.movies?.option_2?.email)}

                                    {renderField("Phone", formData?.movies?.option_2?.phone)}

                                    {renderField(
                                        "Purchase Documentation",
                                        formData?.movies?.option_2?.purchase_documentation
                                            ? "File Uploaded"
                                            : null
                                    )}
                                </>
                            )}

                            {/* OPTION 3 */}
                            {formData?.movies?.option_type === "option_3_educational" && (
                                <>
                                    <Title level={5} style={{ marginTop: 16 }}>
                                        Educational Lecture
                                    </Title>

                                    {renderField("Movie Name", formData?.movies?.option_3?.movie_name)}

                                    {renderField("Facilitator Name", formData?.movies?.option_3?.facilitator_name)}

                                    {renderField("Facilitator Email", formData?.movies?.option_3?.facilitator_email)}

                                    {renderField("Facilitator Title", formData?.movies?.option_3?.facilitator_title)}

                                    {renderField("Facilitator Department", formData?.movies?.option_3?.facilitator_department)}

                                    {renderField(
                                        "Discussion Questions",
                                        formData?.movies?.option_3?.discussion_questions,
                                        { preserveWhitespace: true }
                                    )}

                                    {renderField(
                                        "Educational Relationship to Organization",
                                        formData?.movies?.option_3?.educational_relation,
                                        { preserveWhitespace: true }
                                    )}
                                </>
                            )}

                            {/* OPTION 4 */}
                            {formData?.movies?.option_type === "option_4_closed_event" && (
                                <>
                                    <Title level={5} style={{ marginTop: 16 }}>
                                        Closed Event (50 or Less)
                                    </Title>

                                    {renderField("Movie Name", formData?.movies?.option_4?.movie_name)}
                                </>
                            )}
                        </div>
                    )}

                    {/* RAFFLES SECTION */}

                    {formData?.raffles && (
                        <div style={{ marginTop: 24 }}>
                            <Title level={4}>Raffle Information</Title>

                            {renderField(
                                "Items Being Given Away & Purchase Plan",
                                formData?.raffles?.items_and_purchase_plan,
                                { preserveWhitespace: true }
                            )}

                            {renderField(
                                "How Prizes Will Be Awarded",
                                formData?.raffles?.award_method,
                                { preserveWhitespace: true }
                            )}

                            {renderField(
                                "Estimated Cost",
                                formData?.raffles?.estimated_cost !== undefined &&
                                    formData?.raffles?.estimated_cost !== null
                                    ? `$${Number(formData?.raffles?.estimated_cost).toFixed(2)}`
                                    : null
                            )}
                        </div>
                    )}


                    {/* FIRE SECTION */}

                    {renderField(
                        "Fire Source Type",
                        formData?.form_data?.fire?.type
                    )}

                    {formData?.form_data?.fire?.type === "fire_pit_package" &&
                        renderField(
                            "Fire Pit Package Agreement",
                            formData?.form_data?.fire?.fire_pit_agreement
                        )
                    }

                    {renderField(
                        "Fire Safety Plan",
                        formData?.form_data?.fire?.safety_plan
                    )}


                    {/* SORC GAMES SECTION */}

                    {renderField(
                        "SORC Games Selected",
                        formData?.sorc_games?.selected?.length
                            ? formData.sorc_games.selected
                                .map((g: string) => gameLabels[g] || g)
                                .join(", ")
                            : undefined
                    )}

                    {renderField(
                        "Games Setup Location",
                        formData?.sorc_games?.location
                    )}

                    {renderField(
                        "SORC Staff Present",
                        formData?.sorc_games?.staff_present === "yes"
                            ? "Yes"
                            : formData?.sorc_games?.staff_present === "no"
                                ? "No"
                                : undefined
                    )}
                </Card>

                {/* BUDGET & PURCHASE SECTION */}
                <Card id="section-4" style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3}>Budget & Purchases</Title>
                        <Button type="text" icon={<EditOutlined style={{ color: '#333', fontSize: '18px' }} />} onClick={() => handleEditSection('eventDetails')} />
                    </div>

                    {renderField(
                        "Level 0 Event",
                        formData?.form_data?.level0_confirmed ? "Yes" : "No"
                    )}

                    {formData?.form_data?.vendors?.map((vendor: any, index: number) => (
                        <div key={index} style={{ marginBottom: 16 }}>

                            {renderField(
                                `Vendor ${index + 1} Type`,
                                vendor?.type
                            )}

                            {renderField(
                                `Vendor ${index + 1} Company Name`,
                                vendor?.companyName
                            )}

                            {renderField(
                                `Vendor ${index + 1} Contact Person`,
                                vendor?.contactPersonName
                            )}

                            {renderField(
                                `Vendor ${index + 1} Contact Email`,
                                vendor?.contactEmail
                            )}

                            {renderField(
                                `Vendor ${index + 1} Contact Phone`,
                                vendor?.contactPhone
                            )}

                            {renderField(
                                `Vendor ${index + 1} Worked With Before`,
                                vendor?.workedBefore
                            )}

                            {renderField(
                                `Vendor ${index + 1} Drexel Student`,
                                vendor?.isDrexelStudent
                            )}

                            {renderField(
                                `Vendor ${index + 1} Amount`,
                                vendor?.amount
                            )}

                            {renderField(
                                `Vendor ${index + 1} Description`,
                                vendor?.description
                            )}

                            {renderField(
                                `Vendor ${index + 1} Org Providing`,
                                vendor?.org_providing
                            )}

                        </div>
                    ))}

                    {renderField(
                        "Vendor Letter Notice Acknowledged",
                        formData?.form_data?.vendors_notice_acknowledged ? "Yes" : "No"
                    )}

                    {/* NON VENDOR */}

                    {renderField(
                        "Non-Vendor Services Selected",
                        Object.entries(formData?.form_data?.non_vendor_services || {})
                            .filter(([_, value]) => value === true)
                            .map(([key]) => nonVendorServiceLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
                            .join(", ")
                    )}

                    {renderField(
                        "Non-Vendor Services Notes",
                        formData?.form_data?.non_vendor_services_notes
                    )}

                    {renderField(
                        "Non-Vendor Charges Acknowledged",
                        formData?.non_vendor_services_acknowledged ? "Yes" : "No"
                    )}

                    {renderField(
                        "Funding Source",
                        formData?.form_data?.budget?.source
                    )}

                    {renderField(
                        "Account Number",
                        formData?.form_data?.budget?.account_number
                    )}
                </Card>
            </div>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 12 }}>
                    <Button type="primary" onClick={handleSubmit} loading={isSubmitting} block>
                        Submit for Review
                    </Button>
                    <Button type="default" onClick={handleSaveDraft} block>
                        Save as Draft
                    </Button>
                </div>
                <Button style={{ backgroundColor: "transparent", borderColor: "transparent", color: "var(--sea-green-9)" }} type="default" danger onClick={() => setIsDiscardModalOpen(true)}>
                    Discard
                </Button>
                {draftAlertMessage && (
                    <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 1200, maxWidth: 400 }}>
                        <Alert
                            message={draftAlertMessage === 'created' ? "Draft Saved!" : "Draft Updated!"}
                            description={draftAlertMessage === 'created' ? "Your event draft has been saved successfully." : "Your event draft has been updated successfully."}
                            type="success"
                            showIcon
                            closable
                            onClose={() => setDraftAlertMessage('')}
                        />
                    </div>
                )}
            </div>

            <SuccessModal
                open={isModalOpen}
                title={id ? "Event Updated Successfully!" : "Event Form Submitted for Review!"}
                message={id
                    ? "Your event has been successfully updated. You can view the updated event details or return to your dashboard."
                    : "Your event form has been successfully submitted and is now under review. You can view the event details or return to your dashboard."
                }
                onDashboardClick={() => navigate("/")}
                onEventOverviewClick={() => {
                    if (createdEventId) {
                        navigate(`/event-overview?id=${encodeURIComponent(createdEventId)}`);
                    } else {
                        navigate("/event-overview");
                    }
                }}
            />
            <DiscardModal
                open={isDiscardModalOpen}
                title="Discard Event Form?"
                message={id
                    ? "Are you sure you want to discard this saved draft? This action cannot be undone."
                    : "Are you sure you want to discard this event form? All changes will be lost."}
                onDiscardClick={handleDiscard}
                onCancelClick={() => setIsDiscardModalOpen(false)}
            />
            <ScrollToTop />
        </div>
    );
}
