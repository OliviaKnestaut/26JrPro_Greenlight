import React, { useState, useEffect } from "react";
import { Form, Button, Collapse, Typography, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams, useBlocker } from "react-router";
import { useAuth } from "~/auth/AuthProvider";
import { useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation, useGetOnCampusQuery, useGetEventByIdQuery } from "~/lib/graphql/generated";
import { calculateEventLevel } from "~/vendor/calendar/components/utils";
import styles from "./eventform.module.css";
import EventDetailsSection from "../event-form/sections/EventDetailsSection";
import DateLocationSection from "../event-form/sections/DateLocationSection";
import EventElementsSection from "../event-form/sections/EventElementsSection";
import BudgetPurchaseSection from "../event-form/sections/BudgetPurchasesSection";
import DiscardModal from "../../molecules/event-flow/discard-modal";
import ProgressTimeline from "../../molecules/event-flow/progress-timeline";
import NestFoodSection from "./sections/nestedSections/elementNest/nestFood";
import OnCampusSection from "./sections/nestedSections/locationNest/nestOn";
import OffCampusSection from "./sections/nestedSections/locationNest/nestOff";
import AlcoholSection from "./sections/nestedSections/elementNest/nestAlcohol";
import MinorsSection from "./sections/nestedSections/elementNest/nestMinors";
import MoviesSection from "./sections/nestedSections/elementNest/nestMovies";
import RafflesSection from "./sections/nestedSections/elementNest/nestRaffles";
import FireSafetySection from "./sections/nestedSections/elementNest/nestFire";
import SORCGamesSection from "./sections/nestedSections/elementNest/nestGames";

const { Title, Link } = Typography;
const { Panel } = Collapse;

const formBranching = [
    { when: "location_type", is: "On-Campus", key: "onCampus", parent: "dateLocation", header: "On-Campus Details", component: OnCampusSection, indent: 32 },
    { when: "location_type", is: "Off-Campus", key: "offCampus", parent: "dateLocation", header: "Off-Campus Details", component: OffCampusSection, indent: 32 },
    { when: "form_data.elements.food", is: true, key: "food", parent: "eventElements", header: "Food Details", component: NestFoodSection, indent: 32 },
    { when: "form_data.elements.alcohol", is: true, key: "alcohol", parent: "eventElements", header: "Alcohol Details", component: AlcoholSection, indent: 32 },
    { when: "form_data.elements.minors", is: true, key: "minors", parent: "eventElements", header: "Minors Details", component: MinorsSection, indent: 32 },
    { when: "form_data.elements.movies", is: true, key: "movies", parent: "eventElements", header: "Movies/Media Details", component: MoviesSection, indent: 32 },
    { when: "form_data.elements.raffles", is: true, key: "raffles", parent: "eventElements", header: "Raffles/Prizes Details", component: RafflesSection, indent: 32 },
    { when: "form_data.elements.fire", is: true, key: "fire", parent: "eventElements", header: "Fire Safety Details", component: FireSafetySection, indent: 32 },
    { when: "form_data.elements.sorc_games", is: true, key: "sorc_games", parent: "eventElements", header: "SORC Games Details", component: SORCGamesSection, indent: 32 },
];

const formNesting = (parentKey: string, isSelected: Record<string, any>, control: any, setValue: any) => {
    return formBranching.filter((panel) => panel.parent === parentKey).map((panel) => {
        const fieldPath = panel.when.split('.');
        let currentValue: any = isSelected;
        for (const key of fieldPath) { currentValue = currentValue?.[key]; }
        const displayPanel = Array.isArray(currentValue) ? currentValue.includes(panel.is) : currentValue === panel.is;
        if (!displayPanel) return null;
        const PanelComponent = panel.component;
        return (
            <Panel header={<h4 style={{ margin: 0 }}>{panel.header}</h4>} key={panel.key} style={{ marginLeft: panel.indent || 0 }}>
                <PanelComponent control={control} setValue={setValue} />
                {formNesting(panel.key, isSelected, control, setValue)}
            </Panel>
        );
    });
};

export function EventForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(id || null);
    const [createEvent] = useCreateEventMutation();
    const [updateEvent, { loading: isUpdatingDraft }] = useUpdateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const { data: locationsData } = useGetOnCampusQuery({ variables: { limit: 100000, offset: 0 } });
    const { data: existingEventData, loading: loadingEvent } = useGetEventByIdQuery({
        variables: { id: id ?? '' },
        skip: !id,
    });
    const { control, handleSubmit, getValues, reset, watch, setValue } = useForm();
    const isSelected = useWatch({ control });
    const [activeCollapseKey, setActiveCollapseKey] = useState<string[]>(["eventDetails"]);
    const [currentEditingSection, setCurrentEditingSection] = useState<string | undefined>();
    const [allowNavigation, setAllowNavigation] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if (allowNavigation) return false;
        return currentLocation.pathname !== nextLocation.pathname;
    });

    useEffect(() => {
        if (blocker.state === "blocked") {
            setPendingNavigation(blocker.location.pathname);
            setIsDiscardModalOpen(true);
        }
    }, [blocker]);

    useEffect(() => {
        const loadDraft = async () => {
            const editingSection = localStorage.getItem("editingSection");
            if (editingSection) {
                setActiveCollapseKey([editingSection]);
                setCurrentEditingSection(editingSection);
                localStorage.removeItem("editingSection");
            }
            if (id) return;
            const savedFormData = localStorage.getItem("eventFormData");
            if (savedFormData) {
                try {
                    const formData = JSON.parse(savedFormData);
                    console.log("📥 Restoring form from localStorage:", formData);
                    Object.keys(formData).forEach((key) => setValue(key, formData[key]));
                } catch (err) {
                    console.error("❌ Error parsing saved form data:", err);
                }
            }
        };
        loadDraft();
    }, [id, setValue]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!allowNavigation) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [allowNavigation]);

    useEffect(() => {
        if (existingEventData?.event && !loadingEvent) {
            const ev = existingEventData.event;
            console.log("📥 Loading existing event for editing:", ev);
            let parsedFormData: any = {};
            if (typeof ev.formData === 'string') {
                try { parsedFormData = JSON.parse(ev.formData); } catch (e) { parsedFormData = {}; }
            } else if (typeof ev.formData === 'object' && ev.formData !== null) {
                parsedFormData = ev.formData;
            }
            const formDataToLoad: Record<string, any> = {
                title: ev.title,
                description: ev.description,
                event_date: ev.eventDate,
                attendees: parsedFormData?.attendees || '',
                start_time: ev.startTime,
                end_time: ev.endTime,
                setup_time: ev.setupTime,
                event_img: null,
                location_type: ev.locationType,
                form_data: parsedFormData || {},
                organization_id: parsedFormData?.organization_id || [],
            };
            Object.keys(formDataToLoad).forEach((key) => {
                if (formDataToLoad[key] !== null && formDataToLoad[key] !== undefined) {
                    setValue(key, formDataToLoad[key]);
                }
            });
            setDraftId(ev.id);
            console.log("✅ Form populated with existing event data");
        }
    }, [existingEventData, loadingEvent, setValue]);

    useEffect(() => {
        const subscription = watch((data) => {
            if (!draftId) {
                const dataToSave = { ...data };
                Object.keys(dataToSave).forEach((key) => {
                    if (dataToSave[key] instanceof File) delete dataToSave[key];
                });
                localStorage.setItem("eventFormData", JSON.stringify(dataToSave));
                console.log("💾 Auto-saved to localStorage");
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, draftId]);

    const buildMutationInput = (data: any, eventStatus: string = "REVIEW") => {
        const convert12to24Hour = (time12h: any): string => {
            if (!time12h || typeof time12h !== 'string') return '';
            const trimmed = time12h.trim();
            if (!trimmed) return '';
            const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (!match) {
                console.warn(`⚠️  Could not parse time format: "${time12h}"`);
                return trimmed;
            }
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
            organizationUsername: orgUsername,
            createdBy: user.username,
        };

        if (data.event_img) mutationInput.eventImg = data.event_img;
        if (convertedStartTime) mutationInput.startTime = convertedStartTime;
        if (convertedEndTime) mutationInput.endTime = convertedEndTime;
        if (convertedSetupTime) mutationInput.setupTime = convertedSetupTime;
        if (mappedLocationString) mutationInput.location = mappedLocationString;
        if (mappedLocationId) mutationInput.locationId = mappedLocationId;

        return mutationInput;
    };

    const navigateSafely = (path: string) => {
        setAllowNavigation(true);
        setTimeout(() => navigate(path), 0);
    };

    const handleSaveDraft = async () => {
        if (!user) {
            message.error("You must be logged in to save a draft.");
            return;
        }
        const data = getValues();
        const mutationInput = buildMutationInput(data, "DRAFT");
        console.log("💾 SAVING DRAFT:", mutationInput);

        if (draftId) {
            console.log(`🔄 Updating draft ${draftId}`);
            const { data: result } = await updateEvent({ variables: { id: draftId, input: mutationInput } });
            if (result?.updateEvent?.id) {
                console.log("✅ Draft updated successfully");
                message.success("Draft updated!");
                setIsDraftModalOpen(true);
                setTimeout(() => setIsDraftModalOpen(false), 3000);
            }
        } else {
            console.log("✨ Creating new draft");
            const { data: result } = await createEvent({ variables: { input: mutationInput } });
            if (result?.createEvent?.id) {
                console.log("✅ Draft created successfully:", result.createEvent.id);
                setDraftId(result.createEvent.id);
                message.success("Draft saved!");
                setIsDraftModalOpen(true);
                setTimeout(() => setIsDraftModalOpen(false), 3000);
            }
        }
    };

    const handleDiscard = async () => {
        if (draftId) {
            console.log("🗑️ Deleting saved draft from DB:", draftId);
            await deleteEvent({ variables: { id: draftId } });
            console.log("✅ Draft deleted from DB");
        } else {
            console.log("📝 Discarding unsaved localStorage draft");
        }
        reset();
        localStorage.removeItem("eventFormData");
        localStorage.removeItem("eventFormReview");
        setDraftId(null);
        setIsDiscardModalOpen(false);
        message.success("Draft discarded");
        setAllowNavigation(true);

        if (blocker.state === "blocked") {
            blocker.proceed();
        } else if (pendingNavigation) {
            setTimeout(() => {
                navigate(pendingNavigation);
                setPendingNavigation(null);
            }, 0);
        } else {
            setTimeout(() => navigate("/"), 0);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <Title level={5}>
                <Link onClick={() => setIsDiscardModalOpen(true)}><ArrowLeftOutlined /> Back </Link>
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Event Form</h2>
                <p>Provide your event information for review and approval.</p>
            </div>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
                <ProgressTimeline getValues={getValues} currentEditingSection={currentEditingSection} />
            </div>
            <div className={styles.collapseWrapper}>
                <Form layout="vertical">
                    <Collapse 
                        activeKey={activeCollapseKey}
                        onChange={(keys) => {
                            const keyArray = Array.isArray(keys) ? keys : [keys];
                            setActiveCollapseKey(keyArray);
                            if (keyArray.length > 0) setCurrentEditingSection(keyArray[0]);
                        }}
                        expandIconPosition="end"
                        accordion
                    >
                        <Panel header={<h4 style={{ margin: 0 }}>Event Details</h4>} key="eventDetails">
                            <EventDetailsSection control={control} watch={watch} />
                        </Panel>
                        <Panel header={<h4 style={{ margin: 0 }}>Date & Location</h4>} key="dateLocation">
                            <DateLocationSection control={control} />
                        </Panel>
                        {formNesting("dateLocation", isSelected, control, setValue)}
                        <Panel header={<h4 style={{ margin: 0 }}>Event Elements</h4>} key="eventElements">
                            <EventElementsSection control={control} />
                        </Panel>
                        {formNesting("eventElements", isSelected, control, setValue)}
                        <Panel header={<h4 style={{ margin: 0 }}>Budget & Purchases</h4>} key="budgetPurchase">
                            <BudgetPurchaseSection control={control} />
                        </Panel>
                    </Collapse>
                    <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <Button type="primary" onClick={() => {
                                const data = getValues();
                                localStorage.setItem("eventFormReview", JSON.stringify(data));
                                setCurrentEditingSection(undefined);
                                navigateSafely(`/event-review${draftId ? `/${draftId}` : ''}`);
                            }} block>
                                Review Form
                            </Button>
                            <Button type="default" onClick={handleSaveDraft} block>
                                Save as Draft
                            </Button>
                        </div>
                        <Button type="default" danger onClick={() => setIsDiscardModalOpen(true)}>
                            Discard
                        </Button>
                    </div>
                </Form>
            </div>
            <DiscardModal 
                open={isDiscardModalOpen} 
                onDiscardClick={handleDiscard} 
                onCancelClick={() => {
                    setIsDiscardModalOpen(false);
                    setPendingNavigation(null);
                    if (blocker.state === "blocked") blocker.reset();
                }} 
            />
        </div>
    );
}

export default EventForm;
