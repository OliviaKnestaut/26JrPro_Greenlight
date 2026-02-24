import { Controller, useWatch } from "react-hook-form";
import { Radio, Input, Typography, InputNumber } from "antd";
import FieldLabel from "../../../components/FieldLabel";

const { Text } = Typography;

type Props = {
  control: any;
};

const foodOptions = [
  { 
    label: "Potluck-style event (closed event for 50 or less organization members only)", 
    value: "potluck" 
  },
  { 
    label: "Under $500 - Purchase request through DragonLink (not Chestnut Street)", 
    value: "under_500_dragonlink" 
  },
  { 
    label: "Over $500 - Ordering through Chestnut Street Catering", 
    value: "over_500_chestnut" 
  },
  { 
    label: "Over $500 - Requesting catering exception", 
    value: "over_500_exception" 
  },
  { 
    label: "Off-campus restaurant or food service establishment", 
    value: "offcampus_restaurant" 
  },
];

export default function FoodSection({ control }: Props) {
  const foodType = useWatch({
    control,
    name: "form_data.food.type",
  });

  // Show vendor field for exception and off-campus options
  const showVendor = foodType && [
    "over_500_exception",
    "offcampus_restaurant"
  ].includes(foodType);

  return (
    <div >
      {/* F1 — Food Type */}
      <Controller
        name="form_data.food.type"
        control={control}
        rules={{ required: "Please select a food option" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>How will you provide food for this event?</FieldLabel>
            <Radio.Group
              {...field}
              onChange={(e) => field.onChange(e.target.value)}
              style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
            >
              {foodOptions.map((opt) => (
                <Radio key={opt.value} value={opt.value}>
                  {opt.label}
                </Radio>
              ))}
            </Radio.Group>

            {fieldState.error && (
              <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />

      {/* F2a — Under $500 DragonLink with note */}
      {foodType === "under_500_dragonlink" && (
        <Controller
          name="form_data.food.estimated_cost"
          control={control}
          rules={{
            required: "Estimated cost is required",
            min: { value: 0, message: "Cost cannot be negative" },
          }}
          render={({ field, fieldState }) => (
            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Estimated Food Cost (under $500)</FieldLabel>
              <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 8 }}>
                Note: You must submit a separate purchase request through DragonLink
              </Text>
              <InputNumber
                {...field}
                min={0}
                step={1}
                style={{ display: "block", width: "100%" }}
                formatter={(value) =>
                  value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) =>
                  value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
                }
                status={fieldState.error ? "error" : ""}
              />
              {fieldState.error && (
                <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
              )}
            </div>
          )}
        />
      )}

      {/* F2b — Chestnut Street Catering Cost */}
      {foodType === "over_500_chestnut" && (
        <Controller
          name="form_data.food.estimated_cost"
          control={control}
          rules={{
            required: "Estimated Chestnut Street catering cost is required",
            min: { value: 0, message: "Cost cannot be negative" },
          }}
          render={({ field, fieldState }) => (
            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Estimated cost of Chestnut Street Catering</FieldLabel>
              <InputNumber
                {...field}
                min={0}
                step={1}
                style={{ display: "block", marginTop: 8, width: "100%" }}
                formatter={(value) =>
                  value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) =>
                  value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
                }
                status={fieldState.error ? "error" : ""}
              />
              {fieldState.error && (
                <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
              )}
            </div>
          )}
        />
      )}

      {/* F2c — Exception or Off-Campus Cost + Vendor */}
      {(foodType === "over_500_exception" || foodType === "offcampus_restaurant") && (
        <>
          <Controller
            name="form_data.food.vendor"
            control={control}
            rules={{ required: "Vendor or restaurant name is required" }}
            render={({ field, fieldState }) => (
              <div style={{ marginBottom: 16 }}>
                <FieldLabel required>What is the name of the vendor or restaurant?</FieldLabel>
                <Input
                  {...field}
                  placeholder="Enter vendor name"
                  style={{ marginTop: 8 }}
                  status={fieldState.error ? "error" : ""}
                />
                {fieldState.error && (
                  <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                )}
              </div>
            )}
          />

          <Controller
            name="form_data.food.estimated_cost"
            control={control}
            rules={{
              required: "Estimated cost is required",
              min: { value: 0, message: "Cost cannot be negative" },
            }}
            render={({ field, fieldState }) => (
              <div style={{ marginBottom: 16 }}>
                <FieldLabel required>What is the estimated food cost?</FieldLabel>
                <InputNumber
                  {...field}
                  min={0}
                  step={1}
                  style={{ display: "block", marginTop: 8, width: "100%" }}
                  formatter={(value) =>
                    value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
                  }
                  status={fieldState.error ? "error" : ""}
                />
                {fieldState.error && (
                  <Text type="danger" style={{ display: "block", marginTop: 4, color: "var(--red-6)" }}>{fieldState.error.message}</Text>
                )}
              </div>
            )}
          />
        </>
      )}
    </div>
  );
}

