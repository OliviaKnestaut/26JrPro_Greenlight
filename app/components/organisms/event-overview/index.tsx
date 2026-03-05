// ── React & Third-Party Libraries ──────────────────────────────────────────
import React, { useRef, useState, useEffect } from "react";
import { Typography, Statistic, Card, Tag, Avatar, Tooltip, Button, Popover } from "antd";
import { ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined, PushpinOutlined, EditOutlined, InfoCircleOutlined, StarTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// ── Internal: GraphQL & Utilities ──────────────────────────────────────────
import { useGetEventByIdQuery, useGetUsersQuery, useGetUserQuery } from '~/lib/graphql/generated';
import { formatTime, formatDateMDY, formatDuration } from '~/lib/formatters';

// ── Internal: Components ────────────────────────────────────────────────────
import NavMini from "../../molecules/nav-mini";
import OptimizedImage from '../../atoms/OptimizedImage';
import CommentInput from '../../molecules/comment-input';
import ScrollToTop from '../../atoms/ScrollToTop';

const { Title, Paragraph, Link } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// EventOverviewContent
//
// Reads an event ID from the query string (?id=...), fetches the event and its
// creator profile via GraphQL, maps the raw data into a flat display shape,
// and renders a sticky-nav read-only overview of all event fields.
// Falls back to a localStorage snapshot when no ID is present.
// ─────────────────────────────────────────────────────────────────────────────
export function EventOverviewContent() {

    // ── Router & State ─────────────────────────────────────────────────────
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>(null);

    // ── Section Refs (sticky-nav scroll targets) ────────────────────────────
    const eventDetailsRef = useRef<HTMLDivElement>(null);
    const dateLocationRef = useRef<HTMLDivElement>(null);
    const eventElementsRef = useRef<HTMLDivElement>(null);
    const budgetPurchaseRef = useRef<HTMLDivElement>(null);

    // ── Pure Display Helpers ────────────────────────────────────────────────

    // Converts a raw locationType enum (e.g. "ON_CAMPUS") to a human-readable string.
    const formatLocationType = (val?: string) => {
        if (!val) return '';
        const map: Record<string, string> = {
            'ON_CAMPUS': 'On Campus',
            'OFF_CAMPUS': 'Off Campus',
            'VIRTUAL': 'Virtual',
        };
        const key = String(val).toUpperCase();
        if (map[key]) return map[key];
        // Fallback: convert snake_case to Title Case
        return String(val).replace(/_/g, ' ').split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
    };

    // Sums all applicable costs (non-food vendors + food + raffles) into a
    // formatted dollar string. Food-type vendors are skipped to avoid double-counting.
    const calculateEstimatedCost = (formData: any): string => {
        let total = 0;
        let hasCosts = false;

        // Non-food vendor costs (food vendors are excluded — food section has its own estimated_cost)
        if (formData?.vendors && Array.isArray(formData.vendors)) {
            formData.vendors.forEach((vendor: any) => {
                if (vendor.type === "food") return;
                const cost = parseFloat(vendor.estimatedCost);
                if (!isNaN(cost) && cost > 0) { total += cost; hasCosts = true; }
            });
        }

        // Food section cost
        if (formData?.food?.estimated_cost) {
            const cost = parseFloat(formData.food.estimated_cost);
            if (!isNaN(cost) && cost > 0) { total += cost; hasCosts = true; }
        }

        // Raffle prize cost
        if (formData?.raffles?.estimated_cost) {
            const cost = parseFloat(formData.raffles.estimated_cost);
            if (!isNaN(cost) && cost > 0) { total += cost; hasCosts = true; }
        }

        return hasCosts ? total.toFixed(2) : 'N/A';
    };

    // Maps an event status string (and optional date) to a display label + CSS class name.
    // Approved events whose date has passed are shown as "past event".
    const getStatusDisplay = (status?: string, eventDate?: string) => {
        if (!status) return null;
        const statusUpper = status.toUpperCase();

        let isPast = false;
        if (eventDate) {
            const date = new Date(eventDate);
            if (!isNaN(date.getTime())) isPast = date < new Date();
        }

        if (statusUpper === 'APPROVED' && isPast) return { text: 'past event', className: 'pastTag' };
        if (statusUpper === 'APPROVED')            return { text: 'approved',   className: 'approvedTag' };
        if (statusUpper === 'REVIEW')              return { text: 'in-review',  className: 'inReviewTag' };
        if (statusUpper === 'DRAFT')               return { text: 'in-draft',   className: 'inDraftTag' };
        if (statusUpper === 'CANCELLED')           return { text: 'cancelled',  className: 'cancelledTag' };
        return { text: status.toLowerCase(), className: '' };
    };

    // Renders a labelled read-only field row. Returns null for empty/undefined
    // values so callers can use it unconditionally without producing blank rows.
    const renderField = (
        label: string,
        value: any,
        options?: {
            preserveWhitespace?: boolean;
            transform?: (val: any) => React.ReactNode;
        }
    ) => {
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
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
                <Paragraph style={{ whiteSpace: options?.preserveWhitespace ? "pre-wrap" : "normal" }}>
                    {displayValue}
                </Paragraph>
            </div>
        );
    };

    // ── Event ID (from query string) ────────────────────────────────────────
    // Route: /event-overview?id=11 — ID lives in the query string, not the path.
    const eventId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;

    // ── GraphQL Queries ─────────────────────────────────────────────────────

    // Primary event query
    const { data, loading } = useGetEventByIdQuery({
        variables: { id: eventId ?? '' },
        skip: !eventId,
    });

    // Fetch the creator's profile by username for the avatar display
    const creatorUsername = data?.event?.createdBy;
    const { data: userData } = useGetUsersQuery({
        variables: { limit: 1, offset: 0, username: creatorUsername },
        skip: !creatorUsername || creatorUsername === 'N/A',
    });
    const creatorUser = userData?.users?.[0];

    // Fetch the trip leader's full name (only used for off-campus travel)
    const tripLeaderId = formData?.form_data?.travel?.trip_leader_id;
    const { data: tripLeaderData } = useGetUserQuery({
        variables: { id: tripLeaderId as string },
        skip: !tripLeaderId,
    });
    const tripLeader = tripLeaderData?.user || null;

    // ── Data Mapping Effect ─────────────────────────────────────────────────
    // Maps raw Apollo data into the flat `formData` shape consumed by the render.
    // Falls back to a localStorage snapshot when no eventId is present.
    useEffect(() => {
        if (eventId) {
            // Wait for the query to finish before mapping — prevents a premature
            // localStorage fallback while the network request is in-flight.
            if (!loading && data?.event) {
                const ev = data.event;

                // Parse ev.formData from JSON string if needed
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

                // Treats an empty object {} as null so element guards like
                // {formData?.alcohol && ...} don't fire on unselected elements.
                const ne = (v: any) =>
                    v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0
                        ? null
                        : v ?? null;

                const mapped = {
                    // 1. EVENT METADATA
                    event: {
                        name: ev.title || '',
                        description: ev.description || '',
                        attendees: parsedFormData?.attendees || '',
                        dateRange: ev.eventDate ? [ev.eventDate, ev.eventDate] : [],
                    },
                    eventStatus:  ev.eventStatus || 'N/A',
                    startTime:    ev.startTime   || 'N/A',
                    endTime:      ev.endTime     || 'N/A',
                    setupTime:    ev.setupTime   || 'N/A',
                    eventLevel:   ev.eventLevel !== undefined ? `Level ${ev.eventLevel}` : 'N/A',
                    createdBy:    ev.createdBy   || 'N/A',
                    // createdByUser is kept as a fallback for when the users query hasn't resolved yet
                    createdByUser: parsedFormData?.createdByUser || null,

                    // 2. LOCATION & TRAVEL
                    location: {
                        name:         ev.location || '',
                        type:         formatLocationType(ev.locationType || ''),
                        selected:     ev.location || '',
                        room_type:    parsedFormData?.location?.room_type || '',
                        virtual_link: parsedFormData?.location?.virtual_link
                                        || parsedFormData?.form_data?.location?.virtual_link
                                        || parsedFormData?.virtual_link
                                        || '',
                    },
                    // onCampus holds the full location sub-object used inside the On Campus block
                    onCampus: parsedFormData?.form_data?.location || parsedFormData?.location || null,

                    // 3. NESTED FORM DATA
                    // This mirrors the shape expected by the Budget & Elements sections.
                    form_data: {
                        // Location & Travel
                        location: parsedFormData?.form_data?.location || parsedFormData?.location || {},
                        travel:   parsedFormData?.form_data?.travel   || parsedFormData?.travel   || {},

                        // Elements (food + fire live here for the form_data path)
                        food: parsedFormData?.form_data?.food || parsedFormData?.food || {},
                        fire: parsedFormData?.form_data?.fire || parsedFormData?.fire || {},

                        // Budget & Vendors
                        level0_confirmed:             parsedFormData?.form_data?.level0_confirmed ?? parsedFormData?.level0_confirmed,
                        vendors:                      parsedFormData?.form_data?.vendors || parsedFormData?.vendors || [],
                        vendors_notice_acknowledged:  parsedFormData?.form_data?.vendors_notice_acknowledged ?? parsedFormData?.vendors_notice_acknowledged,

                        // Non-Vendor Services
                        non_vendor_services:              parsedFormData?.form_data?.non_vendor_services       || parsedFormData?.non_vendor_services       || {},
                        non_vendor_services_notes:        parsedFormData?.form_data?.non_vendor_services_notes || parsedFormData?.non_vendor_services_notes || '',
                        non_vendor_services_acknowledged: parsedFormData?.form_data?.non_vendor_services_acknowledged ?? parsedFormData?.non_vendor_services_acknowledged,

                        // Funding (falls back to legacy `account` field)
                        funding: parsedFormData?.form_data?.funding || parsedFormData?.funding || {
                            account_number: parsedFormData?.account || '',
                            funding_source: '',
                        },

                        // Budget (mirrors any existing budget; falls back to funding/account)
                        budget:
                            parsedFormData?.form_data?.budget ||
                            parsedFormData?.budget || {
                                source:
                                    parsedFormData?.form_data?.funding?.funding_source ??
                                    parsedFormData?.funding?.funding_source ??
                                    '',
                                account_number:
                                    parsedFormData?.form_data?.funding?.account_number ??
                                    parsedFormData?.funding?.account_number ??
                                    parsedFormData?.account ??
                                    '',
                            },
                        // Element selection flags (used when detail objects are absent)
                        elements: parsedFormData?.form_data?.elements || parsedFormData?.elements || null,
                    },

                    // 4. FLATTENED ELEMENTS — used by the Event Elements card.
                    // ne() collapses empty {} to null so guards like {formData?.alcohol && ...}
                    // don't fire on elements that were never filled out.
                    food:       ne(parsedFormData?.form_data?.food)       ?? ne(parsedFormData?.food),
                    alcohol:    ne(parsedFormData?.form_data?.alcohol)    ?? ne(parsedFormData?.alcohol),
                    minors:     ne(parsedFormData?.form_data?.minors)     ?? ne(parsedFormData?.minors),
                    movies:     ne(parsedFormData?.form_data?.movies)     ?? ne(parsedFormData?.movies),
                    raffles:    ne(parsedFormData?.form_data?.raffles)    ?? ne(parsedFormData?.raffles),
                    fire:       ne(parsedFormData?.form_data?.fire)       ?? ne(parsedFormData?.fire),
                    sorc_games: ne(parsedFormData?.form_data?.sorc_games) ?? ne(parsedFormData?.sorc_games),

                    // 5. TOP-LEVEL VENDORS — used by calculateEstimatedCost
                    vendors: parsedFormData?.form_data?.vendors || parsedFormData?.vendors || [],
                };

                setFormData(mapped);
            }
            return;
        }

        // No `id` in the URL: fall back to the localStorage draft snapshot
        const dataLs = localStorage.getItem("eventFormData");
        if (dataLs) setFormData(JSON.parse(dataLs));
    }, [eventId, data, loading]);

    // ── Label Lookup Maps ───────────────────────────────────────────────────

    // Human-readable labels for SORC game type keys
    const gameLabels: Record<string, string> = {
        mechanical_bull:         "Mechanical Bull",
        velcro_wall:             "Velcro Wall",
        human_hamster_balls:     "Human Hamster Balls",
        giant_slide:             "Giant Slide",
        obstacle_course:         "Obstacle Course",
        dunk_tank:               "Dunk Tank",
        bungee_run:              "Bungee Run",
        jousting_arena:          "Jousting Arena",
        giant_connect_four:      "Giant Connect Four",
        giant_jenga:             "Giant Jenga",
        carnival_game_booths:    "Carnival Game Booths",
        casino_tables:           "Casino Tables",
        photo_booth:             "Photo Booth",
        inflatable_sports_games: "Inflatable Sports Games",
    };

    // Human-readable labels for non-vendor service type keys
    const nonVendorServiceLabels: Record<string, string> = {
        av_support:       "A/V Support",
        custodial_safety: "Custodial & Safety",
        public_safety:    "Public Safety",
        facilities:       "Facilities/Custodial",
        parking:          "Parking Services",
        signage:          "Signage & Wayfinding",
        furniture_rental: "University Furniture Rental",
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="container m-8 w-auto">

            {/* ── Back Navigation ── */}
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate('/event-submissions')}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>

            {/* ── Hero / Event Image ── */}
            {(() => {
                const rawImg = data?.event?.eventImg;
                const uploadsBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
                    ? 'https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/'
                    : `${window.location.origin}/~ojk25/jrProjGreenlight/`;
                const imgSrc = rawImg
                    ? (/^https?:\/\//i.test(rawImg) || rawImg.startsWith('/')
                        ? rawImg
                        : `${uploadsBase}uploads/event_img/${rawImg}`.replace(/\\/g, '/'))
                    : undefined;
                return (
                    <OptimizedImage
                        placeholder="grey"
                        src={imgSrc}
                        alt="Event header"
                        style={{ width: '100%', height: 365, objectFit: 'cover', borderRadius: '.25rem' }}
                    />
                );
            })()}

            {/* ── Page Body: sticky nav + content ── */}
            <section style={{ display: "flex", flexDirection: "row", marginTop: "2rem", gap: "2rem" }}>

                {/* Sticky side-nav */}
                <section style={{ position: "sticky", top: "1rem", height: "fit-content", zIndex: 10 }}>
                    <NavMini links={[
                        { title: 'Event Details',    ref: eventDetailsRef },
                        { title: 'Date & Location',  ref: dateLocationRef },
                        { title: 'Event Elements',   ref: eventElementsRef },
                        { title: 'Budget & Purchase', ref: budgetPurchaseRef },
                    ]} />
                </section>

                {/* Main content column */}
                <section style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>

                    {/* ── Event Title + Status Tag + Edit Button ── */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Title level={2} style={{ margin: 0 }}>{formData?.event?.name || "Event"}</Title>
                            {(() => {
                                const statusInfo = getStatusDisplay(formData?.eventStatus, formData?.event?.dateRange?.[0]);
                                if (!statusInfo) return null;
                                return (
                                    <Tag className={`${statusInfo.className} statusTag`}>
                                        {statusInfo.text}
                                    </Tag>
                                );
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

                    {/* ── Creator Avatar ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Paragraph style={{ margin: 0 }}>Created By:</Paragraph>
                        {(() => {
                            const base = (import.meta as any).env?.BASE_URL ?? '/';

                            // Prefer the live query result; fall back to the snapshot saved in formData
                            const profileImg = creatorUser?.profileImg || formData?.createdByUser?.profileImg;
                            const firstName  = creatorUser?.firstName  || formData?.createdByUser?.firstName;
                            const lastName   = creatorUser?.lastName   || formData?.createdByUser?.lastName;

                            const avatarSrc = profileImg
                                ? `${base}uploads/profile_img/${profileImg}`.replace(/\\/g, '/')
                                : undefined;

                            // Initials fallback when no profile image is available
                            const initials = firstName && lastName
                                ? `${firstName[0]}${lastName[0]}`.toUpperCase()
                                : formData?.createdBy && formData.createdBy !== 'N/A'
                                    ? formData.createdBy.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                    : '?';

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

                    {/* ── Quick-Info Tags (date / time / location) ── */}
                    <div className='flex flex-wrap' style={{ gap: "0.25rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
                        {formData?.event?.dateRange?.[0] && (
                            <Tag className="eventDetailTag" icon={<CalendarOutlined />}>
                                {formatDateMDY(formData.event.dateRange[0])}
                            </Tag>
                        )}
                        {formData?.startTime && (
                            <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>
                                {formatTime(formData.startTime)}
                            </Tag>
                        )}
                        {formData?.location.name && (
                            <Tag className="eventDetailTag" icon={<PushpinOutlined />}>
                                {formData.location.name}
                            </Tag>
                        )}
                    </div>

                    {/* ── Stat Cards ── */}
                    <div style={{ display: "flex", flexDirection: "row", gap: "1.5rem", marginBottom: "2rem" }}>

                        {/* Event Level — includes a popover explaining each level */}
                        <Statistic
                            className="stat-card-gray-border"
                            title={
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                    Event Level
                                    <Popover
                                        title="Event Approval Levels"
                                        trigger="click"
                                        content={
                                            <div style={{ maxWidth: 400 }}>
                                                <ul style={{ margin: 0, paddingLeft: 10, marginBottom: 8 }}>
                                                    <li style={{ marginBottom: 4 }}>
                                                        <StarTwoTone twoToneColor={["var(--lavender-6)", "var(--lavender-1)"]} style={{ marginRight: 6 }} />
                                                        <strong>Level 0</strong> (Requires 12 Business Days Notice): &lt;100 Drexel-only guests. 1 space. No travel/contracts/purchases.
                                                    </li>
                                                    <li style={{ marginBottom: 4 }}>
                                                        <StarTwoTone twoToneColor={["var(--green-6)", "var(--green-1)"]} style={{ marginRight: 6 }} />
                                                        <strong>Level 1</strong> (Requires 3 Weeks Notice): &lt;150 guests (includes external). Regional day trips. Movies or Fire Pits. 1–2 unpaid speakers.
                                                    </li>
                                                    <li style={{ marginBottom: 4 }}>
                                                        <StarTwoTone twoToneColor={["var(--gold-5)", "var(--gold-1)"]} style={{ marginRight: 6 }} />
                                                        <strong>Level 2</strong> (Requires 5 Weeks Notice): 150+ guests. Regional overnight trips. Paid contracts (preferred vendors). Grant applications.
                                                    </li>
                                                    <li style={{ marginBottom: 4 }}>
                                                        <StarTwoTone twoToneColor={["var(--red-5)", "var(--red-1)"]} style={{ marginRight: 6 }} />
                                                        <strong>Level 3</strong> (Requires 8 Weeks Notice): International or &gt;150 mile travel. Non-preferred vendors. Any purchase &gt;$4,999.99. Events with alcohol, minors, or animals.
                                                    </li>
                                                </ul>
                                            </div>
                                        }
                                    >
                                        <InfoCircleOutlined style={{ color: "var(--gray-9)", cursor: "pointer", fontSize: 13 }} />
                                    </Popover>
                                </span>
                            }
                            value={formData?.eventLevel || "N/A"}
                            formatter={(val) => {
                                const level = String(val);
                                const colorMap: Record<string, [string, string]> = {
                                    "Level 0": ["var(--lavender-6)", "var(--lavender-1)"],
                                    "Level 1": ["var(--green-6)",    "var(--green-1)"],
                                    "Level 2": ["var(--gold-5)",     "var(--gold-1)"],
                                    "Level 3": ["var(--red-5)",      "var(--red-1)"],
                                };
                                const color = colorMap[level];
                                return (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        {color && <StarTwoTone twoToneColor={color} />}
                                        {level}
                                    </span>
                                );
                            }}
                        />

                        <Statistic
                            className="stat-card-gray-border"
                            title="Estimated Cost"
                            value={(() => {
                                const cost = calculateEstimatedCost(formData);
                                return cost === 'N/A' ? 'N/A' : `$${cost}`;
                            })()}
                        />
                        <Statistic className="stat-card-gray-border" title="Estimated Attendees" value={formData?.event?.attendees || "N/A"} />
                        <Statistic className="stat-card-gray-border" title="Location Type"        value={formData?.location?.type || "N/A"} />
                    </div>

                    {/* ── Section Cards ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                        {/* ── SECTION 1: Event Details ── */}
                        <Card
                            id="section-1"
                            ref={eventDetailsRef}
                            style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "4.5rem" }}
                        >
                            <Title level={3}>Event Details</Title>
                            {renderField("Event Name",   formData?.event?.name)}
                            {renderField("Description",  formData?.event?.description, { preserveWhitespace: true })}
                            {renderField("Attendees",    formData?.event?.attendees)}
                        </Card>

                        {/* ── SECTION 2: Date & Location ── */}
                        <Card
                            id="section-2"
                            ref={dateLocationRef}
                            style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "4.5rem" }}
                        >
                            <Title level={3}>Date & Location</Title>

                            {renderField("Location Type", formData?.location?.type)}
                            {renderField("Event Date",    formatDateMDY(formData?.event?.dateRange?.[0]))}
                            {renderField("Start Time",    formatTime(formData?.startTime))}
                            {renderField("End Time",      formatTime(formData?.endTime))}
                            {renderField("Setup Time",    formatDuration(formData?.setupTime))}

                            {/* Virtual */}
                            {formData?.location?.type === "Virtual" &&
                                renderField("Virtual Event Link", formData?.location?.virtual_link)
                            }

                            {/* On Campus */}
                            {formData?.location?.type === "On Campus" && formData?.onCampus && (
                                <>
                                    {renderField("On Campus Location", formData?.location?.selected)}
                                    {renderField("Room Type",          formData?.location?.room_type)}
                                    {renderField("Room Title/Number",  formData.onCampus.room_title)}
                                    {renderField("Special Space Alignment", formData.onCampus.special_space_alignment, { preserveWhitespace: true })}
                                    {renderField("Rain Plan",   formData.onCampus.rain_location)}
                                    {renderField("Room Setup",  formData.onCampus.room_setup)}

                                    {/* Furniture list */}
                                    {Array.isArray(formData.onCampus.furniture) && formData.onCampus.furniture.length > 0 && (
                                        <div style={{ marginBottom: 16 }}>
                                            <Title level={5}>Furniture</Title>
                                            {formData.onCampus.furniture.map((f: any, idx: number) => (
                                                <Paragraph key={idx}>{f.type} × {f.quantity}</Paragraph>
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
                                        )
                                    }
                                    {formData.onCampus.utilities?.water_required &&
                                        renderField("Water Access Required", "Yes")
                                    }
                                </>
                            )}

                            {/* Off Campus */}
                            {formData?.location?.type === "Off Campus" && (
                                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                                    <Title level={4}>Off-Campus Details</Title>

                                    {renderField("Address", formData?.form_data?.location?.off_campus_address)}

                                    {formData?.form_data?.location?.google_maps_link &&
                                        renderField("Google Maps Link", formData.form_data.location.google_maps_link, {
                                            transform: (val) => <Link href={val} target="_blank">View on Maps</Link>,
                                        })
                                    }

                                    {renderField("Travel Type",     formData?.form_data?.travel?.type)}
                                    {renderField("Transportation",  formData?.form_data?.travel?.transportation)}

                                    {renderField(
                                        "Trip Leader",
                                        tripLeader
                                            ? `${tripLeader.firstName || ""} ${tripLeader.lastName || ""} (@${tripLeader.username})`.trim()
                                            : null
                                    )}

                                    {formData?.form_data?.travel?.trip_leader_emergency_contact &&
                                        renderField("Emergency Contact", formData.form_data.travel.trip_leader_emergency_contact, {
                                            transform: (contact) =>
                                                contact?.name
                                                    ? contact.phone ? `${contact.name} - ${contact.phone}` : contact.name
                                                    : null,
                                        })
                                    }

                                    {renderField("Lodging", formData?.form_data?.travel?.lodging, { preserveWhitespace: true })}

                                    {formData?.form_data?.travel?.eap_file &&
                                        renderField("Emergency Action Plan", formData.form_data.travel.eap_file, {
                                            transform: (file) => typeof file === "string" ? file : file?.name || "Uploaded",
                                        })
                                    }
                                </div>
                            )}
                        </Card>

                        {/* ── SECTION 3: Event Elements ── */}
                        <Card
                            id="section-3"
                            ref={eventElementsRef}
                            style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "4.5rem" }}
                        >
                            <Title level={3}>Event Elements</Title>

                            {/* Show fallback when no elements are present.
                                Relies on actual data objects (not stale flags) so corrupt saves
                                where elements.food=true but food={} still resolve correctly. */}
                            {(formData?.form_data?.elements?.no_additional_elements === true ||
                                (!formData?.food && !formData?.alcohol && !formData?.minors &&
                                    !formData?.movies && !formData?.raffles && !formData?.fire &&
                                    !formData?.sorc_games)) && (
                                <Paragraph>No special elements selected</Paragraph>
                            )}

                            {/* Food */}
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
                                renderField("Vendor / Restaurant", formData?.food?.vendor)
                            }
                            {formData?.food?.estimated_cost != null &&
                                renderField("Estimated Cost", `$${Number(formData?.food?.estimated_cost).toLocaleString()}`)
                            }

                            {/* Alcohol */}
                            {formData?.alcohol && (
                                <div style={{ marginTop: 24 }}>
                                    <Title level={4}>Alcohol Details</Title>

                                    {renderField("Alcohol Vendor", formData?.alcohol?.vendor)}
                                    {renderField(
                                        "Event Type",
                                        formData?.alcohol?.event_type === "drexel_only"  ? "Drexel Students Only Event - No guests"
                                        : formData?.alcohol?.event_type === "date_party"  ? "Date Party / Invitation Only Event"
                                        : formData?.alcohol?.event_type === "multiple_org" ? "Multiple Organization Event"
                                        : formData?.alcohol?.event_type === "alumni"       ? "Alumni Event"
                                        : undefined
                                    )}

                                    {/* Faculty/Staff supervisor fields */}
                                    {formData?.alcohol?.faculty_staff && (
                                        <>
                                            {renderField("Faculty/Staff Name",  formData?.alcohol?.faculty_staff?.name)}
                                            {renderField("Faculty/Staff Title", formData?.alcohol?.faculty_staff?.title)}
                                            {renderField("Faculty/Staff Email", formData?.alcohol?.faculty_staff?.email)}
                                            {renderField("Faculty/Staff Phone", formData?.alcohol?.faculty_staff?.phone)}
                                        </>
                                    )}

                                    {renderField(
                                        "Guests Under 21",
                                        formData?.alcohol?.guests_under_21 === "yes" ? "Yes"
                                        : formData?.alcohol?.guests_under_21 === "no" ? "No"
                                        : undefined
                                    )}
                                    {renderField("ID Checking Procedure",  formData?.alcohol?.id_procedure,   { preserveWhitespace: true })}
                                    {renderField("Food Available at Event", formData?.alcohol?.food_description, { preserveWhitespace: true })}

                                    {/* Policy agreement checklist */}
                                    {formData?.alcohol?.checklist && (
                                        <div style={{ marginTop: 16 }}>
                                            <Title level={5}>Alcohol Policy Agreements</Title>
                                            {renderField("ID Check Procedure Defined",       formData?.alcohol?.checklist?.id_check              ? "Agreed" : null)}
                                            {renderField("Approved Vendor Providing Service", formData?.alcohol?.checklist?.approved_vendor        ? "Agreed" : null)}
                                            {renderField("Hard Liquor Charged to Individual", formData?.alcohol?.checklist?.hard_liquor_charge      ? "Agreed" : null)}
                                            {renderField("No Drinking Games",                 formData?.alcohol?.checklist?.no_drinking_games       ? "Agreed" : null)}
                                            {renderField("No Liquor with University Funds",   formData?.alcohol?.checklist?.no_liquor_university_funds ? "Agreed" : null)}
                                            {renderField("Food Available Throughout Event",   formData?.alcohol?.checklist?.food_available          ? "Agreed" : null)}
                                            {renderField("Non-Salty Options Available",       formData?.alcohol?.checklist?.non_salty_options       ? "Agreed" : null)}
                                            {renderField("Heavy Appetizers Minimum",          formData?.alcohol?.checklist?.heavy_appetizers        ? "Agreed" : null)}
                                            {renderField("Alcohol Cutoff Policy",             formData?.alcohol?.checklist?.cutoff_time             ? "Agreed" : null)}
                                        </div>
                                    )}

                                    {renderField("Electronic Signature", formData?.alcohol?.signature_name)}
                                </div>
                            )}

                            {/* Minors */}
                            {formData?.minors && (
                                <div style={{ marginTop: 24 }}>
                                    <Title level={4}>Minors Information</Title>

                                    {/* Look up the student contact by id from the users query result */}
                                    {renderField(
                                        "Student Point of Contact",
                                        (() => {
                                            const contact = userData?.users?.find(
                                                (u) => u.id === formData?.minors?.student_contact_id
                                            );
                                            if (!contact) return null;
                                            return `${contact.firstName || ""} ${contact.lastName || ""} (@${contact.username || ""})`;
                                        })()
                                    )}

                                    {renderField("External Partners",               formData?.minors?.external_partners,    { preserveWhitespace: true })}
                                    {renderField("Intended Audience & Recruitment", formData?.minors?.audience_recruitment, { preserveWhitespace: true })}

                                    {/* Minor counts by age group */}
                                    {(formData?.minors?.count_early_childhood || formData?.minors?.count_elementary ||
                                        formData?.minors?.count_middle_school  || formData?.minors?.count_high_school) && (
                                        <div style={{ marginTop: 16 }}>
                                            <Title level={5}>Expected Number of Minors</Title>
                                            {renderField("Early Childhood (infant - Pre-K)", formData?.minors?.count_early_childhood)}
                                            {renderField("Elementary (K-5)",                 formData?.minors?.count_elementary)}
                                            {renderField("Middle School (6-8)",              formData?.minors?.count_middle_school)}
                                            {renderField("High School (9-12)",               formData?.minors?.count_high_school)}
                                            {renderField(
                                                "Total Minors",
                                                (Number(formData?.minors?.count_early_childhood || 0) +
                                                 Number(formData?.minors?.count_elementary       || 0) +
                                                 Number(formData?.minors?.count_middle_school    || 0) +
                                                 Number(formData?.minors?.count_high_school      || 0)) || null
                                            )}
                                        </div>
                                    )}

                                    {renderField("Overnight Housing Required",         formData?.minors?.overnight_housing           === true ? "Yes" : formData?.minors?.overnight_housing           === false ? "No" : null)}
                                    {renderField("Drexel Transportation Required",     formData?.minors?.drexel_transportation       === true ? "Yes" : formData?.minors?.drexel_transportation       === false ? "No" : null)}
                                    {renderField("Parent/Guardian Attendance Required", formData?.minors?.parent_attendance_required === true ? "Yes" : formData?.minors?.parent_attendance_required === false ? "No" : null)}
                                    {renderField("Minors Documentation Uploaded",      formData?.minors?.file ? "File Uploaded" : null)}
                                </div>
                            )}

                            {/* Movies */}
                            {formData?.movies && (
                                <div style={{ marginTop: 24 }}>
                                    <Title level={4}>Movie Permissions</Title>

                                    {renderField(
                                        "Permission Type",
                                        formData?.movies?.option_type === "option_1_written_permission" ? "Option 1: Written Copyright Permission"
                                        : formData?.movies?.option_type === "option_2_vendor"           ? "Option 2: Purchased Rights Through Vendor"
                                        : formData?.movies?.option_type === "option_3_educational"      ? "Option 3: Educational Lecture"
                                        : formData?.movies?.option_type === "option_4_closed_event"     ? "Option 4: Closed Event (50 or less attendees)"
                                        : null
                                    )}

                                    {/* Option 1: Written permission */}
                                    {formData?.movies?.option_type === "option_1_written_permission" && (
                                        <>
                                            <Title level={5} style={{ marginTop: 16 }}>Organization Obtains Written Permission</Title>
                                            {renderField("Movie Name",            formData?.movies?.option_1?.movie_name)}
                                            {renderField("Company/Individual Name", formData?.movies?.option_1?.company_name)}
                                            {renderField(
                                                "Contact Name",
                                                formData?.movies?.option_1?.contact_first_name || formData?.movies?.option_1?.contact_last_name
                                                    ? `${formData?.movies?.option_1?.contact_first_name || ""} ${formData?.movies?.option_1?.contact_last_name || ""}`.trim()
                                                    : null
                                            )}
                                            {renderField("Email",           formData?.movies?.option_1?.email)}
                                            {renderField("Phone",           formData?.movies?.option_1?.phone)}
                                            {renderField("Mailing Address", formData?.movies?.option_1?.mailing_address)}
                                            {renderField("Written Permission Documentation", formData?.movies?.option_1?.permission_file ? "File Uploaded" : null)}
                                        </>
                                    )}

                                    {/* Option 2: Purchased rights */}
                                    {formData?.movies?.option_type === "option_2_vendor" && (
                                        <>
                                            <Title level={5} style={{ marginTop: 16 }}>Organization Purchases Rights</Title>
                                            {renderField("Company/Individual Name", formData?.movies?.option_2?.company_name)}
                                            {renderField(
                                                "Contact Name",
                                                formData?.movies?.option_2?.contact_first_name || formData?.movies?.option_2?.contact_last_name
                                                    ? `${formData?.movies?.option_2?.contact_first_name || ""} ${formData?.movies?.option_2?.contact_last_name || ""}`.trim()
                                                    : null
                                            )}
                                            {renderField("Email", formData?.movies?.option_2?.email)}
                                            {renderField("Phone", formData?.movies?.option_2?.phone)}
                                            {renderField("Purchase Documentation", formData?.movies?.option_2?.purchase_documentation ? "File Uploaded" : null)}
                                        </>
                                    )}

                                    {/* Option 3: Educational lecture */}
                                    {formData?.movies?.option_type === "option_3_educational" && (
                                        <>
                                            <Title level={5} style={{ marginTop: 16 }}>Educational Lecture</Title>
                                            {renderField("Movie Name",              formData?.movies?.option_3?.movie_name)}
                                            {renderField("Facilitator Name",        formData?.movies?.option_3?.facilitator_name)}
                                            {renderField("Facilitator Email",       formData?.movies?.option_3?.facilitator_email)}
                                            {renderField("Facilitator Title",       formData?.movies?.option_3?.facilitator_title)}
                                            {renderField("Facilitator Department",  formData?.movies?.option_3?.facilitator_department)}
                                            {renderField("Discussion Questions",                formData?.movies?.option_3?.discussion_questions, { preserveWhitespace: true })}
                                            {renderField("Educational Relationship to Organization", formData?.movies?.option_3?.educational_relation, { preserveWhitespace: true })}
                                        </>
                                    )}

                                    {/* Option 4: Closed event */}
                                    {formData?.movies?.option_type === "option_4_closed_event" && (
                                        <>
                                            <Title level={5} style={{ marginTop: 16 }}>Closed Event (50 or Less)</Title>
                                            {renderField("Movie Name", formData?.movies?.option_4?.movie_name)}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Raffles */}
                            {formData?.raffles && (
                                <div style={{ marginTop: 24 }}>
                                    <Title level={4}>Raffle Information</Title>
                                    {renderField("Items Being Given Away & Purchase Plan", formData?.raffles?.items_and_purchase_plan, { preserveWhitespace: true })}
                                    {renderField("How Prizes Will Be Awarded",             formData?.raffles?.award_method,           { preserveWhitespace: true })}
                                    {renderField(
                                        "Estimated Cost",
                                        formData?.raffles?.estimated_cost != null
                                            ? `$${Number(formData?.raffles?.estimated_cost).toFixed(2)}`
                                            : null
                                    )}
                                </div>
                            )}

                            {/* Fire */}
                            {renderField("Fire Source Type", formData?.form_data?.fire?.type)}
                            {formData?.form_data?.fire?.type === "fire_pit_package" &&
                                renderField("Fire Pit Package Agreement", formData?.form_data?.fire?.fire_pit_agreement)
                            }
                            {renderField("Fire Safety Plan", formData?.form_data?.fire?.safety_plan)}

                            {/* SORC Games */}
                            {renderField(
                                "SORC Games Selected",
                                formData?.sorc_games?.selected?.length
                                    ? formData.sorc_games.selected.map((g: string) => gameLabels[g] || g).join(", ")
                                    : undefined
                            )}
                            {renderField("Games Setup Location", formData?.sorc_games?.location)}
                            {renderField(
                                "SORC Staff Present",
                                formData?.sorc_games?.staff_present === "yes" ? "Yes"
                                : formData?.sorc_games?.staff_present === "no"  ? "No"
                                : undefined
                            )}
                        </Card>

                        {/* ── SECTION 4: Budget & Purchase ── */}
                        <Card
                            id="section-4"
                            ref={budgetPurchaseRef}
                            style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "4.5rem" }}
                        >
                            <Title level={3}>Budget & Purchase</Title>

                            {renderField("Level 0 Event", formData?.form_data?.level0_confirmed ? "Yes" : "No")}

                            {/* Vendor and non-vendor details are only relevant for non-Level-0 events */}
                            {!formData?.form_data?.level0_confirmed && (
                                <>
                                    {/* Vendor list */}
                                    {formData?.form_data?.vendors?.map((vendor: any, index: number) => (
                                        <div key={index} style={{ marginBottom: 16 }}>
                                            {renderField(`Vendor ${index + 1} Type`,             vendor?.type)}
                                            {renderField(`Vendor ${index + 1} Company Name`,     vendor?.companyName)}
                                            {renderField(`Vendor ${index + 1} Contact Person`,   vendor?.contactPersonName)}
                                            {renderField(`Vendor ${index + 1} Contact Email`,    vendor?.contactEmail)}
                                            {renderField(`Vendor ${index + 1} Contact Phone`,    vendor?.contactPhone)}
                                            {renderField(`Vendor ${index + 1} Worked With Before`, vendor?.workedBefore)}
                                            {renderField(`Vendor ${index + 1} Drexel Student`,   vendor?.isDrexelStudent)}
                                            {renderField(`Vendor ${index + 1} Amount`,           vendor?.amount)}
                                            {renderField(`Vendor ${index + 1} Description`,      vendor?.description)}
                                            {renderField(`Vendor ${index + 1} Org Providing`,    vendor?.org_providing)}
                                        </div>
                                    ))}

                                    {renderField("Vendor Letter Notice Acknowledged", formData?.form_data?.vendors_notice_acknowledged ? "Yes" : "No")}

                                    {/* Non-vendor services */}
                                    {renderField(
                                        "Non-Vendor Services Selected",
                                        Object.entries(formData?.form_data?.non_vendor_services || {})
                                            .filter(([_, value]) => value === true)
                                            .map(([key]) => nonVendorServiceLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
                                            .join(", ")
                                    )}
                                    {renderField("Non-Vendor Services Notes",        formData?.form_data?.non_vendor_services_notes)}
                                    {renderField("Non-Vendor Charges Acknowledged",  formData?.form_data?.non_vendor_services_acknowledged ? "Yes" : "No")}
                                </>
                            )}

                            {renderField("Funding Source",  formData?.form_data?.budget?.source)}
                            {renderField("Account Number",  formData?.form_data?.budget?.account_number)}
                        </Card>

                    </div>{/* end section cards */}

                    <CommentInput />
                </section>{/* end main content column */}
            </section>{/* end page body */}

            <ScrollToTop />
        </div>
    );
}