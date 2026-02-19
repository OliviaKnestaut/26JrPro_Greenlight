import { Controller } from "react-hook-form";
import { Input, InputNumber, Typography } from "antd";

const { Text } = Typography;

type Props = {
    control: any;
};

export default function RafflesSection({ control }: Props) {
    return (
        <div style={{ marginTop: 24 }}>

            {/* R1 — What are you planning on giving away */}
            <Controller
                name="form_data.raffles.items_and_purchase_plan"
                control={control}
                rules={{
                    required: "Please describe what you're giving away and how you plan on purchasing these items",
                }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>What are you planning on giving away? Please outline all and how you plan on purchasing these items.</Text>
                        <Input.TextArea
                            {...field}
                            rows={4}
                            placeholder="Describe the items and your purchase plan"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* R2 — How will the prizes be awarded */}
            <Controller
                name="form_data.raffles.award_method"
                control={control}
                rules={{
                    required: "Please describe how prizes will be awarded",
                }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>How will the prizes be awarded?</Text>
                        <Input.TextArea
                            {...field}
                            rows={3}
                            placeholder="Describe the awarding process"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* R3 — Estimated Cost */}
            <Controller
                name="form_data.raffles.estimated_cost"
                control={control}
                rules={{
                    required: "Estimated cost is required",
                    min: { value: 0, message: "Cost cannot be negative" },
                }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>What is the estimated cost of these items?</Text>
                        <InputNumber
                            {...field}
                            min={0}
                            precision={2}
                            style={{ display: "block", marginTop: 8 }}
                            prefix="$"
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

        </div>
    );
}
