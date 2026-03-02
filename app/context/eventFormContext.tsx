// ─── Third-party ──────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from "react";

// =============================================================================
// EventFormContext
// Provides shared form data across the event-form wizard (review, submission).
// Persists to localStorage under "eventFormReview" so a page refresh doesn't
// lose in-progress data.  Call clearFormData() after a successful submission.
// =============================================================================

// ─── Types ────────────────────────────────────────────────────────────────────
type EventFormContextType = {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    clearFormData: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const EventFormProvider = ({ children }: { children: React.ReactNode }) => {
    const [formData, setFormData] = useState<any>(null);

    // Hydrate from localStorage on first mount so refreshes don't lose data
    useEffect(() => {
        const saved = localStorage.getItem("eventFormReview");
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
            } catch (err) {
                console.error("Failed to parse saved form data");
            }
        }
    }, []);

    // Keep localStorage in sync whenever formData changes
    useEffect(() => {
        if (formData) {
            localStorage.setItem("eventFormReview", JSON.stringify(formData));
        }
    }, [formData]);

    // Clears both the state and any persisted keys on submission / cancel
    const clearFormData = () => {
        setFormData(null);
        localStorage.removeItem("eventFormReview");
        localStorage.removeItem("eventFormData");
    };

    return (
        <EventFormContext.Provider value={{ formData, setFormData, clearFormData }}>
            {children}
        </EventFormContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useEventForm = () => {
    const context = useContext(EventFormContext);
    if (!context) {
        throw new Error("useEventForm must be used within EventFormProvider");
    }
    return context;
};