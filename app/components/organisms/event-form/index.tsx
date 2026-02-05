import React, { useState } from "react";
import { Form, Button, Collapse, Steps, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
const { Title, Link } = Typography;
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import EventDetailsSection from "../event-form/sections/EventDetailsSection";
import DateLocationSection from "../event-form/sections/DateLocationSection";
import EventElementsSection from "../event-form/sections/EventElementsSection";
import BudgetPurchaseSection from "../event-form/sections/BudgetPurchasesSection";
import SuccessModal from "../../molecules/event-flow/success-modal";
import styles from "./eventform.module.css";
import NestFoodSection from "./sections/nest/nestFood";
import NestVendorSection from "./sections/nest/nestVendor";
const { Panel } = Collapse;

// Define the branching logic for nested sections
const formBranching = [
    {
        when: "eventElements",
        is: "Food",
        key: "vendorDetails",
        parent: "eventElements",
        header: "Food",
        component: NestFoodSection,
        indent: 32
    },

    {
        when: "vendor",
        is: "yes",
        key: "vendor",
        parent: "budgetPurchase",
        header: "Vendor Details",
        component: NestVendorSection,
        indent: 32
    },
]

// Recursive function to render nested sections based on branching logic
const formNesting = (parentKey: string, isSelected: Record<string, any>, control: any) => {
    return formBranching.filter((panel) => panel.parent === parentKey).map((panel) => {
        const currentValue = isSelected?.[panel.when]
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
                <PanelComponent control={control} />
                {formNesting(panel.key, isSelected, control)}
            </Panel>
        )
    },)
}

export function EventForm() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { control, handleSubmit, getValues, reset } = useForm()
    const isSelected = useWatch({ control });
    const navigate = useNavigate();

    // Define main steps for the stepper
    const steps = [
        { title: "Event Details", key: "eventDetails" },
        { title: "Date & Location", key: "dateLocation" },
        { title: "Event Elements", key: "eventElements" },
        { title: "Budget & Purchases", key: "budgetPurchase" },
    ];

    // Helper function to determine if a section is complete
    const isSectionComplete = (key: string) => {
        const values = getValues(); // get current form values
        switch (key) {
            case "eventDetails":
                // Example: mark complete if event name exists
                return !!values.eventName;
            case "dateLocation":
                return !!values.date && !!values.location;
            case "eventElements":
                return !!values.eventElements?.length;
            case "budgetPurchase":
                return !!values.budget;
            default:
                return false;
        }
    }

    // Determine current step based on completed sections
    const currentStep = steps.findIndex((s) => !isSectionComplete(s.key));
    const activeStep = currentStep === -1 ? steps.length - 1 : currentStep;

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
        if (window.confirm("Are you sure? This will discard all changes.")) {
            reset()
            localStorage.removeItem("eventFormData")
            navigate("/")
        }
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

            {/* Steps Component */}
            <Steps
                current={activeStep}
                items={steps.map((step) => ({
                    key: step.key,
                    title: step.title,
                }))}
                style={{ marginBottom: 24 }}
            />

            {/* Form */}
            <div className={styles.collapseWrapper}>
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    <Collapse defaultActiveKey={steps.map((s) => s.key)} expandIconPosition="end">
                        {/* ! Event Details Section */}
                        <Panel header={<h4 style={{ margin: 0 }}>Event Details</h4>} key="eventDetails">
                            <EventDetailsSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("eventDetails", isSelected, control)}

                        {/* Date & Location Section */}
                        <Panel header={<h4 style={{ margin: 0 }}>Date & Location</h4>} key="dateLocation">
                            <DateLocationSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("dateLocation", isSelected, control)}

                        {/* Event Elements Section */}
                        <Panel header={<h4 style={{ margin: 0 }}>Event Elements</h4>} key="eventElements">
                            <EventElementsSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("eventElements", isSelected, control)}

                        {/* Budget & Purchases Section */}
                        <Panel header={<h4 style={{ margin: 0 }}>Budget & Purchases</h4>} key="budgetPurchase">
                            <BudgetPurchaseSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("budgetPurchase", isSelected, control)}
                    </Collapse>

                    {/* Form buttons */}
                    <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <Button type="primary" htmlType="submit" block>
                                Submit Form
                            </Button>

                            <Button type="default" htmlType="button" block>
                                Save as Draft
                            </Button>
                        </div>
                        <Button type="default" htmlType="button" danger onClick={handleDiscard}>
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
        </div>
    )
}

export default EventForm;