import { DateUtils } from '../utils/DateUtils.js';
export class ModalUI {
    constructor(onSubmit, onDelete, onUpdate) {
        // 1. Referencias al DOM (Defensivo)
        this.overlay = document.getElementById('modal-root');
        this.form = document.getElementById('appointment-form');
        this.warningText = document.getElementById('modal-warning');
        
        // Botones
        this.btnMain = document.getElementById('btn-registrar');
        this.btnSecondary = document.getElementById('btn-cancelar');
        this.btnCloseX = document.getElementById('btn-close-x');

        // 2. Callbacks (Inyección de dependencias - SOLID)
        this.onSubmit = onSubmit;
        this.onDelete = onDelete;
        this.onUpdate = onUpdate;

        // 3. Estado Interno
        this.currentId = null; 

        this.initEvents();
    }

    /**
     * MODO CREAR: Se activa al seleccionar un rango en el calendario.
     */
    open(selectionInfo) {
        this.currentId = null;
        if (this.form) this.form.reset();
        this._clearErrors();
        this._fillDateFields(selectionInfo.start, selectionInfo.end);
        
        // UI en modo Registro
        if (this.btnMain) this.btnMain.innerText = "Registrar";
        if (this.btnSecondary) {
            this.btnSecondary.innerText = "Cancelar";
            this.btnSecondary.classList.remove('btn-danger');
        }
        if (this.warningText) this.warningText.classList.remove('hidden');

        this.overlay.classList.remove('hidden');
    }

    /**
     * MODO EDITAR: Se activa al hacer clic en una cita existente.
     */
    openEdit(event) {
        this.currentId = event.id;
        this._clearErrors();
        // Poblar campos de texto
        document.getElementById('patient-name').value = event.title;
        // Acceso correcto a propiedades extendidas
        document.getElementById('patient-phone').value = event.extendedProps?.phone || "";
        document.getElementById('notes').value = event.extendedProps?.notes || "";

        this._fillDateFields(event.start, event.end);

        // UI en modo Modificación (Psicología: Colores suaves pero claros)
        if (this.btnMain) this.btnMain.innerText = "Modificar";
        if (this.btnSecondary) {
            this.btnSecondary.innerText = "Cancelar Cita";
            this.btnSecondary.classList.add('btn-danger');
        }
        if (this.warningText) this.warningText.classList.add('hidden');

        this.overlay.classList.remove('hidden');
    }

    /**
     * Llenar campos de fecha y hora (DRY - Don't Repeat Yourself)
     */
    _fillDateFields(start, end) {
        document.getElementById('display-day').value = start.getDate();
        
        const nombreMes = start.toLocaleString('es-ES', { month: 'long' });
        document.getElementById('display-month').value = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        document.getElementById('start-time').value = start.toLocaleTimeString('en-US', options);
        document.getElementById('end-time').value = end.toLocaleTimeString('en-US', options);
    }

    initEvents() {
        // Uso de Arrow Functions para no perder el 'this'
        const nameInput = document.getElementById('patient-name');
        const phoneInput = document.getElementById('patient-phone');

        // HCI: Feedback en tiempo real. Al escribir, quitamos el error.
        [nameInput, phoneInput].forEach(input => {
            if (input) {
                input.oninput = () => {
                    input.classList.remove('error-input');
                    // Si tienes un texto de advertencia general, también puedes ocultarlo aquí
                    if (this.warningText) this.warningText.classList.add('hidden');
                };
            }
        });
        if (this.btnCloseX) this.btnCloseX.onclick = () => this.close();

        if (this.btnSecondary) {
            this.btnSecondary.onclick = () => {
                if (this.currentId) {
                    // Acción destructiva: requiere confirmación (HCI)
                    if (confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
                        this.onDelete(this.currentId);
                    }
                } else {
                    this.close();
                }
            };
        }

        if (this.form) {
            this.form.onsubmit = (e) => {
                e.preventDefault();
                this._handleFormSubmit();
            };
        }
    }
    _clearErrors() {
    const inputs = [
        document.getElementById('patient-name'),
        document.getElementById('patient-phone'),
        document.getElementById('start-time'),
        document.getElementById('end-time'),
        document.getElementById('display-day')
    ];

    inputs.forEach(input => {
        if (input) {
            input.classList.remove('error-input'); // Quitamos la clase del borde rojo
            input.classList.remove('shake');       // Quitamos la animación
        }
    });
    }
    _handleFormSubmit() {
        this._clearErrors(); // HCI: Empezamos con el formulario "limpio"

        const nameInput = document.getElementById('patient-name');
        const phoneInput = document.getElementById('patient-phone');
        const nameValue = nameInput.value.trim();
        const phoneValue = phoneInput.value.trim();

        // 1. Validaciones Básicas de Identidad
        if (!nameValue || !phoneValue) {
            this._triggerErrorEffect("Nombre y teléfono son obligatorios.");
            if (!nameValue) nameInput.classList.add('error-input');
            if (!phoneValue) phoneInput.classList.add('error-input');
            return;
        }

        try {
            const day = document.getElementById('display-day').value;
            const month = document.getElementById('display-month').value;
            const startStr = document.getElementById('start-time').value;
            const endStr = document.getElementById('end-time').value;

            // Parsing ultra-robusto
            const startISO = this._parseToISO(day, month, startStr);
            const endISO = this._parseToISO(day, month, endStr);
            
            const startDate = new Date(startISO);
            const endDate = new Date(endISO);
            const ahora = new Date();
            ahora.setMinutes(ahora.getMinutes() - 5); 
            
            if (startDate < ahora) {
                this._triggerErrorEffect("No puedes programar citas en días o horas pasadas.");
                return;
            }
            // 2. Validaciones Lógicas de Tiempo
            if (endDate <= startDate) {
                this._triggerErrorEffect("La hora de inicio debe ser menor a la final.");
                return;
            }

            const diffMin = (endDate - startDate) / (1000 * 60);
            if (diffMin < 30) {
                this._triggerErrorEffect(`Cita muy corta (${diffMin} min). Mínimo 30 min.`);
                return;
            }

            const formData = {
                patient_name: nameValue,
                patient_phone: phoneValue,
                start_time: startISO,
                end_time: endISO,
                notes: document.getElementById('notes')?.value || ""
            };

            this.currentId ? this.onUpdate(this.currentId, formData) : this.onSubmit(formData);

        } catch (e) {
            // Este es el error de tu captura image_6ec383.png
            const errorMsg = e.message === "Fecha inexistente" 
            ? "La fecha ingresada no existe (ej. 32 de marzo)." 
            : "Formato de hora inválido (Ej: 08:00 AM)";
        
            this._triggerErrorEffect(errorMsg);
    
        }
    }

    _parseToISO(day, monthName, timeStr) {
        const months = {
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
            'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
        };
        const year = new Date().getFullYear();
        const month = months[monthName] ?? 0;
        const dayInt = parseInt(day, 10);
        
        const timeMatch = timeStr.toUpperCase().match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
        if (!timeMatch) throw new Error("Formato de hora inválido");

        let [_, hours, minutes, modifier] = timeMatch;
        hours = parseInt(hours, 10);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const date = new Date(year, month, dayInt, hours, parseInt(minutes));

        // --- VALIDACIÓN DE DÍA INEXISTENTE ---
        // Si ingresas 32 de Marzo, date.getDate() devolverá 1 (1 de Abril).
        // Si el día o el mes no coinciden con lo ingresado, la fecha no existe.
        if (date.getDate() !== dayInt || date.getMonth() !== month) {
            throw new Error("Fecha inexistente");
        }

        return date.toISOString();
    }

    _triggerErrorEffect(message) {
        if (this.form) {
            this.form.classList.add('shake');
            alert(message);
            setTimeout(() => this.form.classList.remove('shake'), 400);
        }
    }

    close() {
        if (this.overlay) this.overlay.classList.add('hidden');
        this.currentId = null;
    }
    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        
        // HCI: Selección de icono semántico
        let icon = '';
        if (type === 'success') {
            icon = '✅'; // Checkmark para éxito
        } else if (type === 'error') {
            icon = '🗑️'; // Papelera para eliminación (o ❌ para error genérico)
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Inyectamos el icono y el mensaje
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Aumentamos ligeramente el tiempo a 3.5s para que dé tiempo a leerlo bien
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    }

_createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}
}