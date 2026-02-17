import { Controller, useWatch } from "react-hook-form";
import { Radio, Input, Typography, InputNumber } from "antd";

const { Text } = Typography;

type Props = {
  control: any;
};

const foodOptions = [
  { label: "Potluck (no purchases)", value: "potluck" },
  { label: "Purchased snacks (under $500)", value: "snacks_under_500" },
  { label: "Chestnut Street Catering", value: "chestnut_catering" },
  { label: "Off-campus restaurant / external caterer", value: "external_caterer" },
];

export default function FoodSection({ control }: Props) {
  const foodType = useWatch({
    control,
    name: "form_data.food.type",
  });

  const showCost = foodType && foodType !== "potluck";
  const showVendor =
    foodType === "chestnut_catering" || foodType === "external_caterer";

  return (
    <div style={{ marginTop: 24 }}>
      {/* F1 — Food Type */}
      <Controller
        name="form_data.food.type"
        control={control}
        rules={{ required: "Please select how food will be provided" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 16 }}>
            <Text>How will food be provided?</Text>
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
              <Text type="danger">{fieldState.error.message}</Text>
            )}
          </div>
        )}
      />

      {/* F2 — Estimated Cost */}
      {showCost && (
        <Controller
          name="form_data.food.estimated_cost"
          control={control}
          rules={{
            required: "Enter estimated food cost",
            min: { value: 0, message: "Cost cannot be negative" },
          }}
          render={({ field, fieldState }) => (
            <div style={{ marginBottom: 16 }}>
              <Text>Estimated total cost of food</Text>
              <InputNumber
                {...field}
                min={0}
                step={1}
                style={{ display: "block", marginTop: 8 }}
                formatter={(value) =>
                  value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) =>
                  value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
                }
              />
              {fieldState.error && (
                <Text type="danger">{fieldState.error.message}</Text>
              )}
            </div>
          )}
        />
      )}

      {/* F3 — Vendor Name */}
      {showVendor && (
        <Controller
          name="form_data.food.vendor"
          control={control}
          rules={{ required: "Vendor name is required" }}
          render={({ field, fieldState }) => (
            <div style={{ marginBottom: 16 }}>
              <Text>Food vendor name</Text>
              <Input
                {...field}
                placeholder="Enter vendor name"
                style={{ marginTop: 8 }}
              />
              {fieldState.error && (
                <Text type="danger">{fieldState.error.message}</Text>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}
