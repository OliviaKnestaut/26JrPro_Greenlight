import React, { createContext, useContext, useState, useEffect } from "react";

type EventFormContextType = {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    clearFormData: () => void;
};

const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

export const EventFormProvider = ({ children }: { children: React.ReactNode }) => {
    const [formData, setFormData] = useState<any>(null);

    // Hydrate once from localStorage (optional safety)
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

    // Persist automatically whenever formData changes
    useEffect(() => {
        if (formData) {
            localStorage.setItem("eventFormReview", JSON.stringify(formData));
        }
    }, [formData]);

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

export const useEventForm = () => {
    const context = useContext(EventFormContext);
    if (!context) {
        throw new Error("useEventForm must be used within EventFormProvider");
    }
    return context;
};