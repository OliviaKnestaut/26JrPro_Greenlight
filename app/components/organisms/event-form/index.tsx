import React, { useState, useEffect, useRef } from "react";
import { Alert, Form, Button, Collapse, Typography, message } from "antd";
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
import ScrollToTop from "../../atoms/ScrollToTop";
import NestFoodSection from "./sections/nestedSections/elementNest/nestFood";
import OnCampusSection from "./sections/nestedSections/locationNest/nestOn";
import OffCampusSection from "./sections/nestedSections/locationNest/nestOff";
import AlcoholSection from "./sections/nestedSections/elementNest/nestAlcohol";
import MinorsSection from "./sections/nestedSections/elementNest/nestMinors";
import MoviesSection from "./sections/nestedSections/elementNest/nestMovies";
import RafflesSection from "./sections/nestedSections/elementNest/nestRaffles";
import FireSafetySection from "./sections/nestedSections/elementNest/nestFire";
import SORCGamesSection from "./sections/nestedSections/elementNest/nestGames";

const { Title, Link, Paragraph } = Typography;
const { Panel } = Collapse;

// Define the branching logic for nested panels based on form values
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

// Recursively render nested panels based on branching logic and current form values
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

// Main EventForm component
export function EventForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [isExplicitDiscard, setIsExplicitDiscard] = useState(false);
    const [draftAlertMessage, setDraftAlertMessage] = useState<'created' | 'updated' | ''>('');
    const [draftId, setDraftId] = useState<string | null>(id || null);
    const [createEvent] = useCreateEventMutation();
    const [updateEvent, { loading: isUpdatingDraft }] = useUpdateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const { data: locationsData } = useGetOnCampusQuery({ variables: { limit: 5000, offset: 0 } });
    const { data: existingEventData, loading: loadingEvent } = useGetEventByIdQuery({
        variables: { id: id ?? '' },
        skip: !id,
    });
    const { control, getValues, reset, watch, setValue, trigger, formState: { errors } } = useForm({ mode: "onChange" });
    const isSelected = useWatch({ control });
    const [activeCollapseKey, setActiveCollapseKey] = useState<string[]>(["eventDetails"]);
    const [currentEditingSection, setCurrentEditingSection] = useState<string | undefined>("eventDetails");
    const allowNavigationRef = useRef(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

    // Block navigation if there are unsaved changes
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if (allowNavigationRef.current) return false;
        return currentLocation.pathname !== nextLocation.pathname;
    });

    // When blocker state changes to "blocked", show the discard confirmation modal
    useEffect(() => {
        if (blocker.state === "blocked") {
            setPendingNavigation(
                `${blocker.location.pathname}${blocker.location.search}${blocker.location.hash}`
            );
            setIsExplicitDiscard(false);
            setIsDiscardModalOpen(true);
        }
    }, [blocker]);

    // On mount, check for existing draft in localStorage and load it. Also handle loading existing event data if editing.
    useEffect(() => {
        const loadDraft = async () => {
            try {
                const editingSection = localStorage.getItem("editingSection");
                if (editingSection) {
                    setActiveCollapseKey([editingSection]);
                    setCurrentEditingSection(editingSection);
                    localStorage.removeItem("editingSection");
                }
            } catch (err) {
                console.error("❌ Error accessing editingSection from localStorage:", err);
            }

            if (id) return;

            try {
                const savedFormData = localStorage.getItem("eventFormData");
                if (savedFormData) {
                    const formData = JSON.parse(savedFormData);
                    console.log("📥 Restoring form from localStorage:", formData);
                    Object.keys(formData).forEach((key) => setValue(key, formData[key]));
                }
            } catch (err) {
                console.error("❌ Error loading saved form data:", err);
            }
        };
        loadDraft();
    }, [id, setValue]);

    // Warn user if they try to close the tab/window with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!allowNavigationRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // When existing event data is loaded for editing, populate the form fields
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

    // Auto-save form data to localStorage on change, but only if not currently editing an existing draft (to avoid conflicts)
    useEffect(() => {
        const subscription = watch((data) => {
            if (!draftId) {
                try {
                    const dataToSave = { ...data };
                    Object.keys(dataToSave).forEach((key) => {
                        if (dataToSave[key] instanceof File) delete dataToSave[key];
                    });
                    localStorage.setItem("eventFormData", JSON.stringify(dataToSave));
                    console.log("💾 Auto-saved to localStorage");
                } catch (err) {
                    console.error("❌ Error auto-saving to localStorage:", err);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, draftId]);

    // Auto-open nested panels when conditions are met
    useEffect(() => {
        const data = isSelected;
        const panelsToOpen: string[] = [];
        const parentPanelsToOpen: string[] = [];

        // Check each formBranching rule to see if its condition is met
        formBranching.forEach((panel) => {
            const fieldPath = panel.when.split('.');
            let currentValue: any = data;
            for (const key of fieldPath) {
                currentValue = currentValue?.[key];
            }
            const shouldDisplay = Array.isArray(currentValue)
                ? currentValue.includes(panel.is)
                : currentValue === panel.is;

            if (shouldDisplay) {
                panelsToOpen.push(panel.key);
                // Also ensure parent panel is open
                if (panel.parent && !parentPanelsToOpen.includes(panel.parent)) {
                    parentPanelsToOpen.push(panel.parent);
                }
            }
        });

        // Add nested panel keys and their parent keys to active keys
        const allPanelsToOpen = [...parentPanelsToOpen, ...panelsToOpen];
        if (allPanelsToOpen.length > 0) {
            setActiveCollapseKey((prevKeys) => {
                const newKeys = [...prevKeys];
                allPanelsToOpen.forEach((key) => {
                    if (!newKeys.includes(key)) {
                        newKeys.push(key);
                    }
                });
                return newKeys;
            });
        }
    }, [isSelected]);

    // Scroll to and open a specific section when currentEditingSection changes (e.g. when user clicks on a step in the ProgressTimeline)
    useEffect(() => {
        if (!currentEditingSection) return;

        // Open the corresponding collapse panel first
        setActiveCollapseKey([currentEditingSection]);

        // Wait for Collapse animation + DOM layout
        setTimeout(() => {
            const mainContent = document.querySelector('main');
            const el = document.getElementById(`panel-${currentEditingSection}`);

            if (!mainContent || !el) return;

            const targetTop = el.offsetTop - 16;

            const duration = 400;
            const start = mainContent.scrollTop;
            const startTime = performance.now();

            const animateScroll = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);

                const scrollTo = start + (targetTop - start) * easeOutCubic;
                mainContent.scrollTop = scrollTo;

                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            };

            requestAnimationFrame(animateScroll);
        }, 50);

    }, [currentEditingSection]);

    // Resize an image File on the client to fit within max dimensions.
    const resizeImageFile = async (file: File, maxWidth = 1300, maxHeight = 780, quality = 0.85): Promise<File> => {
        try {
            if (!file || !file.type.startsWith('image/')) return file;

            // Use createImageBitmap when available for performance
            const bitmap = await createImageBitmap(file);
            let { width, height } = bitmap;

            const ratio = Math.min(1, maxWidth / width, maxHeight / height);
            const targetW = Math.round(width * ratio);
            const targetH = Math.round(height * ratio);

            if (ratio === 1) {
                // No resize needed
                return file;
            }

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            if (!ctx) return file;
            ctx.drawImage(bitmap, 0, 0, targetW, targetH);

            const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const blob: Blob | null = await new Promise((resolve) => {
                canvas.toBlob((b) => resolve(b), mime, quality);
            });
            if (!blob) return file;

            const baseName = file.name.replace(/\.[^.]+$/, '');
            const ext = mime === 'image/png' ? '.png' : '.jpg';
            const resizedFile = new File([blob], `${baseName}-resized${ext}`, { type: blob.type });
            return resizedFile;
        } catch (err) {
            console.warn('resizeImageFile failed, uploading original', err);
            return file;
        }
    };

    // Helper: upload image to server endpoint and return the public url and filename
    const uploadImage = async (file: File, desiredName?: string) => {
        const fd = new FormData();
        fd.append('event_img', file);
        if (desiredName) fd.append('desired_name', desiredName);
        const getUploadUrl = () => {
            if (import.meta.env.DEV) {
                return 'http://localhost:4000/graphql/upload_event_image.php';
            } else {
                return '/~ojk25/jrProjGreenlight/graphql/upload_event_image.php';
            }
        };

        const resp = await fetch(getUploadUrl(), {
            method: 'POST',
            body: fd
        });


        const text = await resp.text();
        // Try to parse JSON response from server, otherwise include raw text
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
            return parsed; // { success, url, filename, path }
        }

        // If we couldn't parse JSON but status is OK, throw with raw text
        throw new Error(`Upload succeeded but returned invalid JSON: ${text}`);
    };

    // Generate a URL-friendly slug from the event title for use in image filenames
    const slugify = (str: string) => {
        return (str || 'event')
            .toString()
            .normalize('NFKD')
            .replace(/\s+/g, '_')
            .replace(/[^A-Za-z0-9_-]/g, '')
            .toLowerCase()
            .substring(0, 120);
    };

    // Resolve the event image from various possible input formats (string filename, Ant Upload object, or File), handle resizing and uploading if necessary, and return the stored filename or URL.
    const resolveEventImage = async (
        rawValue: any,
        desiredName: string
    ): Promise<string | undefined> => {

        if (!rawValue) return undefined;

        // Already a stored filename
        if (typeof rawValue === "string") {
            return rawValue;
        }

        // Ant Upload object
        if (rawValue?.originFileObj instanceof File) {
            rawValue = rawValue.originFileObj;
        }

        // Direct File
        if (rawValue instanceof File) {
            let fileToUpload = rawValue;
            try {
                fileToUpload = await resizeImageFile(fileToUpload);
            } catch { }
            const uploadResp = await uploadImage(fileToUpload, desiredName);
            return uploadResp.filename || uploadResp.url || uploadResp.path;
        }

        return undefined;
    };

    // Prepare the input for create/update mutation by processing form data, handling image upload, and enforcing schema requirements. This function ensures that the event image is properly handled whether it's a new upload or an existing filename, and constructs the final input object for the GraphQL mutation.
    const prepareMutationInput = async (
        data: any,
        status: "DRAFT" | "REVIEW",
        id?: string
    ) => {
        const safeData = { ...data };

        const desired = id
            ? `${id}_${slugify(data.title || "")}`
            : `${slugify(data.title || "")}_${Date.now()}`;

        const filename = await resolveEventImage(data.event_img, desired);

        safeData.event_img = filename;

        const input = buildMutationInput(safeData, status, !!id);

        // Final schema enforcement
        if (typeof input.eventImg !== "string") {
            delete input.eventImg;
        }

        return input;
    };

    // Build the mutation input object from form data, converting times to 24-hour format, mapping location details, calculating event level, and including necessary metadata. This function centralizes all the logic for transforming the raw form data into the shape expected by the create/update event mutations, ensuring consistency and correctness in how event data is processed before being sent to the server.
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

        if (typeof data.event_img === "string") {
            mutationInput.eventImg = data.event_img;
        }
        if (convertedStartTime) mutationInput.startTime = convertedStartTime;
        if (convertedEndTime) mutationInput.endTime = convertedEndTime;
        if (convertedSetupTime) mutationInput.setupTime = convertedSetupTime;
        if (mappedLocationString) mutationInput.location = mappedLocationString;
        if (mappedLocationId) mutationInput.locationId = mappedLocationId;

        return mutationInput;
    };

    // Helper to allow navigation after confirming discard of changes, ensuring that the blocker is properly bypassed and the user is taken to the intended destination without being stuck in a navigation loop or having to click multiple times. This function centralizes the logic for safely navigating away from the form after handling unsaved changes, providing a smooth user experience.
    const navigateSafely = (path: string) => {
        allowNavigationRef.current = true;
        navigate(path);
    };

    // Handle saving the draft by preparing the mutation input, uploading the image if necessary, and calling either create or update mutation based on whether we're editing an existing draft. This function also manages the state of the draft ID and shows appropriate success or error messages to the user.
    const handleSaveDraft = async () => {
        if (!user) {
            message.error("You must be logged in to save a draft.");
            return;
        }

        const data = getValues();

        try {
            const input = await prepareMutationInput(data, "DRAFT", draftId || undefined);

            if (draftId) {
                await updateEvent({ variables: { id: draftId, input } });
                setDraftAlertMessage('updated');
            } else {
                const { data: result } = await createEvent({ variables: { input } });
                if (result?.createEvent?.id) {
                    setDraftId(result.createEvent.id);
                    setDraftAlertMessage('created');
                }
            }

            setTimeout(() => setDraftAlertMessage(''), 3000);
        } catch (err) {
            console.error("❌ Error saving draft:", err);
            message.error("Failed to save draft.");
        }
    };

    // Handle discarding the draft by deleting it from the database if it exists, clearing localStorage, and navigating away. This function ensures that all traces of the draft are removed and that the user is properly navigated away from the form after confirming their intent to discard changes.
    const handleDiscard = async () => {
        if (draftId) {
            console.log("🗑️ Deleting saved draft from DB:", draftId);
            try {
                await deleteEvent({ variables: { id: draftId } });
                console.log("✅ Draft deleted from DB");
            } catch (err) {
                console.error("❌ Error deleting draft from DB:", err);
                message.error("Failed to discard draft. Please try again.");
                return;
            }
        } else {
            console.log("📝 Discarding unsaved localStorage draft");
        }
        reset();

        try {
            localStorage.removeItem("eventFormData");
            localStorage.removeItem("eventFormReview");
        } catch (err) {
            console.error("❌ Error clearing localStorage:", err);
        }

        setDraftId(null);
        setIsDiscardModalOpen(false);
        message.success("Draft discarded");

        allowNavigationRef.current = true;

        if (blocker.state === "blocked") {
            blocker.proceed();
        } else if (pendingNavigation) {
            navigate(pendingNavigation);
            setPendingNavigation(null);
        } else {
            navigate("/");
        }
    };

    //  Handle leaving the form without discarding changes by simply clearing localStorage and allowing navigation, without deleting any existing draft from the database. This provides a way for users to exit the form while keeping their draft intact for future editing, while also ensuring that they won't be prompted about unsaved changes again until they return to the form.
    const handleLeaveWithoutDiscarding = () => {
        // Keep the draft saved in DB, just clear localStorage and navigate
        console.log("✅ Leaving without discarding saved draft");

        try {
            localStorage.removeItem("eventFormData");
            localStorage.removeItem("eventFormReview");
        } catch (err) {
            console.error("❌ Error clearing localStorage:", err);
        }

        setIsDiscardModalOpen(false);
        allowNavigationRef.current = true;

        if (blocker.state === "blocked") {
            blocker.proceed();
        } else if (pendingNavigation) {
            navigate(pendingNavigation);
            setPendingNavigation(null);
        } else {
            navigate("/");
        }
    };

    // Handle the review action by first triggering validation on all form fields, then checking for errors and automatically opening the relevant panel with the first error if validation fails, and finally navigating to the review page if validation passes. This function ensures that users are guided to fix any issues in their form before proceeding to review, providing a smoother and more user-friendly experience.
    const handleReviewForm = async () => {
        // Trigger validation on all fields
        const isValid = await trigger();

        if (!isValid) {
            // Find the first error field
            const errorFields = Object.keys(errors);

            if (errorFields.length > 0) {
                const firstErrorField = errorFields[0];

                // Map field names to their corresponding panel keys
                const fieldToPanelMap: Record<string, string> = {
                    'title': 'eventDetails',
                    'description': 'eventDetails',
                    'attendees': 'eventDetails',
                    'organization_id': 'eventDetails',
                    'event_date': 'dateLocation',
                    'start_time': 'dateLocation',
                    'end_time': 'dateLocation',
                    'setup_time': 'dateLocation',
                    'location_type': 'dateLocation',
                };

                // Map form_data sub-keys to their corresponding panel keys
                const formDataFieldToPanelMap: Record<string, string> = {
                    // eventElements panel
                    'elements': 'eventElements',
                    'level0_confirmed': 'eventElements',
                    'food': 'eventElements',
                    'alcohol': 'eventElements',
                    'minors': 'eventElements',
                    'movies': 'eventElements',
                    'raffles': 'eventElements',
                    'fire': 'eventElements',
                    'sorc_games': 'eventElements',
                    // dateLocation panel
                    'location': 'dateLocation',
                    'travel': 'dateLocation',
                    // budgetPurchase panel
                    'budget': 'budgetPurchase',
                    'vendors': 'budgetPurchase',
                    'vendors_notice_acknowledged': 'budgetPurchase',
                    'non_vendor_services': 'budgetPurchase',
                    'non_vendor_services_notes': 'budgetPurchase',
                    'non_vendor_services_acknowledged': 'budgetPurchase',
                };

                // Check if error is in form_data (nested fields)
                let panelToOpen = 'eventDetails'; // default

                if (firstErrorField === 'form_data') {
                    const formDataErrors = errors.form_data as any;
                    const firstFormDataErrorKey = Object.keys(formDataErrors || {})[0];
                    if (firstFormDataErrorKey) {
                        panelToOpen = formDataFieldToPanelMap[firstFormDataErrorKey] || 'eventDetails';
                    }
                } else {
                    panelToOpen = fieldToPanelMap[firstErrorField] || 'eventDetails';
                }

                // Open the panel with the error
                setActiveCollapseKey([panelToOpen]);
                setCurrentEditingSection(panelToOpen);

                // Show error message
                message.error('Please complete all required fields before proceeding to review.');

                // Scroll to top after a brief delay to allow panel to open
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }

            return;
        }

        // If validation passes, proceed to review
        try {
            const data = getValues();
            localStorage.setItem("eventFormReview", JSON.stringify(data));
            setCurrentEditingSection(undefined);
            navigateSafely(`/event-review${draftId ? `/${draftId}` : ''}`);
        } catch (err) {
            console.error("❌ Error saving review data to localStorage:", err);
            message.error("Failed to save form data");
        }
    };

    // Render the form with collapsible sections, progress timeline, and action buttons, along with modals and alerts for user interactions. This JSX structure defines the layout and interactive elements of the event form, ensuring that users have a clear and intuitive interface for entering their event details, navigating between sections, and managing their draft.
    return (
        <div className="container">
            <Title level={5}>
                <Link onClick={() => {
                    setIsExplicitDiscard(false); // Navigating back, not explicit discard
                    setIsDiscardModalOpen(true);
                }}><ArrowLeftOutlined /> Back </Link>
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Event Form</h2>
                <p>Provide your event information for review and approval.</p>
                <p> All required fields are marked with an asterisk (<span style={{ color: 'var(--red-6)' }}>*</span>). You must complete all required fields before proceeding to review.</p>
            </div>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
                <ProgressTimeline getValues={getValues} currentEditingSection={currentEditingSection} onSectionClick={setCurrentEditingSection} />
            </div>
            <div className={styles.collapseWrapper}>
                <Form layout="vertical">
                    <Collapse
                        activeKey={activeCollapseKey}
                        onChange={(keys) => {
                            const keyArray = Array.isArray(keys) ? keys : [keys];
                            const majorSectionKeys = ["eventDetails", "dateLocation", "eventElements", "budgetPurchase"];

                            // Filter to get only major sections (not nested panels)
                            const majorSectionsInKeys = keyArray.filter(key => majorSectionKeys.includes(key));

                            // If multiple major sections are in the array, keep only the last one clicked
                            let finalKeys: string[] = [];
                            let activeMajor: string | null = null;

                            if (majorSectionsInKeys.length > 0) {
                                // Keep only the most recent major section
                                activeMajor = majorSectionsInKeys[majorSectionsInKeys.length - 1];
                                finalKeys.push(activeMajor);

                                // Also add any nested panels that belong to this major section
                                keyArray.forEach((key) => {
                                    const nestedPanel = formBranching.find(p => p.key === key);
                                    if (nestedPanel && nestedPanel.parent === activeMajor) {
                                        finalKeys.push(key);
                                    }
                                });
                            }

                            setActiveCollapseKey(finalKeys);

                            // Update currentEditingSection to stay in sync with progress timeline
                            if (activeMajor) {
                                setCurrentEditingSection(activeMajor);
                            }
                        }}
                        expandIconPosition="end"
                    >
                        <Panel header={<h4 style={{ margin: 0 }}>Event Details</h4>} key="eventDetails">
                            <div id="panel-eventDetails">
                                <EventDetailsSection
                                    control={control}
                                    watch={watch}
                                    setValue={setValue}
                                />
                            </div>
                        </Panel>
                        <Panel header={<h4 style={{ margin: 0 }}>Date & Location</h4>} key="dateLocation">
                            <div id="panel-dateLocation">
                                <DateLocationSection control={control} />
                            </div>
                        </Panel>
                        {formNesting("dateLocation", isSelected, control, setValue)}
                        <Panel header={<h4 style={{ margin: 0 }}>Event Elements</h4>} key="eventElements">
                            <div id="panel-eventElements">
                                <EventElementsSection control={control} setValue={setValue} />
                            </div>
                        </Panel>
                        {formNesting("eventElements", isSelected, control, setValue)}
                        <Panel header={<h4 style={{ margin: 0 }}>Budget & Purchases</h4>} key="budgetPurchase">
                            <div id="panel-budgetPurchase">
                                <BudgetPurchaseSection control={control} setValue={setValue} />
                            </div>
                        </Panel>
                    </Collapse>
                    <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <Button type="primary" onClick={handleReviewForm} block>
                                Review Form
                            </Button>
                            <Button type="default" onClick={handleSaveDraft} block>
                                Save as Draft
                            </Button>
                        </div>
                        <Button style={{ backgroundColor: "transparent", borderColor: "transparent", color: "var(--sea-green-9)" }} onClick={() => {
                            setIsExplicitDiscard(true); // Explicit discard action
                            setIsDiscardModalOpen(true);
                        }}>
                            Discard
                        </Button>
                    </div>
                </Form>
            </div>
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
            <DiscardModal
                open={isDiscardModalOpen}
                title={!isExplicitDiscard && draftId ? "Leave Event Form?" : "Discard Event Form?"}
                message={!isExplicitDiscard && draftId
                    ? "Your draft has been saved. Do you want to leave this page?"
                    : draftId
                        ? "Are you sure you want to discard this saved draft? This action cannot be undone."
                        : "Are you sure you want to discard this event form? All unsaved changes will be lost."}
                cancelButtonText={!isExplicitDiscard && draftId ? "Stay" : "Cancel"}
                discardButtonText={!isExplicitDiscard && draftId ? "Leave" : "Discard"}
                onDiscardClick={!isExplicitDiscard && draftId ? handleLeaveWithoutDiscarding : handleDiscard}
                onCancelClick={() => {
                    setIsDiscardModalOpen(false);
                    setPendingNavigation(null);
                    if (blocker.state === "blocked") blocker.reset();
                }}
            />
            <ScrollToTop />
        </div>
    );
}

export default EventForm;
