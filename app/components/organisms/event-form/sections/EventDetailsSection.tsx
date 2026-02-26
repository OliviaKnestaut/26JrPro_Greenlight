import { Controller } from "react-hook-form";
import { Input, Upload, Typography, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../../../../auth/AuthProvider";
import { useGetOrganizationsQuery } from "../../../../lib/graphql/generated";
import FieldLabel from "../components/FieldLabel";

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

type Props = {
  control: any;
  getValues: any;
  setValue: any;
  setError: any;
  clearErrors: any;
};

export default function EventDetailsSection({ control, getValues, setValue, setError, clearErrors }: Props) {
  const { user } = useAuth();
  const { data: orgsData, loading: orgsLoading } = useGetOrganizationsQuery({
    variables: { limit: 1000 }
  });

  // Filter out current user's organization from the list
  const currentOrgId = user?.organization?.id;
  const availableOrgs = orgsData?.organizations?.filter(
    (org: any) => org.id !== currentOrgId
  ) || [];


  return (
    <>
      {/* Q1: Event Image */}
      <Controller
        name="event_img"
        control={control}
        rules={{
          required: "Event image is required",
          validate: (file) => {
            if (!file) return "Event image is required";

            const validTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!validTypes.includes(file.type)) {
              return "Only JPG and PNG images are allowed";
            }

            if (file.size > 5 * 1024 * 1024) {
              return "Image must be under 5MB";
            }

            return true;
          }
        }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24 }}>
            <FieldLabel required>
              Upload a high-resolution cover photo for your event (1300px × 780px) under 5MB
            </FieldLabel>

            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                const validTypes = ["image/jpeg", "image/jpg", "image/png"];
                const isValidType = validTypes.includes(file.type);
                const isUnder5MB = file.size <= 5 * 1024 * 1024;

                if (!isValidType) {
                  setError("event_img", {
                    type: "manual",
                    message: "Only JPG and PNG images are allowed",
                  });
                  return Upload.LIST_IGNORE;
                }

                if (!isUnder5MB) {
                  setError("event_img", {
                    type: "manual",
                    message: "Image must be under 5MB",
                  });
                  return Upload.LIST_IGNORE;
                }

                clearErrors("event_img");
                return false;
              }}
              onChange={(info) => {
                const file = info.fileList[0]?.originFileObj;
                if (!file) return;

                clearErrors("event_img");
                field.onChange(file);

                const previewUrl = URL.createObjectURL(file);
                setValue("event_img_name", file.name);
                setValue("event_img_preview", previewUrl);
              }}
              onRemove={() => {
                field.onChange(null);
                setValue("event_img_name", "");
                setValue("event_img_preview", "");
                return true;
              }}
              style={{ marginTop: 8 }}
              defaultFileList={
                field.value
                  ? [{
                      uid: '-1',
                      name: getValues("event_img_name") || 'Current Image',
                      status: 'done',
                      url: getValues("event_img_preview"),
                      originFileObj: undefined, // existing file, not a new File
                    }]
                  : []
              }
            >
              <div>
                <UploadOutlined /> Click to Upload
              </div>
            </Upload>

            {fieldState.error && (
              <Text
                type="danger"
                style={{
                  display: "block",
                  marginTop: 4,
                  color: "var(--red-6)",
                }}
              >
                {fieldState.error.message}
              </Text>
            )}
          </div>
        )}
      />

      {/* Q2: Event Title */}
      <Controller
        name="title"
        control={control}
        rules={{ required: "Event title is required" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24 }}>
            <FieldLabel required>What is the name of your event?</FieldLabel>
            <Input
              {...field}
              placeholder="Enter the event name"
              status={fieldState.error ? "error" : ""}
              style={{ marginTop: 8 }}
            />
            {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
          </div>
        )}
      />

      {/* Q3: Operational Description */}
      <Controller
        name="description"
        control={control}
        rules={{ required: "Event description is required" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24 }}>
            <FieldLabel required>Please provide a detailed operational description of the event activities</FieldLabel>
            <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 8 }}>
              Include logistics, programming details, and flow of the event
            </Text>
            <TextArea
              {...field}
              rows={4}
              placeholder="Enter the event operational details here"
              status={fieldState.error ? "error" : ""}
            />
            {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
          </div>
        )}
      />

      {/* Q4: Co-hosting Organizations */}
      <Controller
        name="organization_id"
        control={control}
        render={({ field }) => (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
              <FieldLabel>Are you co-hosting with another organization?</FieldLabel>
              <Text type="secondary" style={{}}>(Optional)</Text>
            </div>

            <Select
              {...field}
              mode="multiple"
              placeholder="Search and select organizations"
              allowClear
              loading={orgsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.children?.toString().toLowerCase() ?? "").includes(input.toLowerCase())
              }
              style={{ width: "100%" }}
              onChange={(val) => field.onChange(val)}
            >
              {availableOrgs.map((org: any) => (
                <Option key={org.id} value={org.id}>
                  {org.orgName}
                </Option>
              ))}
            </Select>
          </div>
        )}
      />

      {/* Q5: Expected Number of Attendees */}
      <Controller
        name="attendees"
        control={control}
        rules={{
          required: "Expected number of attendees is required",
          min: { value: 1, message: "Must be at least 1 attendee" }
        }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 24 }}>
            <FieldLabel required>What is the expected number of attendees?</FieldLabel>
            <Input
              {...field}
              type="number"
              placeholder="Ex: 50"
              min={1}
              status={fieldState.error ? "error" : ""}
              style={{ marginTop: 8, width: "100%" }}
            />
            {fieldState.error && <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>}
          </div>
        )}
      />
    </>
  );
}


