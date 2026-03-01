import { Controller, useWatch } from "react-hook-form";
import { Radio, Input, Typography, InputNumber } from "antd";
import FieldLabel from "../../../components/FieldLabel";
import { useEffect, useMemo, useRef } from "react";

const { Text } = Typography;

type Props = {
  control: any;
  setValue: any;
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

export default function FoodSection({ control, setValue }: Props) {
  const foodType = useWatch({
    control,
    name: "form_data.food.type",
  });

  const isUnder500 = foodType === "under_500_dragonlink";
  const isOver500 =
    foodType === "over_500_chestnut" ||
    foodType === "over_500_exception" ||
    foodType === "offcampus_restaurant";

  const showVendor =
    foodType === "over_500_exception" ||
    foodType === "offcampus_restaurant";

  const minCost = isOver500 ? 500 : 0;
  const maxCost = isUnder500 ? 500 : isOver500 ? 5000 : undefined;

  // Clear estimated_cost only when the user actively changes the food type.
  // Uses value comparison (not a boolean flag) so React StrictMode's double-
  // invocation of effects doesn't wipe a pre-populated cost on initial mount.
  const prevFoodTypeRef = useRef(foodType);
  useEffect(() => {
    if (prevFoodTypeRef.current !== foodType) {
      setValue("form_data.food.estimated_cost", undefined);
    }
    prevFoodTypeRef.current = foodType;
  }, [foodType, setValue]);

  // Centralized validation
  const validateCost = useMemo(
    () => (value: any) => {
      if (value == null) return "Estimated cost is required";

      const numeric = Number(value);

      if (isNaN(numeric)) return "Enter a valid number";
      if (numeric < 0) return "Cost cannot be negative";

      if (isUnder500 && numeric > 500) {
        return "Cost cannot exceed $500";
      }

      if (isOver500) {
        if (numeric < 500) {
          return "Cost must be at least $500";
        }
        if (numeric > 5000) {
          return "Cost cannot exceed $5,000";
        }
      }

      return true;
    },
    [isUnder500, isOver500]
  );

  const costRules = {
    // validateCost already returns the "required" message when value is null/undefined,
    // so we don't add a separate `required` rule that could fire at different times.
    validate: validateCost,
  };

  const renderCostInput = (label: string, note?: string) => (
    <Controller
      name="form_data.food.estimated_cost"
      control={control}
      rules={costRules}
      render={({ field, fieldState }) => (
        <div style={{ marginBottom: 16 }}>
          <FieldLabel required>{label}</FieldLabel>

          {note && (
            <Text
              type="secondary"
              style={{ display: "block", marginTop: 4, marginBottom: 8 }}
            >
              {note}
            </Text>
          )}

          <InputNumber
            {...field}
            step={1}
            style={{ display: "block", marginTop: 8, width: "100%" }}
            formatter={(value) =>
              value
                ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : ""
            }
            parser={(value) =>
              value
                ? Number(value.replace(/\$\s?|(,*)/g, ""))
                : undefined
            }
            status={fieldState.error ? "error" : ""}
            onChange={(value) => field.onChange(value)} // explicit pass-through
          />

          {fieldState.error && (
            <Text type="danger" style={{ display: "block", marginTop: 4 }}>
              {fieldState.error.message}
            </Text>
          )}
        </div>
      )}
    />
  );
  return (
    <div>
      {/* Food Type */}
      <Controller
        name="form_data.food.type"
        control={control}
        rules={{ required: "Please select a food option" }}
        render={({ field, fieldState }) => (
          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>
              How will you provide food for this event?
            </FieldLabel>

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
              <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                {fieldState.error.message}
              </Text>
            )}
          </div>
        )}
      />

      {/* Under $500 */}
      {isUnder500 &&
        renderCostInput(
          "Estimated Food Cost (under $500)",
          "Note: You must submit a separate purchase request through DragonLink"
        )}

      {/* Over $500 - Chestnut */}
      {foodType === "over_500_chestnut" &&
        renderCostInput("Estimated cost of Chestnut Street Catering")}

      {/* Exception / Off-campus */}
      {isOver500 && showVendor && (
        <>
          <Controller
            name="form_data.food.vendor"
            control={control}
            rules={{ required: "Vendor or restaurant name is required" }}
            render={({ field, fieldState }) => (
              <div style={{ marginBottom: 16 }}>
                <FieldLabel required>
                  What is the name of the vendor or restaurant?
                </FieldLabel>

                <Input
                  {...field}
                  placeholder="Enter vendor name"
                  style={{ marginTop: 8 }}
                  status={fieldState.error ? "error" : ""}
                />

                {fieldState.error && (
                  <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                    {fieldState.error.message}
                  </Text>
                )}
              </div>
            )}
          />

          {renderCostInput("What is the estimated food cost?")}
        </>
      )}
    </div>
  );
}