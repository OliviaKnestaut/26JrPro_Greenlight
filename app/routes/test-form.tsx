import { Form, Button, Collapse } from "antd"
import { useForm } from "react-hook-form"

import EventDetailsSection from "../components/EventDetailsSection"
import StudentSection from "../components/StudentSection"
import StaffSection from "../components/StaffSection"

const { Panel } = Collapse

export default function TestForm() {
    const { control, handleSubmit } = useForm()

    const onSubmit = (data: any) => {
        console.log("FORM DATA:", data)
        alert(JSON.stringify(data, null, 2))
    }

    return (
        <div style={{ maxWidth: 1000, margin: "2rem auto" }}>
            <h1>Event Submission Form</h1>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Collapse defaultActiveKey={["1"]} accordion>
                    <Panel header="Event Details" key="1">
                        <EventDetailsSection control={control} />
                    </Panel>

                    <Panel header="Student Information" key="2">
                        <StudentSection control={control} />
                    </Panel>

                    <Panel header="Staff Information" key="3">
                        <StaffSection control={control} />
                    </Panel>
                </Collapse>

                <div style={{ marginTop: "2rem" }}>
                    <Button type="primary" htmlType="submit" block>
                        Submit Form
                    </Button>
                </div>
            </Form>
        </div>
    )
}
