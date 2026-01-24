import { Controller } from "react-hook-form"
import { Input, Upload, Typography } from "antd"
import { UploadOutlined } from "@ant-design/icons"

const { TextArea } = Input
const { Text } = Typography

type Props = {
    control: any
}

export default function EventDetailsSection({ control }: Props) {
  return (
    <>
      {/* Image Upload */}
      <Controller
        name="event.image"
        control={control}
        render={({ field }) => (
          <div style={{ marginBottom: 24 }}>
            <Text strong>Image:</Text>
            <br />

            <Upload
              beforeUpload={() => false} // prevent auto-upload
              maxCount={1}
              onChange={(info) => {
                const file = info.fileList[0]?.originFileObj
                field.onChange(file)
              }}
            >
              <div style={{ marginTop: 8 }}>
                <UploadOutlined /> Click to Upload
              </div>
            </Upload>

            <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
              Recommended resolution is 640×640 with file size under 2MB
            </Text>
          </div>
        )}
      />

      {/* Event Name */}
      <Controller
        name="event.name"
        control={control}
        rules={{ required: "Event name is required" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24 }}>
            <Text strong>Event Name</Text>
            <Input
              {...field}
              placeholder="Enter the name of your event here."
              status={fieldState.error ? "error" : ""}
            />
            {fieldState.error && (
              <Text type="danger">{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />

      {/* Description */}
      <Controller
        name="event.description"
        control={control}
        rules={{ maxLength: 100 }}
        render={({ field }) => (
          <div style={{ marginBottom: 24 }}>
            <Text strong>Description</Text>
            <TextArea
              {...field}
              rows={4}
              maxLength={100}
              placeholder="Enter a description of your event here."
              showCount
            />
          </div>
        )}
      />

      {/* Attendees */}
      <Controller
        name="event.attendees"
        control={control}
        render={({ field }) => (
          <div style={{ marginBottom: 8 }}>
            <Text strong>Attendees</Text>
            <Input
              {...field}
              type="number"
              placeholder="Ex: 500"
              min={1}
            />
          </div>
        )}
      />
    </>
  )
}
