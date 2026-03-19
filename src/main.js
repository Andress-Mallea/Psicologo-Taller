import { CalendarUI } from './ui/CalendarUI.js';
import { AppointmentService } from './services/AppointmentService.js';
import { ModalUI } from './ui/ModalUI.js';
// 1. Inicializar componentes
function checkOverlap(start, end, excludeId = null) {
    const allEvents = calendarUI.calendar.getEvents();
    
    return allEvents.some(event => {
        // No nos comparamos con la cita que estamos editando
        if (event.id === excludeId) return false;

        const eStart = event.start.getTime();
        const eEnd = event.end.getTime();
        const nStart = new Date(start).getTime();
        const nEnd = new Date(end).getTime();

        // Lógica de solapamiento: (Inicio1 < Fin2) Y (Fin1 > Inicio2)
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
            // 1. Llamada al servicio para eliminar el registro en Supabase
            await AppointmentService.delete(id);

            // 2. Eliminar el evento visualmente del calendario sin recargar la página
            // Esto mejora la experiencia de usuario (UX) al ser instantáneo
            const event = calendarUI.calendar.getEventById(id);
            if (event) {
                event.remove();
                modalUI.showToast("Cita eliminada correctamente", "error");
            }

            // 3. Cerrar el modal tras la operación exitosa
            modalUI.close();
            
        } catch (error) {
            console.error("Error al eliminar la cita:", error);
            modalUI.showToast("No se pudo eliminar", "error");
        }
    },
    async (id, formData) => {
        // 1. Verificamos si el nuevo horario choca con OTRA cita (excluyendo la actual)
        if (checkOverlap(formData.start_time, formData.end_time, id)) {
            alert("Hay otra cita en ese horario"); // HCI: Feedback de error preventivo
            return;
        }

        try {
            await AppointmentService.update(id, formData);
            
            // 2. Actualizamos el calendario visualmente sin recargar
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

// Inicializamos el Calendario pasando la función de rango
const calendarUI = new CalendarUI('calendar-root', {

    onSelectRange: (info) => {
        // --- NUEVA VALIDACIÓN PREVENTIVA (HCI) ---
        const ahora = new Date();
        // Margen de 5 minutos de cortesía
        ahora.setMinutes(ahora.getMinutes() - 5); 

        if (info.start < ahora) {
            // Feedback inmediato al usuario
            alert("No puedes seleccionar un horario que ya pasó para crear una cita.");
            
            // Opcional: Deseleccionar el rango visualmente
            calendarUI.calendar.unselect();
            return; // Bloqueamos la apertura del modal
        }
        
        // Si la fecha es válida, abrimos el modal
        modalUI.open(info);
    },
    onEventClick: (event) => {
        // Llamamos al método que creamos para editar
        modalUI.openEdit(event);
    },
    onDateChange: (title) => {
        // Actualiza el <h2> del header con el mes actual
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
// 2. Cargar datos iniciales de Supabase
async function startApp() {
    try {
        const events = await AppointmentService.getAll();
        calendarUI.init(events);
    } catch (error) {
        console.error("No se pudo iniciar la agenda", error);
    }
}

startApp();