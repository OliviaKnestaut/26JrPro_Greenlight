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
    const { control, handleSubmit, getValues, reset, watch, setValue, trigger, formState: { errors } } = useForm({ mode: "onChange" });
    const isSelected = useWatch({ control });
    const [activeCollapseKey, setActiveCollapseKey] = useState<string[]>(["eventDetails"]);
    const [currentEditingSection, setCurrentEditingSection] = useState<string | undefined>();
    const allowNavigationRef = useRef(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if (allowNavigationRef.current) return false;
        return currentLocation.pathname !== nextLocation.pathname;
    });

    useEffect(() => {
        if (blocker.state === "blocked") {
            setPendingNavigation(
                `${blocker.location.pathname}${blocker.location.search}${blocker.location.hash}`
            );
            setIsExplicitDiscard(false); // Navigation attempt, not explicit discard
            setIsDiscardModalOpen(true);
        }
    }, [blocker]);

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

    const navigateSafely = (path: string) => {
        allowNavigationRef.current = true;
        navigate(path);
    };

    const handleSaveDraft = async () => {
        if (!user) {
            message.error("You must be logged in to save a draft.");
            return;
        }
        const data = getValues();

        // Helper: upload image to server endpoint and return the public url and filename
            const uploadImage = async (file: File, desiredName?: string) => {
                const fd = new FormData();
                fd.append('event_img', file);
                if (desiredName) fd.append('desired_name', desiredName);
                const resp = await fetch('/~ojk25/jrProjGreenlight/uploads/upload_event_image.php', { method: 'POST', body: fd });

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

        const slugify = (str: string) => {
            return (str || 'event')
                .toString()
                .normalize('NFKD')
                .replace(/\s+/g, '_')
                .replace(/[^A-Za-z0-9_-]/g, '')
                .toLowerCase()
                .substring(0, 120);
        };

        // If event_img is a File object (from Upload), handle upload specially.
        if (data.event_img && data.event_img instanceof File) {
            // Use a local id variable to ensure we pass a string to the mutation
            let idToUse: string | null = draftId;

            // If we don't yet have a draftId (new create), create the draft first without eventImg
            if (!idToUse) {
                try {
                    const createInput = buildMutationInput({ ...data, event_img: undefined }, "DRAFT", false);
                    // Ensure we are not sending a File to createEvent
                    delete createInput.eventImg;
                    message.loading({ content: 'Creating draft...', key: 'draft' });
                    const { data: createResult } = await createEvent({ variables: { input: createInput } });
                    const newId = createResult?.createEvent?.id;
                    if (!newId) throw new Error('Failed to create draft before image upload');
                    idToUse = newId;
                    setDraftId(newId);
                    setDraftAlertMessage('created');
                    setTimeout(() => setDraftAlertMessage(''), 3000);
                    message.success({ content: 'Draft created', key: 'draft', duration: 1 });
                } catch (err) {
                    console.error('❌ Failed to create draft before image upload:', err);
                    message.error('Failed to create draft before uploading image. Please try again.');
                    return;
                }
            }

                // Now we have an idToUse; upload using desired name: {eventId}_{slugifiedTitle}
            try {
                if (!idToUse) {
                    throw new Error('Missing draft id for image upload');
                }
                message.loading({ content: 'Uploading image...', key: 'upload' });
                const desired = `${idToUse}_${slugify(data.title || '')}`;
                    // Resize image client-side to meet server limits before uploading
                    let fileToUpload: File = data.event_img as File;
                    try {
                        fileToUpload = await resizeImageFile(fileToUpload, 1300, 780, 0.85);
                    } catch (e) {
                        console.warn('Image resize failed, proceeding with original file', e);
                    }
                    const uploadResp = await uploadImage(fileToUpload, desired);
                // Write the stored filename (not the File object) to DB
                const filenameToSave = uploadResp.filename || uploadResp.url || uploadResp.path;
                // Update the event with the filename
                try {
                    const updateInput = buildMutationInput({ ...data, event_img: filenameToSave }, "DRAFT", true);
                    // Ensure eventImg is a string filename
                    updateInput.eventImg = filenameToSave;
                    message.loading({ content: 'Saving image reference...', key: 'save' });
                    const { data: updateResult } = await updateEvent({ variables: { id: idToUse, input: updateInput } });
                    if (updateResult?.updateEvent?.id) {
                        message.success({ content: 'Image uploaded and saved', key: 'upload', duration: 1 });
                        message.success({ content: 'Draft updated', key: 'save', duration: 1 });
                    }
                } catch (err) {
                    console.error('❌ Failed to update event with image filename:', err);
                    message.error('Uploaded image but failed to save filename to event.');
                    return;
                }
            } catch (err) {
                console.error('❌ Image upload failed:', err);
                message.error('Image upload failed. Please try again.');
                return;
            }

            // At this point the draft exists and has the image filename saved; nothing more to do below for create path
            return;
        }

        const mutationInput = buildMutationInput(data, "DRAFT", !!draftId);
        console.log("💾 SAVING DRAFT:", mutationInput);

        try {
            if (draftId) {
                console.log(`🔄 Updating draft ${draftId}`);
                const { data: result } = await updateEvent({ variables: { id: draftId, input: mutationInput } });
                if (result?.updateEvent?.id) {
                    console.log("✅ Draft updated successfully");
                    setDraftAlertMessage('updated');
                    setTimeout(() => setDraftAlertMessage(''), 3000);
                }
            } else {
                console.log("✨ Creating new draft");
                const { data: result } = await createEvent({ variables: { input: mutationInput } });
                if (result?.createEvent?.id) {
                    console.log("✅ Draft created successfully:", result.createEvent.id);
                    setDraftId(result.createEvent.id);
                    setDraftAlertMessage('created');
                    setTimeout(() => setDraftAlertMessage(''), 3000);
                }
            }
        } catch (err) {
            console.error("❌ Error saving draft:", err);
            message.error("Failed to save draft. Please try again.");
        }
    };

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

    return (
        <div className="container mx-auto p-8">
            <Title level={5}>
                <Link onClick={() => {
                    setIsExplicitDiscard(false); // Navigating back, not explicit discard
                    setIsDiscardModalOpen(true);
                }}><ArrowLeftOutlined /> Back </Link>
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
                            const majorSectionKeys = ["eventDetails", "dateLocation", "eventElements", "budgetPurchase"];

                            // Determine which major sections have just been opened or closed
                            const newlyOpenedMajors = majorSectionKeys.filter(
                                (key) => keyArray.includes(key) && !activeCollapseKey.includes(key)
                            );
                            const justClosedMajors = majorSectionKeys.filter(
                                (key) => activeCollapseKey.includes(key) && !keyArray.includes(key)
                            );

                            // When a major section is closed, also close its nested children
                            const nestedKeysToClose: string[] = [];
                            justClosedMajors.forEach((closedKey) => {
                                formBranching.forEach((branch) => {
                                    if (branch.parent === closedKey) {
                                        nestedKeysToClose.push(branch.key);
                                    }
                                });
                            });

                            const finalKeys = keyArray.filter((k) => !nestedKeysToClose.includes(k));

                            setActiveCollapseKey(finalKeys);

                            // Update the current editing section based on open majors
                            let nextEditingSection = currentEditingSection;

                            if (newlyOpenedMajors.length > 0) {
                                // Prefer the most recently opened major section
                                nextEditingSection = newlyOpenedMajors[newlyOpenedMajors.length - 1];
                            } else if (!nextEditingSection || !finalKeys.includes(nextEditingSection)) {
                                // Fall back to any open major section, if current is no longer valid
                                const openMajorSection = majorSectionKeys.find((key) => finalKeys.includes(key));
                                nextEditingSection = openMajorSection;
                            }

                            setCurrentEditingSection(nextEditingSection || undefined);
                        }}
                        expandIconPosition="end"
                    >
                        <Panel header={<h4 style={{ margin: 0 }}>Event Details</h4>} key="eventDetails">
                            <EventDetailsSection control={control} watch={watch} />
                        </Panel>
                        <Panel header={<h4 style={{ margin: 0 }}>Date & Location</h4>} key="dateLocation">
                            <DateLocationSection control={control} />
                        </Panel>
                        {formNesting("dateLocation", isSelected, control, setValue)}
                        <Panel header={<h4 style={{ margin: 0 }}>Event Elements</h4>} key="eventElements">
                            <EventElementsSection control={control} setValue={setValue} />
                        </Panel>
                        {formNesting("eventElements", isSelected, control, setValue)}
                        <Panel header={<h4 style={{ margin: 0 }}>Budget & Purchases</h4>} key="budgetPurchase">
                            <BudgetPurchaseSection control={control} setValue={setValue} />
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
                        <Button style={{ backgroundColor: "transparent", borderColor: "transparent", color: "var(--sea-green-9)"  }} onClick={() => {
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
