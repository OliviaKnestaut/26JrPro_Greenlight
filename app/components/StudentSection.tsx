import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import { Form, Input } from "antd"

type Props = {
  control: any
}


export default function StudentSection({ control }: Props) {
  return (
    <>
      <h2>Student Information</h2>

      <Controller
        name="studentId"
        control={control}
        render={({ field }) => (
          <Form.Item label="Student ID">
            <Input {...field} />
          </Form.Item>
        )}
      />

      <Controller
        name="major"
        control={control}
        render={({ field }) => (
          <Form.Item label="Major">
            <Input {...field} />
          </Form.Item>
        )}
      />
    </>
  )
}
