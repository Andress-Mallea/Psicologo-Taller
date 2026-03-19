export const DateUtils = {
    // Convierte el formato de FullCalendar al que acepta el input datetime-local
    formatToInput(dateString) {
        const date = new Date(dateString);
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date - tzOffset).toISOString().slice(0, 16);
    }
};