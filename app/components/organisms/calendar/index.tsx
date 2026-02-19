import { Typography } from "antd";
const { Title, Paragraph, Link } = Typography;
import { useNavigate } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card } from "antd";
import StyledCalendar from '../../molecules/calendar';
import CardCalendarUpcoming from "../../molecules/card/card-calendar-upcoming";
import { WeeklyCalendar } from "~/vendor/calendar/WeeklyCalendar";





export function CalendarContent() {
    const navigate = useNavigate();

    const events = [
        {
            eventId: 'evt-1',
            startTime: new Date(2021, 3, 21, 12, 0, 0),
            endTime: new Date(2021, 3, 21, 14, 30, 0),
            title: 'Ap. 1',
            backgroundColor: 'red',
        },
        {
            eventId: 'evt-2',
            startTime: new Date(2021, 3, 25, 10, 0, 0),
            endTime: new Date(2021, 3, 25, 17, 15, 0),
            title: 'Ap. 2',
        },
    ];


    return (
        <div >
            <div className="container">
                <Title level={5}>
                    <Link onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back </Link>
                </Title>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: 0, gap: "0.5rem" }}>
                <Title level={2} style={{ margin: 0 }}>Calendar</Title>
                <Paragraph>View your upcoming org events.</Paragraph>
            </div>

            <div style={{ display: "flex", flexDirection: "row", gap: "2rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem", flex: "1" }}>
                    <Card style={{
                        background: "var(--background-2)",
                        border: "1px solid var(--accent-gray-light)",
                    }} >
                        <StyledCalendar />
                    </Card>

                    <Card>
                        <Title level={4} style={{color: "var(--color-brand-primary-active)"}} >Upcoming Events</Title>
                        <CardCalendarUpcoming/>
                    </Card>
                </div>
                <div style={{ flex: "2" }}>
                    <WeeklyCalendar
                        events={events}
                        weekends={true}
                        onEventClick={(event) => console.log(event)}
                        onSelectDate={(date) => console.log(date)}
                    />
                </div>
            </div>
        </div>
    );
}

export default CalendarContent;