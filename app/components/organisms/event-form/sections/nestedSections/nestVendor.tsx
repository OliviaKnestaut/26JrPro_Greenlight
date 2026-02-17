import { Controller } from "react-hook-form"
import { Input, Typography, Radio, Select } from "antd"

const { Text } = Typography

type Props = {
    control: any
}

export default function NestVendorSection({ control }: Props) {
  return (
    <>
      {/* What type of vendor is this? */}
      <Controller
        name="vendor.type"
        control={control}
        rules={{ required: "Vendor type is required" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>What type of vendor is this?</Text>
            <Select
              {...field}
              placeholder="Select vendor type"
              status={fieldState.error ? "error" : ""}
              options={[
                { label: "Food", value: "food" },
                { label: "Entertainment", value: "entertainment" },
                { label: "Music", value: "music" },
              ]}
            />
            {fieldState.error && (
              <Text type="danger">{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />

      {/* Vendor/Company Name */}
      <Controller
        name="vendor.companyName"
        control={control}
        rules={{ required: "Vendor/Company name is required" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>Vendor/Company Name</Text>
            <Input
              {...field}
              placeholder="Enter vendor or company name"
              status={fieldState.error ? "error" : ""}
            />
            {fieldState.error && (
              <Text type="danger">{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />

      {/* Have you worked with this vendor before? */}
      <Controller
        name="vendor.workedBefore"
        control={control}
        rules={{ required: "Please select an option" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>Have you worked with this vendor before?</Text>
            <Radio.Group {...field}>
              <Radio value="yes">Yes</Radio>
              <Radio value="no">No</Radio>
            </Radio.Group>
            {fieldState.error && (
              <Text type="danger">{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />

      {/* How much are you paying this vendor? */}
      <Controller
        name="vendor.amount"
        control={control}
        rules={{ required: "Amount is required" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>How much are you paying this vendor?</Text>
            <Input
              {...field}
              placeholder="Enter amount (e.g., $500)"
              status={fieldState.error ? "error" : ""}
            />
            {fieldState.error && (
              <Text type="danger">{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />
    </>
  )
}
