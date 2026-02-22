import React, { useState, useEffect } from "react";
import { Typography, Card, Button, message, Alert } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useGetEventByIdQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation, useGetOnCampusQuery } from '~/lib/graphql/generated';
import ProgressTimeline from "../../molecules/event-flow/progress-timeline";
import SuccessModal from "../../molecules/event-flow/success-modal";
import DiscardModal from "../../molecules/event-flow/discard-modal";
import { useAuth } from "~/auth/AuthProvider";
import { calculateEventLevel } from "~/vendor/calendar/components/utils";

const { Title, Paragraph, Link, Text } = Typography;

export function EventReview() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [createdEventId, setCreatedEventId] = useState<string | null>(null);
    const [draftAlertMessage, setDraftAlertMessage] = useState<'created' | 'updated' | ''>('');
    const [createEvent, { loading: isSubmitting }] = useCreateEventMutation();
    const [updateEvent] = useUpdateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const { data: locationsData } = useGetOnCampusQuery({ variables: { limit: 5000, offset: 0 } });

    useEffect(() => {
        try {
            const reviewData = localStorage.getItem("eventFormReview");
            if (reviewData) setFormData(JSON.parse(reviewData));
        } catch (err) {
            console.error("❌ Error loading review data from localStorage:", err);
        }
    }, []);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const getValues = () => formData || {};

    const handleEditSection = (sectionKey: string) => {
        try {
            if (formData) localStorage.setItem("eventFormData", JSON.stringify(formData));
            localStorage.setItem("editingSection", sectionKey);
            navigate(`/event-form${id ? `/${id}` : ''}`);
        } catch (err) {
            console.error("❌ Error saving edit section to localStorage:", err);
            message.error("Failed to save section state");
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

        if (data.event_img) mutationInput.eventImg = data.event_img;
        if (convertedStartTime) mutationInput.startTime = convertedStartTime;
        if (convertedEndTime) mutationInput.endTime = convertedEndTime;
        if (convertedSetupTime) mutationInput.setupTime = convertedSetupTime;
        if (mappedLocationString) mutationInput.location = mappedLocationString;
        if (mappedLocationId) mutationInput.locationId = mappedLocationId;

        return mutationInput;
    };

    const handleSaveDraft = async () => {
        if (!user || !formData) return;
        const mutationInput = buildMutationInput(formData, "DRAFT", !!id);

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

    const handleDiscard = async () => {
        if (id) await deleteEvent({ variables: { id } });
        
        try {
            localStorage.removeItem("eventFormReview");
            localStorage.removeItem("eventFormData");
        } catch (err) {
            console.error("❌ Error clearing localStorage:", err);
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
        const mutationInput = buildMutationInput(formData, "REVIEW", !!id);

        if (id) {
            const { data: result } = await updateEvent({ variables: { id, input: mutationInput } });
            if (result?.updateEvent?.id) {
                try {
                    localStorage.removeItem("eventFormReview");
                    localStorage.removeItem("eventFormData");
                } catch (err) {
                    console.error("❌ Error clearing localStorage:", err);
                }
                setCreatedEventId(result.updateEvent.id);
                setIsModalOpen(true);
            }
        } else {
            const { data: result } = await createEvent({ variables: { input: mutationInput } });
            if (result?.createEvent?.id) {
                try {
                    localStorage.removeItem("eventFormReview");
                    localStorage.removeItem("eventFormData");
                } catch (err) {
                    console.error("❌ Error clearing localStorage:", err);
                }
                setCreatedEventId(result.createEvent.id);
                setIsModalOpen(true);
            }
        }
    };

    if (!formData) return <div className="container mx-auto p-8">Loading...</div>;

    return (
        <div className="container m-8 w-auto">
            <Title level={5}>
                <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back</Link>
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem"}}>
                <h2 style={{ margin: 0 }}>Review Your Event</h2>
                <p>Please review all details before submitting your event for approval.</p>
            </div>
            <div style={{ marginBottom: 24, marginTop: 24, display: "flex", justifyContent: "center" }}>
                <ProgressTimeline getValues={getValues} currentEditingSection="review" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem"}}>
                <Card style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3}>Event Details</Title>
                        <Button type="text" icon={<EditOutlined style={{ color: '#333', fontSize: '18px' }} />} onClick={() => handleEditSection('eventDetails')} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Event Name:</Text>
                        <Paragraph>{formData.title || 'N/A'}</Paragraph>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Description:</Text>
                        <Paragraph>{formData.description || 'N/A'}</Paragraph>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Expected Attendees:</Text>
                        <Paragraph>{formData.attendees || 'N/A'}</Paragraph>
                    </div>
                </Card>

                <Card style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3}>Date & Location</Title>
                        <Button type="text" icon={<EditOutlined style={{ color: '#333', fontSize: '18px' }} />} onClick={() => handleEditSection('dateLocation')} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Date:</Text>
                        <Paragraph>{formatDate(formData.event_date) || 'N/A'}</Paragraph>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Start Time:</Text>
                        <Paragraph>{formData.start_time || 'N/A'}</Paragraph>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>End Time:</Text>
                        <Paragraph>{formData.end_time || 'N/A'}</Paragraph>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Setup Time (minutes):</Text>
                        <Paragraph>{formData.setup_time || 'N/A'}</Paragraph>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Location Type:</Text>
                        <Paragraph>{formData.location_type || 'N/A'}</Paragraph>
                    </div>
                    {formData.location_type === 'On-Campus' && formData.form_data?.location && (
                        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                            <Title level={4}>On-Campus Details</Title>
                            {formData.form_data.location.selected && (
                                <div style={{ marginBottom: 12 }}>
                                    <Text strong>Building:</Text>
                                    <Paragraph>{formData.form_data.location.selected}</Paragraph>
                                </div>
                            )}
                            {formData.form_data.location.room_title && (
                                <div style={{ marginBottom: 12 }}>
                                    <Text strong>Room:</Text>
                                    <Paragraph>{formData.form_data.location.room_title}</Paragraph>
                                </div>
                            )}
                        </div>
                    )}
                    {formData.location_type === 'Off-Campus' && formData.form_data?.offCampus && (
                        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                            <Title level={4}>Off-Campus Details</Title>
                            {formData.form_data.offCampus.address && (
                                <div style={{ marginBottom: 12 }}>
                                    <Text strong>Address:</Text>
                                    <Paragraph>{formData.form_data.offCampus.address}</Paragraph>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                <Card style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3}>Event Elements</Title>
                        <Button type="text" icon={<EditOutlined style={{ color: '#333', fontSize: '18px' }} />} onClick={() => handleEditSection('eventElements')} />
                    </div>
                    {formData.form_data?.elements && Object.keys(formData.form_data.elements).filter(key => formData.form_data.elements[key]).length > 0 ? (
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Selected Elements:</Text>
                            <Paragraph>
                                {Object.keys(formData.form_data.elements)
                                    .filter(key => formData.form_data.elements[key])
                                    .map(key => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
                                    .join(', ')}
                            </Paragraph>
                        </div>
                    ) : (
                        <Paragraph>No special elements selected</Paragraph>
                    )}
                </Card>

                <Card style={{ border: "solid", borderColor: "var(--color-border-default)", borderWidth: "1px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3}>Budget & Purchase</Title>
                        <Button type="text" icon={<EditOutlined style={{ color: '#333', fontSize: '18px' }} />} onClick={() => handleEditSection('budgetPurchase')} />
                    </div>
                    {formData.form_data?.vendors && Array.isArray(formData.form_data.vendors) && formData.form_data.vendors.length > 0 ? (
                        <div>
                            <Title level={4}>Vendors/Contracts</Title>
                            {formData.form_data.vendors.map((vendor: any, index: number) => (
                                <div key={index} style={{ marginBottom: 16, paddingLeft: 16, borderLeft: '3px solid #1890ff' }}>
                                    <Title level={5}>Vendor {index + 1}</Title>
                                    {vendor.type && <Paragraph><Text strong>Type:</Text> {vendor.type}</Paragraph>}
                                    {vendor.companyName && <Paragraph><Text strong>Company:</Text> {vendor.companyName}</Paragraph>}
                                    {vendor.contactPersonName && <Paragraph><Text strong>Contact Person:</Text> {vendor.contactPersonName}</Paragraph>}
                                    {vendor.amount && <Paragraph><Text strong>Amount:</Text> ${vendor.amount}</Paragraph>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Paragraph>No vendors added</Paragraph>
                    )}
                    {formData.form_data?.budget?.source && (
                        <div style={{ marginTop: 16 }}>
                            <Text strong>Funding Source:</Text>
                            <Paragraph>{formData.form_data.budget.source}</Paragraph>
                        </div>
                    )}
                    {formData.form_data?.budget?.account_number && (
                        <div>
                            <Text strong>Account Number:</Text>
                            <Paragraph>{formData.form_data.budget.account_number}</Paragraph>
                        </div>
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
                <Button type="default" danger onClick={() => setIsDiscardModalOpen(true)}>
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
                        navigate(`/event-overview/${createdEventId}`);
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
        </div>
    );
}
