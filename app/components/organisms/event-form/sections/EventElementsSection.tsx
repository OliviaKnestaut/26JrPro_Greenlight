import { Controller, useWatch } from "react-hook-form"
import { Checkbox, Form, Radio } from "antd"

type Props = {
    control: any
}


export default function EventElementsSection({ control }: Props) {
    const eventElements = useWatch({
        control,
        name: "eventElements",
    })


    return (
        <>
            <Controller
                name="eventElements"
                control={control}
                render={({ field }) => (
                    <Form.Item label="What elements will your event include?">
                        <Checkbox.Group {...field}>
                            <Checkbox value="Food">Food</Checkbox>
                            <Checkbox value="Movies + TV">Movies + TV</Checkbox>
                            <Checkbox value="Raffles + Gaming">Raffles + Gaming</Checkbox>
                        </Checkbox.Group>
                    </Form.Item>
                )}
            />
            
            {/* 
      {eventElements?.includes("Food") && (
        <Controller
          name="foodDetails"
          control={control}
          render={({ field }) => (
            <Form.Item label="Please provide details about the food you plan to serve:">
              <Input.TextArea {...field} rows={4} />
            </Form.Item>
          )}
        />
      )} */}

        </>
    )
}
