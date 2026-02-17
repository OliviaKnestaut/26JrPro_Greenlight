import { Controller } from "react-hook-form";
import { Checkbox, Input, Radio, Typography } from "antd";

const { Text } = Typography;

type Props = {
    control: any;
};

export default function SORCGamesSection({ control }: Props) {
    return (
        <div style={{ marginTop: 24 }}>

            {/* SG1 — Multi-Select Games */}
            <Controller
                name="form_data.sorc_games.selected"
                control={control}
                rules={{
                    required: "Select at least one SORC game or inflatable",
                }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>
                            Which SORC games or inflatables will be used?
                        </Text>

                        <Checkbox.Group
                            {...field}
                            style={{ display: "block", marginTop: 8 }}
                        >
                            <div><Checkbox value="mechanical_bull">
                                <Text>Mechanical Bull</Text>
                                <div><Text type="secondary">Requires trained operator; higher cost</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="velcro_wall">
                                <Text>Velcro Wall</Text>
                                <div><Text type="secondary">Standard SORC game</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="human_hamster_balls">
                                <Text>Human Hamster Balls</Text>
                                <div><Text type="secondary">Outdoor only; requires flat surface</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="giant_slide">
                                <Text>Giant Slide</Text>
                                <div><Text type="secondary">Outdoor only; weather dependent</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="obstacle_course">
                                <Text>Obstacle Course</Text>
                                <div><Text type="secondary">Large footprint; outdoor only</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="dunk_tank">
                                <Text>Dunk Tank</Text>
                                <div><Text type="secondary">Requires water access</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="bungee_run">
                                <Text>Bungee Run</Text>
                                <div><Text type="secondary">Requires harness fitting</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="jousting_arena">
                                <Text>Jousting Arena</Text>
                                <div><Text type="secondary">Requires padding and supervision</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="giant_connect_four">
                                <Text>Giant Connect Four</Text>
                                <div><Text type="secondary">Low-risk game</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="giant_jenga">
                                <Text>Giant Jenga</Text>
                                <div><Text type="secondary">Low-risk game</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="carnival_game_booths">
                                <Text>Carnival Game Booths</Text>
                                <div><Text type="secondary">Multiple small games</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="casino_tables">
                                <Text>Casino Tables</Text>
                                <div><Text type="secondary">No cash payouts permitted</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="photo_booth">
                                <Text>Photo Booth</Text>
                                <div><Text type="secondary">Indoor or outdoor</Text></div>
                            </Checkbox></div>

                            <div style={{ marginTop: 8 }}><Checkbox value="inflatable_sports_games">
                                <Text>Inflatable Sports Games</Text>
                                <div><Text type="secondary">Outdoor preferred</Text></div>
                            </Checkbox></div>
                        </Checkbox.Group>

                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                {fieldState.error.message}
                            </Text>
                        )}
                    </div>
                )}
            />

            {/* SG2 — Location */}
            <Controller
                name="form_data.sorc_games.location"
                control={control}
                rules={{ required: "Setup location is required" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>Where will the SORC games be set up?</Text>
                        <Input
                            {...field}
                            placeholder="Enter setup location"
                            style={{ marginTop: 8 }}
                        />
                        {fieldState.error && (
                            <Text type="danger">{fieldState.error.message}</Text>
                        )}
                    </div>
                )}
            />

            {/* SG3 — Staff Present */}
            <Controller
                name="form_data.sorc_games.staff_present"
                control={control}
                rules={{ required: "Select yes or no" }}
                render={({ field, fieldState }) => (
                    <div style={{ marginBottom: 16 }}>
                        <Text>
                            Will SORC staff be present for setup and supervision?
                        </Text>

                        <Radio.Group
                            {...field}
                            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
                        >
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                        </Radio.Group>

                        {fieldState.error && (
                            <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                                {fieldState.error.message}
                            </Text>
                        )}
                    </div>
                )}
            />

        </div>
    );
}

