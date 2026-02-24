import React, { useRef, useState, useEffect } from "react";
import { Typography, Statistic, Card, Tag, Avatar, Tooltip, Button } from "antd";
const { Title, Paragraph, Link, Text } = Typography;
import { ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined, PushpinOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetEventByIdQuery, useGetUsersQuery } from '~/lib/graphql/generated';
import NavMini from "../../molecules/nav-mini";
import OptimizedImage from '../../atoms/OptimizedImage';
import CommentInput from '../../molecules/comment-input';
import ScrollToTop from '../../atoms/ScrollToTop';
import { formatTime } from '~/lib/formatters';

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
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };
    
    const calculateEstimatedCost = (formData: any): string => {
        let total = 0;
        let hasCosts = false;
        
        // Add vendor costs
        if (formData?.vendors && Array.isArray(formData.vendors)) {
            formData.vendors.forEach((vendor: any) => {
                if (vendor.amount) {
                    const cost = parseFloat(vendor.amount);
                    if (!isNaN(cost)) {
                        total += cost;
                        hasCosts = true;
                    }
                }
            });
        }
        
        // Add food cost
        if (formData?.food?.estimated_cost) {
            const cost = parseFloat(formData.food.estimated_cost);
            if (!isNaN(cost)) {
                total += cost;
                hasCosts = true;
            }
        }
        
        // Add raffle prize value
        if (formData?.raffles?.total_value) {
            const cost = parseFloat(formData.raffles.total_value);
            if (!isNaN(cost)) {
                total += cost;
                hasCosts = true;
            }
        }
        
        // Add budget total purchase (if not already counted in vendors)
        if (formData?.budget && typeof formData.budget === 'number') {
            total += formData.budget;
            hasCosts = true;
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
                    event: {
                        name: ev.title || '',
                        description: ev.description || '',
                        attendees: parsedFormData?.attendees || '',
                        dateRange: ev.eventDate ? [ev.eventDate, ev.eventDate] : [],
                    },
                    location: {
                        name: ev.location || '',
                        type: formatLocationType(ev.locationType || ''),
                        roomTitle: parsedFormData?.location?.room_title || '',
                        buildingCode: parsedFormData?.location?.selected || '',
                    },
                    vendor: parsedFormData?.budget?.vendor_needed === true ? 'yes' : 'no',
                    account: parsedFormData?.budget?.account_code || '',
                    budget: parsedFormData?.budget?.total_purchase || parsedFormData?.estimatedCost || '',
                    travel: {
                        type: parsedFormData?.travel?.type || 'N/A',
                        country: parsedFormData?.travel?.country || '',
                        domestic_location: parsedFormData?.travel?.domestic_location || '',
                    },
                    eventElements: parsedFormData?.elements ? Object.keys(parsedFormData.elements).filter(key => parsedFormData.elements[key] === true) : [],
                    eventLevel: ev.eventLevel !== undefined && ev.eventLevel !== null ? `Level ${ev.eventLevel}` : 'N/A',
                    createdBy: ev.createdBy || 'N/A',
                    createdByUser: parsedFormData?.createdByUser || null,
                    eventStatus: ev.eventStatus || 'N/A',
                    startTime: ev.startTime || 'N/A',
                    endTime: ev.endTime || 'N/A',
                    setupTime: ev.setupTime || 'N/A',
                    organization_ids: parsedFormData?.organization_id || [],
                    // Element nested data
                    food: parsedFormData?.form_data?.food || null,
                    alcohol: parsedFormData?.form_data?.alcohol || null,
                    minors: parsedFormData?.form_data?.minors || null,
                    movies: parsedFormData?.form_data?.movies || null,
                    raffles: parsedFormData?.form_data?.raffles || null,
                    fire: parsedFormData?.form_data?.fire || null,
                    sorc_games: parsedFormData?.form_data?.sorc_games || null,
                    // Vendors data
                    vendors: parsedFormData?.form_data?.vendors || [],
                    // Location nests
                    onCampus: parsedFormData?.form_data?.location || null,
                    offCampus: {
                        off_campus_address: parsedFormData?.form_data?.location?.off_campus_address || '',
                        google_maps_link: parsedFormData?.form_data?.location?.google_maps_link || '',
                        travel_type: parsedFormData?.form_data?.travel?.type || '',
                        transportation: parsedFormData?.form_data?.travel?.transportation || '',
                        trip_leader: parsedFormData?.form_data?.travel?.trip_leader || '',
                        trip_leader_emergency_contact: parsedFormData?.form_data?.travel?.trip_leader_emergency_contact || null,
                        lodging: parsedFormData?.form_data?.travel?.lodging || '',
                        eap_file: parsedFormData?.form_data?.travel?.eap_file || '',
                    },
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
    
    // Create refs for each section
    const eventDetailsRef = useRef<HTMLDivElement>(null);
    const dateLocationRef = useRef<HTMLDivElement>(null);
    const eventElementsRef = useRef<HTMLDivElement>(null);
    const budgetPurchaseRef = useRef<HTMLDivElement>(null);
    return (
        <div className="container m-8 w-auto">
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined/> Back </Link>
                </Title>
            </div>
            {
                (() => {
                    const rawImg = data?.event?.eventImg;
                    const uploadsBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
                        ? 'https://digmstudents.westphal.drexel.edu/~ojk25/'
                        : `${window.location.origin}/~ojk25/`;
                    const imgSrc = rawImg
                        ? (/^https?:\/\//i.test(rawImg) || rawImg.startsWith('/')
                            ? rawImg
                            : `${uploadsBase}uploads/event_img/${rawImg}`.replace(/\\/g, '/'))
                        : undefined;
                    return <OptimizedImage placeholder="grey" src={imgSrc} alt="Event header" style={{ width: '100%', height: 365, objectFit: 'cover', borderRadius: '.25rem' }} />;
                })()
            }

            <section style={{ display: "flex", flexDirection: "row", marginTop: "2rem", gap: "2rem" }}>
                <section>
                    <NavMini links={[
                        { title: 'Event Details', ref: eventDetailsRef },
                        { title: 'Date & Location', ref: dateLocationRef },
                        { title: 'Event Elements', ref: eventElementsRef },
                        { title: 'Budget & Purchase', ref: budgetPurchaseRef },
                    ]} />
                </section>

                <section style={{ display: "flex", flexDirection: "column", flexGrow: 1}}>
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

                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem"}}>
                        <Paragraph style={{ margin: 0}}>Created By:</Paragraph>
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
                                        style={{ backgroundColor: 'var(--gray-1)', cursor: 'pointer', height: '1.75rem', width: '1.75rem'}}
                                    >
                                        {!avatarSrc && initials}
                                    </Avatar>
                                </Tooltip>
                            );
                        })()}
                    </div>

                    <div className='flex flex-wrap' style={{ gap: "0.25rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
                        {formData?.event?.dateRange?.[0] ? <Tag className="eventDetailTag" icon={<CalendarOutlined />}>{formatDate(formData.event.dateRange[0])}</Tag> : null}
                        {formData?.startTime ? <Tag className="eventDetailTag" icon={<ClockCircleOutlined />}>{formatTime(formData.startTime)}</Tag> : null}
                        {formData?.location.name? <Tag className="eventDetailTag" icon={<PushpinOutlined />}>{formData.location.name}</Tag> : null}
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", gap: "1.5rem",}}>
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem"}}>
                        {/* EVENT DETAILS SECTION */}
                        <Card id="section-0" ref={eventDetailsRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", marginTop: "1rem", scrollMarginTop: "2rem" }}>
                            <Title level={3}>Event Details</Title>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={5}>Event Name</Title>
                                <Paragraph>{formData?.event?.name || "N/A"}</Paragraph>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={5}>Description</Title>
                                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData?.event?.description || "N/A"}</Paragraph>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={5}>Expected Attendees</Title>
                                <Paragraph>{formData?.event?.attendees || "N/A"}</Paragraph>
                            </div>
                            {formData?.organization_ids && formData.organization_ids.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <Title level={5}>Co-hosting Organizations</Title>
                                    <Paragraph>{Array.isArray(formData.organization_ids) ? formData.organization_ids.join(", ") : "N/A"}</Paragraph>
                                </div>
                            )}
                        </Card>

                        {/* DATE & LOCATION SECTION */}
                        <Card id="section-1" ref={dateLocationRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            <Title level={3}>Date & Location</Title>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={5}>Location Type</Title>
                                <Paragraph>{formData?.location?.type || "N/A"}</Paragraph>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={5}>Event Date</Title>
                                <Paragraph>{formData?.event?.dateRange?.[0] || "N/A"}</Paragraph>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={5}>Start Time</Title>
                                <Paragraph>{formData?.startTime || "N/A"}</Paragraph>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={5}>End Time</Title>
                                <Paragraph>{formData?.endTime || "N/A"}</Paragraph>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={5}>Setup Time</Title>
                                <Paragraph>{formData?.setupTime || "N/A"}</Paragraph>
                            </div>

                            {/* ON-CAMPUS SECTION */}
                            {formData?.location?.type === 'On Campus' && formData?.onCampus && (
                                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                                    <Title level={4}>On-Campus Details</Title>
                                    {formData.onCampus.selected && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Campus Space:</Text>
                                            <Paragraph>{formData.onCampus.selected}</Paragraph>
                                        </div>
                                    )}
                                    {formData.onCampus.room_type && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Room Type:</Text>
                                            <Paragraph>{formData.onCampus.room_type}</Paragraph>
                                        </div>
                                    )}
                                    {formData.onCampus.room_title && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Room Title/Number:</Text>
                                            <Paragraph>{formData.onCampus.room_title}</Paragraph>
                                        </div>
                                    )}
                                    {formData.onCampus.special_space_alignment && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Special Space Alignment:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.onCampus.special_space_alignment}</Paragraph>
                                        </div>
                                    )}
                                    {formData.onCampus.rain_location && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Rain Plan:</Text>
                                            <Paragraph>{formData.onCampus.rain_location}</Paragraph>
                                        </div>
                                    )}
                                    {formData.onCampus.room_setup && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Room Setup:</Text>
                                            <Paragraph>{formData.onCampus.room_setup}</Paragraph>
                                        </div>
                                    )}
                                    {formData.onCampus.furniture && Array.isArray(formData.onCampus.furniture) && formData.onCampus.furniture.length > 0 && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Furniture:</Text>
                                            {formData.onCampus.furniture.map((f: any, idx: number) => (
                                                <Paragraph key={idx}>{f.type} x{f.quantity}</Paragraph>
                                            ))}
                                        </div>
                                    )}
                                    {formData.onCampus.av && Array.isArray(formData.onCampus.av) && formData.onCampus.av.length > 0 && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>A/V Equipment:</Text>
                                            <Paragraph>{formData.onCampus.av.join(", ")}</Paragraph>
                                        </div>
                                    )}
                                    {formData.onCampus.utilities?.power_required && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Power Required:</Text>
                                            <Paragraph>Yes {formData.onCampus.utilities.power_details ? `(${formData.onCampus.utilities.power_details})` : ""}</Paragraph>
                                        </div>
                                    )}
                                    {formData.onCampus.utilities?.water_required && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Water Access Required:</Text>
                                            <Paragraph>Yes</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* OFF-CAMPUS SECTION */}
                            {formData?.location?.type === 'Off Campus' && formData?.offCampus && (
                                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                                    <Title level={4}>Off-Campus Details</Title>
                                    {formData.offCampus.off_campus_address && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Address:</Text>
                                            <Paragraph>{formData.offCampus.off_campus_address}</Paragraph>
                                        </div>
                                    )}
                                    {formData.offCampus.google_maps_link && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Google Maps Link:</Text>
                                            <Paragraph>
                                                <Link href={formData.offCampus.google_maps_link} target="_blank">
                                                    View on Maps
                                                </Link>
                                            </Paragraph>
                                        </div>
                                    )}
                                    {formData.offCampus.travel_type && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Travel Type:</Text>
                                            <Paragraph>{formData.offCampus.travel_type}</Paragraph>
                                        </div>
                                    )}
                                    {formData.offCampus.transportation && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Transportation:</Text>
                                            <Paragraph>{formData.offCampus.transportation}</Paragraph>
                                        </div>
                                    )}
                                    {formData.offCampus.trip_leader && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Trip Leader:</Text>
                                            <Paragraph>{formData.offCampus.trip_leader}</Paragraph>
                                        </div>
                                    )}
                                    {formData.offCampus.trip_leader_emergency_contact && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Emergency Contact:</Text>
                                            <Paragraph>
                                                {formData.offCampus.trip_leader_emergency_contact.name}
                                                {formData.offCampus.trip_leader_emergency_contact.phone && ` - ${formData.offCampus.trip_leader_emergency_contact.phone}`}
                                            </Paragraph>
                                        </div>
                                    )}
                                    {formData.offCampus.lodging && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Lodging:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.offCampus.lodging}</Paragraph>
                                        </div>
                                    )}
                                    {formData.offCampus.eap_file && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Emergency Action Plan:</Text>
                                            <Paragraph>{typeof formData.offCampus.eap_file === 'string' ? formData.offCampus.eap_file : formData.offCampus.eap_file?.name || "Uploaded"}</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* EVENT ELEMENTS SECTION */}
                        <Card id="section-2" ref={eventElementsRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            <Title level={3}>Event Elements</Title>
                            
                            {/* Food Element */}
                            {formData?.food && (
                                <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                    <Title level={4}>🍽️ Food</Title>
                                    <div style={{ marginBottom: 12 }}>
                                        <Text strong>Type:</Text>
                                        <Paragraph>{formData.food.type || "N/A"}</Paragraph>
                                    </div>
                                    {formData.food.estimated_cost && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Estimated Cost:</Text>
                                            <Paragraph>${formData.food.estimated_cost}</Paragraph>
                                        </div>
                                    )}
                                    {formData.food.vendor && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Vendor/Restaurant:</Text>
                                            <Paragraph>{formData.food.vendor}</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Alcohol Element */}
                            {formData?.alcohol && (
                                <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                    <Title level={4}>🍷 Alcohol</Title>
                                    {formData.alcohol.vendor && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Vendor:</Text>
                                            <Paragraph>{formData.alcohol.vendor}</Paragraph>
                                        </div>
                                    )}
                                    {formData.alcohol.event_type && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Event Type:</Text>
                                            <Paragraph>{formData.alcohol.event_type}</Paragraph>
                                        </div>
                                    )}
                                    {formData.alcohol.faculty_staff && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Faculty/Staff Present:</Text>
                                            <div style={{ marginLeft: 16 }}>
                                                <Paragraph>Name: {formData.alcohol.faculty_staff.name || "N/A"}</Paragraph>
                                                <Paragraph>Title: {formData.alcohol.faculty_staff.title || "N/A"}</Paragraph>
                                                <Paragraph>Email: {formData.alcohol.faculty_staff.email || "N/A"}</Paragraph>
                                                <Paragraph>Phone: {formData.alcohol.faculty_staff.phone || "N/A"}</Paragraph>
                                            </div>
                                        </div>
                                    )}
                                    {formData.alcohol.guests_under_21 && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Guests Under 21:</Text>
                                            <Paragraph>{formData.alcohol.guests_under_21}</Paragraph>
                                        </div>
                                    )}
                                    {formData.alcohol.id_procedure && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>ID Checking Procedure:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.alcohol.id_procedure}</Paragraph>
                                        </div>
                                    )}
                                    {formData.alcohol.food_description && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Food Description:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.alcohol.food_description}</Paragraph>
                                        </div>
                                    )}
                                    {formData.alcohol.signature_name && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Signed By:</Text>
                                            <Paragraph>{formData.alcohol.signature_name}</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Minors Element */}
                            {formData?.minors && (
                                <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                    <Title level={4}>👶 Minors Present</Title>
                                    {formData.minors.age_range && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Age Range:</Text>
                                            <Paragraph>{formData.minors.age_range}</Paragraph>
                                        </div>
                                    )}
                                    {formData.minors.supervision && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Supervision Details:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.minors.supervision}</Paragraph>
                                        </div>
                                    )}
                                    {formData.minors.liability && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Liability Insurance:</Text>
                                            <Paragraph>{formData.minors.liability}</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Movies Element */}
                            {formData?.movies && (
                                <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                    <Title level={4}>🎬 Movies/Media</Title>
                                    {formData.movies.title && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Movie/Media Title:</Text>
                                            <Paragraph>{formData.movies.title}</Paragraph>
                                        </div>
                                    )}
                                    {formData.movies.licensing && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Licensing/Rights:</Text>
                                            <Paragraph>{formData.movies.licensing}</Paragraph>
                                        </div>
                                    )}
                                    {formData.movies.estimated_attendees && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Expected Attendees:</Text>
                                            <Paragraph>{formData.movies.estimated_attendees}</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Raffles Element */}
                            {formData?.raffles && (
                                <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                    <Title level={4}>🎁 Raffles/Prizes</Title>
                                    {formData.raffles.prize_description && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Prize Description:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.raffles.prize_description}</Paragraph>
                                        </div>
                                    )}
                                    {formData.raffles.total_value && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Total Prize Value:</Text>
                                            <Paragraph>${formData.raffles.total_value}</Paragraph>
                                        </div>
                                    )}
                                    {formData.raffles.how_distributed && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>How Distributed:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.raffles.how_distributed}</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fire Safety Element */}
                            {formData?.fire && (
                                <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                    <Title level={4}>🔥 Fire Safety</Title>
                                    {formData.fire.type && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Type:</Text>
                                            <Paragraph>{formData.fire.type}</Paragraph>
                                        </div>
                                    )}
                                    {formData.fire.location && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Location:</Text>
                                            <Paragraph>{formData.fire.location}</Paragraph>
                                        </div>
                                    )}
                                    {formData.fire.safety_measures && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Safety Measures:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.fire.safety_measures}</Paragraph>
                                        </div>
                                    )}
                                    {formData.fire.permit_details && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Permit Details:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.fire.permit_details}</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SORC Games Element */}
                            {formData?.sorc_games && (
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4}>🎮 SORC Games</Title>
                                    {formData.sorc_games.type && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Game Type:</Text>
                                            <Paragraph>{formData.sorc_games.type}</Paragraph>
                                        </div>
                                    )}
                                    {formData.sorc_games.details && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Details:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.sorc_games.details}</Paragraph>
                                        </div>
                                    )}
                                    {formData.sorc_games.equipment && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong>Equipment:</Text>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{formData.sorc_games.equipment}</Paragraph>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!formData?.food && !formData?.alcohol && !formData?.minors && !formData?.movies && !formData?.raffles && !formData?.fire && !formData?.sorc_games && (
                                <Paragraph>No special elements selected</Paragraph>
                            )}
                        </Card>

                        {/* BUDGET & PURCHASE SECTION */}
                        <Card id="section-3" ref={budgetPurchaseRef} style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px", scrollMarginTop: "2rem" }}>
                            <Title level={3}>Budget & Purchase</Title>
                            
                            {/* Budget Overview */}
                            <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                <Title level={4}>Budget Overview</Title>
                                <div style={{ marginBottom: 12 }}>
                                    <Text strong>Total Estimated Cost:</Text>
                                    <Paragraph>
                                        {(() => {
                                            const cost = calculateEstimatedCost(formData);
                                            return cost === 'N/A' ? 'N/A' : `$${cost}`;
                                        })()}
                                    </Paragraph>
                                </div>
                                {formData?.account && (
                                    <div style={{ marginBottom: 12 }}>
                                        <Text strong>Account Code:</Text>
                                        <Paragraph>{formData.account}</Paragraph>
                                    </div>
                                )}
                                {formData?.vendor && (
                                    <div style={{ marginBottom: 12 }}>
                                        <Text strong>Vendor Needed:</Text>
                                        <Paragraph>{formData.vendor === 'yes' ? 'Yes' : 'No'}</Paragraph>
                                    </div>
                                )}
                            </div>

                            {/* Vendors List */}
                            {formData?.vendors && Array.isArray(formData.vendors) && formData.vendors.length > 0 && (
                                <div>
                                    <Title level={4}>Vendors/Contracts</Title>
                                    {formData.vendors.map((vendor: any, index: number) => (
                                        <div key={index} style={{ marginBottom: 16, paddingLeft: 16, borderLeft: '3px solid #1890ff' }}>
                                            <Title level={5}>Vendor {index + 1}</Title>
                                            {vendor.type && <Paragraph><Text strong>Type:</Text> {vendor.type}</Paragraph>}
                                            {vendor.companyName && <Paragraph><Text strong>Company:</Text> {vendor.companyName}</Paragraph>}
                                            {vendor.contactPersonName && <Paragraph><Text strong>Contact Person:</Text> {vendor.contactPersonName}</Paragraph>}
                                            {vendor.contactEmail && <Paragraph><Text strong>Email:</Text> {vendor.contactEmail}</Paragraph>}
                                            {vendor.phone && <Paragraph><Text strong>Phone:</Text> {vendor.phone}</Paragraph>}
                                            {vendor.amount && <Paragraph><Text strong>Estimated Cost:</Text> ${vendor.amount}</Paragraph>}
                                            {vendor.contractType && <Paragraph><Text strong>Contract Type:</Text> {vendor.contractType}</Paragraph>}
                                        </div>
                                    ))}
                                </div>
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