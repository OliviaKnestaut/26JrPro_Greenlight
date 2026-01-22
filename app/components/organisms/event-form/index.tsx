import { Form, Button, Collapse } from "antd"
import { useForm, useWatch } from "react-hook-form"
const { Panel } = Collapse



import EventDetailsSection from "../event-form/sections/EventDetailsSection"
import DateLocationSection from "../event-form/sections/DateLocationSection"
import EventElementsSection from "../event-form/sections/EventElementsSection"
import BudgetPurchaseSection from "../event-form/sections/BudgetPurchasesSection"


import styles from "./eventform.module.css"
import Budget from "~/routes/budget"

// Define the branching logic for nested sections
const formBranching = [
    {
        when: "vendor",
        is: "yes",
        key: "vendor",
        parent: "eventElements",
        header: "Vendor Details",
        component: EventDetailsSection,
        indent: 32
    },

    {
        when: "eventElements",
        is: "Food",
        key: "vendorDetails",
        parent: "eventElements",
        header: "Vendor Details",
        component: EventDetailsSection,
        indent: 32
    }
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
                header={<h3 style={{ margin: 0 }}>{panel.header}</h3>}
                key={panel.key}
                style={{ marginLeft: panel.indent || 0 }}>
                <PanelComponent control={control} />
                {formNesting(panel.key, isSelected, control)}
            </Panel>
        )
    },)
}


export function EventForm() {
    const { control, handleSubmit } = useForm()

    // Add isSelected using useWatch to observe form values
    const isSelected = useWatch({ control });

    const onSubmit = (data: any) => {
        console.log("FORM DATA:", data)
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className={styles.title}>Event Form</h1>
            <p>Provide your event information for review and approval.</p>

            <div className={styles.collapseWrapper}>
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    <Collapse defaultActiveKey={["eventDetails"]} expandIconPosition="end">

                        {/* ! Event Details Section */}
                        <Panel header={<h3 style={{ margin: 0 }}>Event Details</h3>} key="eventDetails">
                            <EventDetailsSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("eventDetails", isSelected, control)}


                        {/* Date & Location Section */}
                        <Panel header={<h3 style={{ margin: 0 }}>Date & Location</h3>} key="dateLocation">
                            {/* Date & Location Section Component */}
                            <DateLocationSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("dateLocation", isSelected, control)}

                        {/* Event Elements Section */}
                        <Panel header={<h3 style={{ margin: 0 }}>Event Elements</h3>} key="eventElements">
                            <EventElementsSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("eventElements", isSelected, control)}

                        {/* Budget & Purchases Section */}
                        <Panel header={<h3 style={{ margin: 0 }}>Budget & Purchases</h3>} key="budgetPurchase">
                            <BudgetPurchaseSection control={control} />
                        </Panel>

                        {/* Render nested sections FOR THIS PARENT SECTION based on branching logic */}
                        {formNesting("budgetPurchase", isSelected, control)}
                    </Collapse>

                    <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 12}}>
                            <Button type="primary" htmlType="submit" block>
                                Submit Form
                            </Button>

                            <Button type="default" htmlType="button" block>
                                Save as Draft
                            </Button>
                        </div>
                        <Button type="default" htmlType="button" block danger>
                            Discard
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}
