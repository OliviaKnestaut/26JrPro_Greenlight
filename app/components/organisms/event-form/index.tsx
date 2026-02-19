import React, { useState } from "react";
import { Form, Button, Collapse, Typography, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
const { Title, Link } = Typography;
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import EventDetailsSection from "../event-form/sections/EventDetailsSection";
import DateLocationSection from "../event-form/sections/DateLocationSection";
import EventElementsSection from "../event-form/sections/EventElementsSection";
import BudgetPurchaseSection from "../event-form/sections/BudgetPurchasesSection";
import SuccessModal from "../../molecules/event-flow/success-modal";
import DiscardModal from "../../molecules/event-flow/discard-modal";
import ProgressTimeline from "../../molecules/event-flow/progress-timeline";
import styles from "./eventform.module.css";
import NestFoodSection from "./sections/nestedSections/elementNest/nestFood";
import OnCampusSection from "./sections/nestedSections/locationNest/nestOn";
import OffCampusSection from "./sections/nestedSections/locationNest/nestOff";
import AlcoholSection from "./sections/nestedSections/elementNest/nestAlcohol";
import MinorsSection from "./sections/nestedSections/elementNest/nestMinors";
import MoviesSection from "./sections/nestedSections/elementNest/nestMovies";
import RafflesSection from "./sections/nestedSections/elementNest/nestRaffles";
import FireSafetySection from "./sections/nestedSections/elementNest/nestFire";
import SORCGamesSection from "./sections/nestedSections/elementNest/nestGames";
const { Panel } = Collapse;


// Define the branching logic for nested sections
const formBranching = [
    // Date & Location nests
    {
        when: "location_type",
        is: "On-Campus",
        key: "onCampus",
        parent: "dateLocation",
        header: "On-Campus Details",
        component: OnCampusSection,
        indent: 32
    },
    {
        when: "location_type",
        is: "Off-Campus",
        key: "offCampus",
        parent: "dateLocation",
        header: "Off-Campus Details",
        component: OffCampusSection,
        indent: 32
    },

    // Event Elements nests
    {
        when: "form_data.elements.food",
        is: true,
        key: "food",
        parent: "eventElements",
        header: "Food Details",
        component: NestFoodSection,
        indent: 32
    },
    {
        when: "form_data.elements.alcohol",
        is: true,
        key: "alcohol",
        parent: "eventElements",
        header: "Alcohol Details",
        component: AlcoholSection,
        indent: 32
    },
    {
        when: "form_data.elements.minors",
        is: true,
        key: "minors",
        parent: "eventElements",
        header: "Minors Details",
        component: MinorsSection,
        indent: 32
    },
    {
        when: "form_data.elements.movies",
        is: true,
        key: "movies",
        parent: "eventElements",
        header: "Movies/Media Details",
        component: MoviesSection,
        indent: 32
    },
    {
        when: "form_data.elements.raffles",
        is: true,
        key: "raffles",
        parent: "eventElements",
        header: "Raffles/Prizes Details",
        component: RafflesSection,
        indent: 32
    },
    {
        when: "form_data.elements.fire",
        is: true,
        key: "fire",
        parent: "eventElements",
        header: "Fire Safety Details",
        component: FireSafetySection,
        indent: 32
    },
    {
        when: "form_data.elements.sorc_games",
        is: true,
        key: "sorc_games",
        parent: "eventElements",
        header: "SORC Games Details",
        component: SORCGamesSection,
        indent: 32
    },
]

// Recursive function to render nested sections based on branching logic
const formNesting = (parentKey: string, isSelected: Record<string, any>, control: any, setValue: any) => {
    return formBranching.filter((panel) => panel.parent === parentKey).map((panel) => {
        // Support nested field paths like "form_data.elements.food"
        const fieldPath = panel.when.split('.');
        let currentValue: any = isSelected;
        for (const key of fieldPath) {
            currentValue = currentValue?.[key];
        }

        const displayPanel = Array.isArray(currentValue)
            ? currentValue.includes(panel.is)
            : currentValue === panel.is

        if (!displayPanel) return null

        const PanelComponent = panel.component

        return (
            <Panel
                header={<h4 style={{ margin: 0 }}>{panel.header}</h4>}
                key={panel.key}
                style={{ marginLeft: panel.indent || 0 }}>
                <PanelComponent control={control} setValue={setValue} />
                {formNesting(panel.key, isSelected, control, setValue)}
            </Panel>
        )
    },)
}

export function EventForm() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false)
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false)
    const { control, handleSubmit, getValues, reset, watch, setValue } = useForm()
    const isSelected = useWatch({ control });
    const navigate = useNavigate();


    const onSubmit = (data: any) => {
        console.log("FORM DATA:", data)
        localStorage.setItem("eventFormData", JSON.stringify(data))
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
    }

    const handleDashboardClick = () => {
        setIsModalOpen(false)
        navigate("/")
    }

    const handleEventOverviewClick = () => {
        setIsModalOpen(false)
        navigate("/event-overview")
    }

    const handleDiscard = () => {
        reset()
        localStorage.removeItem("eventFormData")
        setIsDiscardModalOpen(false)
        navigate("/")
    }

    const handleSaveDraft = () => {
        const data = getValues()
        console.log("DRAFT DATA:", data)
        localStorage.setItem("eventFormDraft", JSON.stringify(data))
        setIsDraftModalOpen(true)
        // Auto-dismiss after 3 seconds
        setTimeout(() => setIsDraftModalOpen(false), 3000)
    }

    return (
        <div className="container mx-auto p-8">
            {/* Back link */}
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>

            {/* Form header */}
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                <h2 style={{ margin: 0 }}>Event Form</h2>
                <p>Provide your event information for review and approval.</p>
            </div>

            {/* Progress Timeline */}
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
                <ProgressTimeline getValues={getValues} />
            </div>

            {/* Form */}
            <div className={styles.collapseWrapper}>
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    <Collapse defaultActiveKey={["eventDetails", "dateLocation", "eventElements", "budgetPurchase"]} expandIconPosition="end">
                        {/* ! Event Details Section */}
                        <Panel header={<h4 style={{ margin: 0 }}>Event Details</h4>} key="eventDetails">
                            <EventDetailsSection control={control} watch={watch} />
                        </Panel>

                        {/* Event Details has no nested sections */}

                        {/* Date & Location Section */}
                        <Panel header={<h4 style={{ margin: 0 }}>Date & Location</h4>} key="dateLocation">
                            <DateLocationSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("dateLocation", isSelected, control, setValue)}

                        {/* Event Elements Section */}
                        <Panel header={<h4 style={{ margin: 0 }}>Event Elements</h4>} key="eventElements">
                            <EventElementsSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("eventElements", isSelected, control, setValue)}

                        {/* Budget & Purchases Section */}
                        <Panel header={<h4 style={{ margin: 0 }}>Budget & Purchases</h4>} key="budgetPurchase">
                            <BudgetPurchaseSection control={control} />
                        </Panel>

                        {/* Budget & Purchases has no nested sections */}

                    </Collapse>

                    {/* Form buttons */}
                    <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <Button type="primary" htmlType="submit" block>
                                Submit Form
                            </Button>

                            <Button type="default" htmlType="button" block onClick={handleSaveDraft}>
                                Save as Draft
                            </Button>
                        </div>
                        <Button type="default" htmlType="button" danger onClick={() => setIsDiscardModalOpen(true)}>
                            Discard
                        </Button>
                    </div>
                </Form>
            </div>

            {/* Success Modal */}
            <SuccessModal
                open={isModalOpen}
                onDashboardClick={handleDashboardClick}
                onEventOverviewClick={handleEventOverviewClick}
            />

            {/* Draft Success Alert */}
            {isDraftModalOpen && (
                <Alert 
                    message="Your draft has been saved successfully!" 
                    type="success" 
                    showIcon 
                    closable
                    onClose={() => setIsDraftModalOpen(false)}
                    style={{ position: 'fixed', top: 125, right: 24, zIndex: 1000,}}
                />
            )}

            {/* Discard Modal */}
            <DiscardModal
                open={isDiscardModalOpen}
                onDiscardClick={handleDiscard}
                onCancelClick={() => setIsDiscardModalOpen(false)}
            />
        </div>
    )
}

export default EventForm;