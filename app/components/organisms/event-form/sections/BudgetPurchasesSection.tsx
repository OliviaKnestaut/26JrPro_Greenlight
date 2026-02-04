import { Controller } from "react-hook-form"
import { Input, Radio, Typography } from "antd"
import { UploadOutlined } from "@ant-design/icons"

const { TextArea } = Input
const { Text } = Typography

type Props = {
    control: any
}

export default function BudgetPurchasesSection({ control }: Props) {
    return (
        <>
            {/* Account */}
            <Controller
                name="account"
                control={control}
                rules={{ required: "Account is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 24 }}>
                        <Text strong>What account are you using?</Text>
                        <Input
                            {...field}
                            placeholder="Enter your 14 digit 17 or 19 account here"
                            status={fieldState.error ? "error" : ""}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* Event Name */}
            <Controller
                name="budget"
                control={control}
                rules={{ required: "Budget is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 24 }}>
                        <Text strong>What is your total budget for this event?</Text>
                        <Input
                            {...field}
                            placeholder="EX: $5000"
                            status={fieldState.error ? "error" : ""}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            <Controller
                name="vendor"
                control={control}
                render={({ field }) => (
                    <div style={{ marginBottom: 24 }}>
                        <Text strong>Do you need a vendor?</Text>
                        <Radio.Group {...field}>
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                        </Radio.Group>
                    </div>
                )}
            />

        </>
    )
}
