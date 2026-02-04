import { Controller } from "react-hook-form"
import { Input, Typography, Radio, Select } from "antd"

const { Text } = Typography

type Props = {
    control: any
}

export default function NestFoodSection({ control }: Props) {
  return (
    <>
      {/* What kind of food? */}
      <Controller
        name="vendor.foodType"
        control={control}
        rules={{ required: "Food type is required" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <Text strong>What kind of food?</Text>
            <Input
              {...field}
              placeholder="Enter the type of food"
              status={fieldState.error ? "error" : ""}
            />
            {fieldState.error && (
              <Text type="danger">{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />

      {/* What amount? */}
      <Controller
        name="vendor.amount"
        control={control}
        rules={{ required: "Amount is required" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <Text strong>What amount?</Text>
            <Input
              {...field}
              placeholder="Enter the amount"
              status={fieldState.error ? "error" : ""}
            />
            {fieldState.error && (
              <Text type="danger">{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />

      {/* Vendor */}
      <Controller
        name="vendor.vendor"
        control={control}
        render={({ field }) => (
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <Text strong>Vendor?</Text>
            <Radio.Group {...field}>
              <Radio value="preferred">Preferred Vendor</Radio>
              <Radio value="non-preferred">Non Preferred Vendor</Radio>
            </Radio.Group>
          </div>
        )}
      />
    </>
  )
}