import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import { Form, Input } from "antd"

type Props = {
  control: any
}




export default function StaffSection({ control }: Props) {
  return (
    <>
      <h2>Staff Information</h2>

      <Controller
        name="department"
        control={control}
        render={({ field }) => (
          <Form.Item label="Department">
            <Input {...field} />
          </Form.Item>
        )}
      />

      <Controller
        name="office"
        control={control}
        render={({ field }) => (
          <Form.Item label="Office Location">
            <Input {...field} />
          </Form.Item>
        )}
      />
    </>
  )
}
