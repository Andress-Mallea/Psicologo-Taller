import { CalendarUI } from './ui/CalendarUI.js';
import { AppointmentService } from './services/AppointmentService.js';
import { ModalUI } from './ui/ModalUI.js';

function checkOverlap(start, end, excludeId = null) {
    const allEvents = calendarUI.calendar.getEvents();
    return allEvents.some(event => {
        if (event.id === excludeId) return false;
        const eStart = event.start.getTime();
        const eEnd = event.end.getTime();
        const nStart = new Date(start).getTime();
        const nEnd = new Date(end).getTime();
        return (nStart < eEnd && nEnd > eStart);
    });
}
const modalUI = new ModalUI(
    async (formData) => {
        if (checkOverlap(formData.start_time, formData.end_time)) {
            alert("No puedes agendar esta cita: el psicólogo ya tiene otra sesión en ese horario.");
            return;
        }
        try {
            const saved = await AppointmentService.create(formData);
            
            if (saved && saved.id) {
            calendarUI.addEventToUI({
                id: saved.id,
                title: saved.patient_name,
                start: saved.start_time,
                end: saved.end_time
            });
            modalUI.close();
            modalUI.showToast("¡Cita registrada con éxito!");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            modalUI.showToast("Error al guardar la cita", "error");
        }
    },
    async (id) => {try {
            await AppointmentService.delete(id);
            const event = calendarUI.calendar.getEventById(id);
            if (event) {
                event.remove();
                modalUI.showToast("Cita eliminada correctamente", "error");
            }
            modalUI.close();
        } catch (error) {
            console.error("Error al eliminar la cita:", error);
            modalUI.showToast("No se pudo eliminar", "error");
        }
    },
    async (id, formData) => {
        if (checkOverlap(formData.start_time, formData.end_time, id)) {
            alert("Hay otra cita en ese horario");
            return;
        }

        try {
            await AppointmentService.update(id, formData);
            const event = calendarUI.calendar.getEventById(id);
            if (event) {
                event.setProp('title', formData.patient_name);
                event.setStart(formData.start_time);
                event.setEnd(formData.end_time);
                event.setExtendedProp('phone', formData.patient_phone);
                event.setExtendedProp('notes', formData.notes);
            }
            modalUI.close();
            modalUI.showToast("Cita actualizada correctamente");
        } catch (error) {
            console.error(error);
            modalUI.showToast("Error al actualizar", "error");
        }
    }
);
const calendarUI = new CalendarUI('calendar-root', {
    onSelectRange: (info) => {
        const ahora = new Date();
        ahora.setMinutes(ahora.getMinutes() - 5); 

        if (info.start < ahora) {
            alert("No puedes seleccionar un horario que ya pasó para crear una cita.");
            calendarUI.calendar.unselect();
            return; 
        }
        modalUI.open(info);
    },
    onEventClick: (event) => {
        modalUI.openEdit(event);
    },
    onDateChange: (title) => {
       
        const display = document.getElementById('current-month-display');
        if (display) {
        
        const formattedTitle = title.replace(/[a-zñáéíóú]+/gi, (word) => {
            const lowerWord = word.toLowerCase();
            if (lowerWord === 'de' || lowerWord === 'del') return lowerWord;
            return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        });
        
        display.innerText = formattedTitle;
        }
    }
});
document.getElementById('btn-prev').onclick = () => calendarUI.prev();
document.getElementById('btn-next').onclick = () => calendarUI.next();
document.getElementById('btn-today').onclick = () => calendarUI.today();
document.getElementById('btn-view-week').onclick = (e) => {
    calendarUI.changeView('timeGridWeek');
    updateActiveBtn(e.target);
};

document.getElementById('btn-view-month').onclick = (e) => {
    calendarUI.changeView('dayGridMonth');
    updateActiveBtn(e.target);
};

function updateActiveBtn(target) {
    document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
}

async function startApp() {
    try {
        const events = await AppointmentService.getAll();
        calendarUI.init(events);
    } catch (error) {
        console.error("No se pudo iniciar la agenda", error);
    }
}

startApp();