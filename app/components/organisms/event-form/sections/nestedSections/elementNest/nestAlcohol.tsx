import { Controller } from "react-hook-form";
import { Radio, Input, Typography, Checkbox } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

type Props = {
    control: any;
};

export default function AlcoholSection({ control }: Props) {
    return (
        <div style={{ marginTop: 24 }}>

            {/* A1 - Company providing alcohol */}
            <Controller
                name="form_data.alcohol.vendor"
                control={control}
                rules={{ required: "Company name is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Name of company providing alcohol</Text>
                        <Input
                            {...field}
                            placeholder="Enter approved vendor name"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* A2 - Type of Event */}
            <Controller
                name="form_data.alcohol.event_type"
                control={control}
                rules={{ required: "Select event type" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Type of Event</Text>
                        <Radio.Group
                            {...field}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value="drexel_only">Drexel Students Only Event - No guests; Members or Drexel students only</Radio>
                            <Radio value="date_party" style={{ marginTop: 4 }}>Date Party/Invitation Only Event - Invited guests only</Radio>
                            <Radio value="multiple_org" style={{ marginTop: 4 }}>Multiple Organization Event - Event hosted by more than one organization/club</Radio>
                            <Radio value="alumni" style={{ marginTop: 4 }}>Alumni Event - Event hosted in conjunction with or by alumni</Radio>
                        </Radio.Group>
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* A4 - Faculty/Staff Present */}
            <div style={{ marginBottom: 16 }}>
                <Text>Full-time faculty or staff member who will be present for the duration of your event</Text>

                <Controller
                    name="form_data.alcohol.faculty_staff.name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginTop: 8 }}>
                            <Input {...field} placeholder="Full Name" />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="form_data.alcohol.faculty_staff.title"
                    control={control}
                    rules={{ required: "Title is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginTop: 8 }}>
                            <Input {...field} placeholder="Title" />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="form_data.alcohol.faculty_staff.email"
                    control={control}
                    rules={{
                        required: "Email is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                            message: "Enter a valid email address",
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginTop: 8 }}>
                            <Input {...field} placeholder="Email Address" />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="form_data.alcohol.faculty_staff.phone"
                    control={control}
                    rules={{ required: "Phone number is required" }}
                    render={({ field, fieldState }) => (
                        <div style={{ marginTop: 8 }}>
                            <Input {...field} placeholder="Phone Number" />
                            {fieldState.error && (
                                <Text type="danger">{fieldState.error.message}</Text>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* A5 - Guests under 21 */}
            <Controller
                name="form_data.alcohol.guests_under_21"
                control={control}
                rules={{ required: "Select Yes or No" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Will any guests be under 21 years of age?</Text>
                        <Radio.Group
                            {...field}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                        </Radio.Group>
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* A6 - ID Checking Procedures */}
            <Controller
                name="form_data.alcohol.id_procedure"
                control={control}
                rules={{ required: "Describe ID checking procedures" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>What procedure will be in place to ensure compliance with University policies and state law, particularly carding procedure? (be descriptive)</Text>
                        <TextArea
                            {...field}
                            rows={4}
                            placeholder="Describe ID verification and compliance procedures"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* A7 - Food Description */}
            <Controller
                name="form_data.alcohol.food_description"
                control={control}
                rules={{ required: "Describe the food that will be served" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Describe the type of food that will be served/available at event</Text>
                        <TextArea
                            {...field}
                            rows={3}
                            placeholder="e.g., shrimp cocktail, chicken wings, sliders, etc."
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* A8 - Events with Alcohol Checklist */}
            <div style={{ marginBottom: 16 }}>
                <Text strong>Events with Alcohol Agreement</Text>
                <div style={{ marginTop: 8, marginBottom: 12 }}>
                    <Text>
                        By checking these boxes, I agree that my event will adhere to these policies and understand I may be subject to disciplinary action if not.
                    </Text>
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: 8, gap: 8 }}>
                    <Controller
                        name="form_data.alcohol.checklist.id_check"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    A procedure has been defined to check IDs for those of legal drinking age.
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.alcohol.checklist.approved_vendor"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    An approved vendor will provide bar-tending services for this event.
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.alcohol.checklist.hard_liquor_charge"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    3rd Party vendors serving hard liquor must not charge to Drexel; these drinks must be charged to the individual requesting those drinks.
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.alcohol.checklist.no_drinking_games"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    Drinking games will not be permitted. This includes but is not limited to, beer pong, flip cup, etc.
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.alcohol.checklist.no_liquor_university_funds"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    University funds, GSA funds, if allowed, may be used for beer and wine; no liquor is allowed to be paid for by GSA or the University.
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.alcohol.checklist.food_available"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    Food items must be available throughout the event
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.alcohol.checklist.non_salty_options"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    There must be non-salty options available
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.alcohol.checklist.heavy_appetizers"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    Food must be, at minimum, heavy appetizers. For instance, shrimp cocktail, chicken wings, sliders.
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="form_data.alcohol.checklist.cutoff_time"
                        control={control}
                        rules={{ 
                            required: "You must check this box to proceed",
                            validate: (value) => value === true || "You must agree to this policy"
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <Checkbox {...field} checked={field.value}>
                                    No alcoholic beverages shall be served within a half-hour of the termination of the event or after 1:30am, whichever is earlier. A formal cut-off announcement will be made to that effect.
                                </Checkbox>
                                {fieldState.error && (
                                    <div><Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text></div>
                                )}
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* A9 - Signature and Agreement */}
            <Controller
                name="form_data.alcohol.signature_name"
                control={control}
                rules={{ required: "Your full name is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Signature</Text>
                        <div style={{ marginTop: 4, marginBottom: 8 }}>
                            <Text type="secondary">
                                By entering your name below, you are electronically signing this agreement and confirming all information is accurate.
                            </Text>
                        </div>
                        <Input
                            {...field}
                            placeholder="Enter your full name"
                            style={{ marginTop: 8 }}
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
