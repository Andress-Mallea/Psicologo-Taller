export class Appointment {
    constructor({ id, patient_name, patient_phone, start_time, end_time, notes }) {
        this.id = id;
        this.title = patient_name; 
        this.start = start_time;
        this.end = end_time;
        this.extendedProps = {
            phone: patient_phone,
            notes: notes
        };
    }
    calculateEndTime(startTime, durationMinutes) {
        const start = new Date(startTime);
        return new Date(start.getTime() + durationMinutes * 60000).toISOString();
    }
    isValid() {
        return (
            this.patient_name && this.patient_name.trim().length > 0 &&
            this.patient_phone && this.patient_phone.trim().length > 0
        );
        
    }
}