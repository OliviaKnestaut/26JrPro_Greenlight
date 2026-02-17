import { Controller } from "react-hook-form";
import { Input, InputNumber, Typography } from "antd";

const { Text } = Typography;

type Props = {
    control: any;
};

export default function RafflesSection({ control }: Props) {
    return (
        <div style={{ marginTop: 24 }}>

            {/* R1 — Describe Raffle or Prizes */}
            <Controller
                name="form_data.raffles.description"
                control={control}
                rules={{
                    required: "Please describe the raffle or prizes",
                }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Describe raffle or prizes</Text>
                        <Input.TextArea
                            {...field}
                            rows={4}
                            placeholder="Provide details about raffle or prizes"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* R2 — Total Value of Prizes */}
            <Controller
                name="form_data.raffles.total_value"
                control={control}
                rules={{
                    required: "Total prize value is required",
                    min: { value: 0, message: "Value cannot be negative" },
                }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Total value of prizes</Text>
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
