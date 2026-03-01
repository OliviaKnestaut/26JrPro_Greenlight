import React, { useRef, useState, useEffect } from "react";
import { Typography, Statistic, Card, Tag, Avatar, Tooltip, Button } from "antd";
const { Title, Paragraph, Link, Text } = Typography;
import { ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined, PushpinOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetEventByIdQuery, useGetUsersQuery, useGetUserQuery } from '~/lib/graphql/generated';
import NavMini from "../../molecules/nav-mini";
import OptimizedImage from '../../atoms/OptimizedImage';
import CommentInput from '../../molecules/comment-input';
import ScrollToTop from '../../atoms/ScrollToTop';
import { formatTime, formatDateMDY, formatDuration } from '~/lib/formatters';

export function EventOverviewContent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>(null);
    const formatLocationType = (val?: string) => {
        if (!val) return '';
        const map: Record<string, string> = {
            'ON_CAMPUS': 'On Campus',
            'OFF_CAMPUS': 'Off Campus',
            'VIRTUAL': 'Virtual',
        };
        const key = String(val).toUpperCase();
        if (map[key]) return map[key];
        return String(val).replace(/_/g, ' ').split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
    };

    const calculateEstimatedCost = (formData: any): string => {
        let total = 0;
        let hasCosts = false;

        // Add non-food vendor costs.
        // Food-type vendors are excluded because the food section's estimated_cost
        // already captures that spend — counting both would double the food cost.
        if (formData?.vendors && Array.isArray(formData.vendors)) {
            formData.vendors.forEach((vendor: any) => {
                if (vendor.type === "food") return; // skip — covered by food section
                const cost = parseFloat(vendor.estimatedCost);
                if (!isNaN(cost) && cost > 0) {
                    total += cost;
                    hasCosts = true;
                }
            });
        }

        // Add food section cost
        if (formData?.food?.estimated_cost) {
            const cost = parseFloat(formData.food.estimated_cost);
            if (!isNaN(cost) && cost > 0) {
                total += cost;
                hasCosts = true;
            }
        }

        // Add raffle prize cost (field is raffles.estimated_cost)
        if (formData?.raffles?.estimated_cost) {
            const cost = parseFloat(formData.raffles.estimated_cost);
            if (!isNaN(cost) && cost > 0) {
                total += cost;
                hasCosts = true;
            }
        }

        return hasCosts ? total.toFixed(2) : 'N/A';
    };

    const getStatusDisplay = (status?: string, eventDate?: string) => {
        if (!status) return null;
        const statusUpper = status.toUpperCase();

        // Check if event is in the past for approved events
        let isPast = false;
        if (eventDate) {
            const date = new Date(eventDate);
            if (!isNaN(date.getTime())) {
                isPast = date < new Date();
            }
        }

        if (statusUpper === 'APPROVED' && isPast) {
            return { text: 'past event', className: 'pastTag' };
        }
        if (statusUpper === 'APPROVED') {
            return { text: 'approved', className: 'approvedTag' };
        }
        if (statusUpper === 'REVIEW') {
            return { text: 'in-review', className: 'inReviewTag' };
        }
        if (statusUpper === 'DRAFT') {
            return { text: 'in-draft', className: 'inDraftTag' };
        }
        if (statusUpper === 'CANCELLED') {
            return { text: 'cancelled', className: 'cancelledTag' };
        }
        return { text: status.toLowerCase(), className: '' };
    };
    // Read `id` strictly from the query string: /event-overview?id=11
    const queryId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;
    const eventId = queryId ?? null;

    const { data, loading, error } = useGetEventByIdQuery({ variables: { id: eventId ?? '' }, skip: !eventId });

    // Get the creator's username from the event data to query for their profile
    const creatorUsername = data?.event?.createdBy;
    const { data: userData, loading: userLoading } = useGetUsersQuery({
        variables: { limit: 1, offset: 0, username: creatorUsername },
        skip: !creatorUsername || creatorUsername === 'N/A'
    });

    const creatorUser = userData?.users?.[0];

    useEffect(() => {
        // If an `eventId` is present, wait for the query to complete and only
        // set form data from the query result. Do NOT run the localStorage
        // fallback while an `eventId` is provided (prevents premature fallback).
        if (eventId) {
            if (!loading && data?.event) {
                const ev = data.event;

                // Parse formData JSON if it's a string
                let parsedFormData: any = {};
                if (typeof ev.formData === 'string') {
                    try {
                        parsedFormData = JSON.parse(ev.formData);
                    } catch (e) {
                        console.warn('Could not parse formData:', e);
                    }
                } else if (typeof ev.formData === 'object') {
                    parsedFormData = ev.formData;
                }

                const mapped = {
                    // 1. EVENT METADATA
                    event: {
                        name: ev.title || '',
                        description: ev.description || '',
                        attendees: parsedFormData?.attendees || '',
                        dateRange: ev.eventDate ? [ev.eventDate, ev.eventDate] : [],
                    },
                    eventStatus: ev.eventStatus || 'N/A',
                    startTime: ev.startTime || 'N/A',
                    endTime: ev.endTime || 'N/A',
                    setupTime: ev.setupTime || 'N/A',
                    eventLevel: ev.eventLevel !== undefined ? `Level ${ev.eventLevel}` : 'N/A',
                    createdBy: ev.createdBy || 'N/A',
                    createdByUser: parsedFormData?.createdByUser || null,
                    organization_ids: parsedFormData?.organization_id || [],

                    // 2. LOCATION & TRAVEL
                    location: {
                        name: ev.location || '',
                        type: formatLocationType(ev.locationType || ''),
                        selected: ev.location || '',
                        room_type: parsedFormData?.location?.room_type || '',
                        virtual_link: parsedFormData?.location?.virtual_link || parsedFormData?.form_data?.location?.virtual_link || '',
                    },
                    onCampus: parsedFormData?.form_data?.location || parsedFormData?.location || null,

                    // 3. THE "EVERYTHING" NESTED DATA (Matches your Budget JSX paths)
                    form_data: {
                        // Location & Travel
                        location: parsedFormData?.form_data?.location || parsedFormData?.location || {},
                        travel: parsedFormData?.form_data?.travel || parsedFormData?.travel || {},

                        // Elements
                        food: parsedFormData?.form_data?.food || parsedFormData?.food || {},
                        fire: parsedFormData?.form_data?.fire || parsedFormData?.fire || {},

                        // Budget & Vendors (New Fields Added Here)
                        level0_confirmed: parsedFormData?.form_data?.level0_confirmed ?? parsedFormData?.level0_confirmed,
                        vendors: parsedFormData?.form_data?.vendors || parsedFormData?.vendors || [],
                        vendors_notice_acknowledged: parsedFormData?.form_data?.vendors_notice_acknowledged ?? parsedFormData?.vendors_notice_acknowledged,

                        // Non-Vendor Services
                        non_vendor_services: parsedFormData?.form_data?.non_vendor_services || parsedFormData?.non_vendor_services || {},
                        non_vendor_services_notes: parsedFormData?.form_data?.non_vendor_services_notes || parsedFormData?.non_vendor_services_notes || '',
                        non_vendor_services_acknowledged: parsedFormData?.form_data?.non_vendor_services_acknowledged ?? parsedFormData?.non_vendor_services_acknowledged,

                        // Funding
                        funding: parsedFormData?.form_data?.funding || parsedFormData?.funding || {
                            account_number: parsedFormData?.account || '', // Fallback to legacy field
                            funding_source: ''
                        },
                    },

                    // 4. FLATTENED ELEMENTS (For the Event Elements Card)
                    food: parsedFormData?.form_data?.food || parsedFormData?.food || null,
                    alcohol: parsedFormData?.form_data?.alcohol || parsedFormData?.alcohol || null,
                    minors: parsedFormData?.form_data?.minors || parsedFormData?.minors || null,
                    movies: parsedFormData?.form_data?.movies || parsedFormData?.movies || null,
                    raffles: parsedFormData?.form_data?.raffles || parsedFormData?.raffles || null,
                    fire: parsedFormData?.form_data?.fire || parsedFormData?.fire || null,
                    sorc_games: parsedFormData?.form_data?.sorc_games || parsedFormData?.sorc_games || null,

                    // 5. TOP-LEVEL BUDGET (For the Stat boxes at the top)
                    vendors: parsedFormData?.form_data?.vendors || parsedFormData?.vendors || [],
                    budget: parsedFormData?.budget?.total_purchase || parsedFormData?.estimatedCost || '',
                    account: parsedFormData?.budget?.account_code || parsedFormData?.form_data?.budget?.account_number || '',
                    vendor: parsedFormData?.budget?.vendor_needed === true ? 'yes' : 'no',
                };
                setFormData(mapped);
            }
            return;
        }


        // No `id` provided: fallback to previous localStorage behavior
        const dataLs = localStorage.getItem("eventFormData");
        if (dataLs) {
            setFormData(JSON.parse(dataLs));
        }
    }, [eventId, data, loading]);

    // Helper function to render fields with consistent styling and handle empty values
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

    // Create refs for each section
    const eventDetailsRef = useRef<HTMLDivElement>(null);
    const dateLocationRef = useRef<HTMLDivElement>(null);
    const eventElementsRef = useRef<HTMLDivElement>(null);
    const budgetPurchaseRef = useRef<HTMLDivElement>(null);
    
    return (
        <div className="container m-8 w-auto">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            {
                (() => {
                    const rawImg = data?.event?.eventImg;
                    const uploadsBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
                        ? 'https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/'
                        : `${window.location.origin}/~ojk25/jrProjGreenlight/`;
                    const imgSrc = rawImg
                        ? (/^https?:\/\//i.test(rawImg) || rawImg.startsWith('/')
                            ? rawImg
                            : `${uploadsBase}uploads/event_img/${rawImg}`.replace(/\\/g, '/'))
                        : undefined;
                    return <OptimizedImage placeholder="grey" src={imgSrc} alt="Event header" style={{ width: '100%', height: 365, objectFit: 'cover', borderRadius: '.25rem' }} />;
                })()
            }

            <section style={{ display: "flex", flexDirection: "row", marginTop: "2rem", gap: "2rem" }}>
                <section style={{
                    position: "sticky",
                    top: "1rem",
                    height: "fit-content", 
                    zIndex: 10
                }}>
                    <NavMini links={[
                        { title: 'Event Details', ref: eventDetailsRef },
                        { title: 'Date & Location', ref: dateLocationRef },
                        { title: 'Event Elements', ref: eventElementsRef },
                        { title: 'Budget & Purchase', ref: budgetPurchaseRef },
                    ]} />
                </section>

                <section style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Title level={2} style={{ margin: 0 }}>{formData?.event?.name || "Event"}</Title>
                            {(() => {
                                const statusInfo = getStatusDisplay(formData?.eventStatus, formData?.event?.dateRange?.[0]);
                                if (statusInfo) {
                                    return (
                                        <Tag className={`${statusInfo.className} statusTag`}>
                                            {statusInfo.text}
                                        </Tag>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/event-form/${eventId}`)}
                        >
                            Edit Submission
                        </Button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Paragraph style={{ margin: 0 }}>Created By:</Paragraph>
                        {(() => {
                            const base = (import.meta as any).env?.BASE_URL ?? '/';

                            // Try to get profile image from creatorUser query first, then fallback to formData
                            const profileImg = creatorUser?.profileImg || formData?.createdByUser?.profileImg;
                            const firstName = creatorUser?.firstName || formData?.createdByUser?.firstName;
                            const lastName = creatorUser?.lastName || formData?.createdByUser?.lastName;

                            // Generate avatar src if profile image is available
                            const avatarSrc = profileImg
                                ? `${base}uploads/profile_img/${profileImg}`.replace(/\\/g, '/')
                                : undefined;

                            // Generate initials for fallback
                            const initials = firstName && lastName
                                ? `${firstName[0]}${lastName[0]}`.toUpperCase()
                                : formData?.createdBy && formData.createdBy !== 'N/A'
                                    ? formData.createdBy.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                    : '?';

                            // Generate tooltip text (just the user's name)
                            const tooltipText = firstName && lastName
                                ? `${firstName} ${lastName}`
                                : formData?.createdBy && formData.createdBy !== 'N/A'
                                    ? formData.createdBy
                                    : 'Unknown user';

                            return (
                                <Tooltip title={tooltipText} placement="right">
                                    <Avatar
                                        src={avatarSrc}
                                        style={{ backgroundColor: 'var(--gray-1)', cursor: 'pointer', height: '1.75rem', width: '1.75rem' }}
                                    >
                                        {!avatarSrc && initials}
                                    </Avatar>
                                </Tooltip>
                            );
                        })()}
                    </div>

                    <div className='flex flex-wrap' style={{ gap: "0.25rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
                        {formData?.event?.dateRange?.[0] ? <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{formatDateMDY(formData.event.dateRange[0])}</Tag> : null}
                        {formData?.startTime ? <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(formData.startTime)}</Tag> : null}
                        {formData?.location.name ? <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{formData.location.name}</Tag> : null}
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", gap: "1.5rem", marginBottom: "2rem" }}>
                        <Statistic className="stat-card-gray-border" title="Event Level" value={formData?.eventLevel || "N/A"} />
                        <Statistic
                            className="stat-card-gray-border"
                            title="Estimated Cost"
                            value={(() => {
                                const cost = calculateEstimatedCost(formData);
                                return cost === 'N/A' ? 'N/A' : `$${cost}`;
                            })()}
                        />
                        <Statistic className="stat-card-gray-border" title="Estimated Attendees" value={formData?.event?.attendees || "N/A"} />
                        <Statistic className="stat-card-gray-border" title="Location Type" value={formData?.location?.type || "N/A"} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* EVENT DETAILS SECTION */}
                        <Card id="section-1" ref={eventDetailsRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "4.5rem" }}>
                            <Title level={3}>Event Details</Title>

                            {renderField("Event Name", formData?.event?.name)}
                            {renderField("Description", formData?.event?.description, {
                                preserveWhitespace: true
                            })}
                            {renderField("Attendees", formData?.event?.attendees)}
                        </Card>

                        {/* DATE & LOCATION SECTION */}
                        <Card id="section-2" ref={dateLocationRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "4.5rem" }}>
                            <Title level={3}>Date & Location</Title>

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
                        <Card id="section-3" ref={eventElementsRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "4.5rem" }}>
                            <Title level={3}>Event Elements</Title>
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
                                        userData?.users?.find(
                                            (u) => u.id === formData?.minors?.student_contact_id
                                        )
                                            ? `${userData.users.find(
                                                (u) => u.id === formData?.minors?.student_contact_id
                                            )?.firstName || ""} ${userData.users.find(
                                                (u) => u.id === formData?.minors?.student_contact_id
                                            )?.lastName || ""
                                            } (@${userData.users.find(
                                                (u) => u.id === formData?.minors?.student_contact_id
                                            )?.username || ""
                                            })`
                                            : null
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
                        <Card id="section-4" ref={budgetPurchaseRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "4.5rem" }}>
                            <Title level={3}>Budget & Purchase</Title>

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
                    <CommentInput />
                </section>
            </section>
            <ScrollToTop />
        </div>

    );
}