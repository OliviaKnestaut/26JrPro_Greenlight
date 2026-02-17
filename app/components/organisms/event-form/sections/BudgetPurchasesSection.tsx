import { Controller, useFieldArray } from "react-hook-form";
import { Input, Button, Upload, Checkbox, Select, Typography, InputNumber } from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

type Props = {
    control: any;
};

export default function BudgetPurchasesSection({ control }: Props) {
    // Purchase Requests repeater
    const { fields: purchaseFields, append: appendPurchase, remove: removePurchase } = useFieldArray({
        control,
        name: "form_data.purchases",
    });

    // Contracts repeater
    const { fields: contractFields, append: appendContract, remove: removeContract } = useFieldArray({
        control,
        name: "form_data.contracts",
    });

    return (
        <div style={{ marginBottom: 24 }}>
            <Text>23. Purchase Requests</Text>
            {purchaseFields.map((field, index) => (
                <div key={field.id} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Controller
                        name={`form_data.purchases.${index}.item`}
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="Item name" />}
                    />
                    <Controller
                        name={`form_data.purchases.${index}.estimated_cost`}
                        control={control}
                        render={({ field }) => <InputNumber {...field} placeholder="Estimated cost" min={0} />}
                    />
                    <MinusCircleOutlined onClick={() => removePurchase(index)} style={{ marginTop: 4 }} />
                </div>
            ))}
            <Button type="dashed" onClick={() => appendPurchase({ item: "", estimated_cost: 0 })} icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                Add Purchase
            </Button>

            <Text style={{ display: "block", marginTop: 24 }}>24. Required Contracts</Text>
            {contractFields.map((field, index) => (
                <div key={field.id} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Controller
                        name={`form_data.contracts.${index}.vendor`}
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="Vendor Name" />}
                    />
                    <Controller
                        name={`form_data.contracts.${index}.amount`}
                        control={control}
                        render={({ field }) => <InputNumber {...field} placeholder="Amount" min={0} />}
                    />
                    <Controller
                        name={`form_data.contracts.${index}.preferred`}
                        control={control}
                        render={({ field }) => (
                            <Checkbox {...field} checked={field.value}>Preferred Vendor</Checkbox>
                        )}
                    />
                    <Controller
                        name={`form_data.contracts.${index}.file`}
                        control={control}
                        render={({ field }) => (
                            <Upload beforeUpload={() => false} maxCount={1} onChange={(info) => {
                                const file = info.fileList[0]?.originFileObj;
                                field.onChange(file);
                            }}>
                                <Button icon={<UploadOutlined />}>Upload</Button>
                            </Upload>
                        )}
                    />
                    <MinusCircleOutlined onClick={() => removeContract(index)} style={{ marginTop: 4 }} />
                </div>
            ))}
            <Button type="dashed" onClick={() => appendContract({ vendor: "", amount: 0, preferred: false, file: null })} icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                Add Contract
            </Button>

            <Text style={{ display: "block", marginTop: 24 }}>25. Additional Vendors?</Text>
            <Controller
                name="form_data.contracts.additional"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Additional vendor names" />}
            />

            <Text style={{ display: "block", marginTop: 24 }}>26. Funding Source</Text>
            <Controller
                name="form_data.budget.source"
                control={control}
                render={({ field }) => (
                    <Select {...field} placeholder="Select Funding Source" style={{ width: 240 }}>
                        <Option value="SAFAC">SAFAC</Option>
                        <Option value="Rollover">Rollover</Option>
                        <Option value="Department">Department</Option>
                        <Option value="FSL">FSL</Option>
                        <Option value="No Cost">No Cost</Option>
                    </Select>
                )}
            />

            <Text style={{ display: "block", marginTop: 24 }}>27. Account Number</Text>
            <Controller
                name="form_data.budget.account_number"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Enter Account Number" style={{ width: 240 }} />}
            />

            {/* <Text style={{ display: "block", marginTop: 24 }}>28. Cash Handling</Text>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
                <Controller
                    name="form_data.budget.cash_collection.enabled"
                    control={control}
                    render={({ field }) => <Checkbox {...field} checked={field.value}>Collect Cash?</Checkbox>}
                />
                <Controller
                    name="form_data.budget.cash_collection.estimated_amount"
                    control={control}
                    render={({ field }) => <InputNumber {...field} placeholder="Estimated Amount" min={0} />}
                />
            </div> */}
        </div>
    );
}
