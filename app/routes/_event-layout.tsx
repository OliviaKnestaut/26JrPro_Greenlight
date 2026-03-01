import { Outlet } from "react-router-dom";
import { EventFormProvider } from "~/context/eventFormContext";

export default function FormLayout() {
    return (
        <EventFormProvider>
            <Outlet />
        </EventFormProvider>
    );
}