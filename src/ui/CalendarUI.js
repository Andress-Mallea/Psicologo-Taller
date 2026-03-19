import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // Idioma español

export class CalendarUI {
  constructor(containerId, { onSelectRange,onEventClick, onDateChange }) {
        this.containerEl = document.getElementById(containerId);
        this.onEventClick = onEventClick; // <--- Cable 1
        this.onSelectRange = onSelectRange;
        this.onDateChange = onDateChange; // Callback para actualizar el título del mes
        this.calendar = null;
    }

  init(initialEvents) {
    this.calendar = new Calendar(this.containerEl, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        locale: esLocale,
        selectable: true,
        allDaySlot: false,
        headerToolbar: false,
        events: initialEvents,

        // --- RESTRICCIÓN DE HORARIO (7 AM - 10 PM) ---
        slotMinTime: '07:00:00', // El calendario empieza a las 7 AM
        slotMaxTime: '22:00:00', // El calendario termina a las 10 PM
        // ---------------------------------------------

        datesSet: (info) => {
            const title = info.view.title;
            this.onDateChange(title);
        },
        eventClick: (info) => {
            if (typeof this.onEventClick === 'function') {
                this.onEventClick(info.event);
            }
        },
        select: (info) => {
            if (info.view.type === 'timeGridWeek') {
                this.onSelectRange(info);
            }
        },
    });

    this.calendar.render();
}
    next() { this.calendar.next(); }
    prev() { this.calendar.prev(); }
    today() { this.calendar.today();}
    changeView(viewName) {
        this.calendar.changeView(viewName);
    }
    addEventToUI(event) {
        if (this.calendar) {
            this.calendar.addEvent(event);
        }
    }
}