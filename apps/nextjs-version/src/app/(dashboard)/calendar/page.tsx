import { Calendar } from "./components/calendar"
import { events, eventDates } from "./data"

export default function CalendarPage() {
  return (
    <div className="">
      <Calendar events={events} eventDates={eventDates} />
    </div>
  )
}
