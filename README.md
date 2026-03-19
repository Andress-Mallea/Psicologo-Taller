# Sistema de Gestión de Consultas Psicológicas

Este proyecto es una solución integral de software diseñada para optimizar la administración de citas en consultorios psicológicos, reemplazando la gestión ineficiente mediante mensajería directa (WhatsApp) por una interfaz de calendario profesional y robusta.

## 1. Descripción del Problema
Actualmente, el manejo de una consultoría mediante mensajes de WhatsApp genera sobresaturación y dificultades de organización. El psicólogo pierde tiempo valioso buscando entre chats para gestionar el estado de las citas y la disponibilidad de sus pacientes, lo que impide una planificación efectiva del tiempo.

## 2. Contexto y Objetivos
El sistema busca digitalizar la administración del consultorio para:
* **Centralizar la agenda**: Evitar el uso de registros físicos y chats dispersos.
* **Accesibilidad**: Permitir al personal administrativo y al psicólogo acceder a la información de forma rápida.
* **Seguridad y Confirmación**: Dar certeza al paciente sobre el estado de su cita.
* **Planificación**: Facilitar la organización semanal de fechas, duraciones y estados de cada sesión.

## 3. Alcance del Sistema
La plataforma permite gestionar el ciclo de vida de una cita médica (fecha, hora, lugar y estado) a través de:
* **Calendario Interactivo**: Visualización semanal y mensual de la agenda.
* **Formulario de Registro**: Captura de datos de pacientes con validaciones en tiempo real.
* **Gestión de Estados**: Control de citas Pendientes, Confirmadas o Canceladas.

## 4. Requerimientos

### Funcionales
* **Registro de Citas**: Selección de fecha y hora específica.
* **Gestión de Estados**: Indicadores visuales para citas confirmadas, pendientes o canceladas.
* **Liberación de Horarios**: Al cancelar una cita, el espacio debe quedar disponible automáticamente.
* **Reprogramación**: Capacidad de modificar fechas y horas de citas ya agendadas.

### No Funcionales / Restricciones
* **Validación de Disponibilidad**: El sistema impide el "choque de citas" en el mismo rango horario.
* **Usabilidad**: Curva de aprendizaje corta (máximo 1.5 meses) para el personal.
* **Interfaz Limpia**: Diseño basado en principios de HCI para reducir la fatiga visual del profesional.

## 5. Arquitectura y Patrones de Diseño
El proyecto sigue una estructura limpia y escalable basada en:
* **Patrón de Servicio**: Encapsulamiento de la lógica de base de datos con Supabase.
* **Inyección de Dependencias**: UI desacoplada de la lógica de negocio.
* **Modelo de Dominio**: Entidades con lógica de validación propia.
* **Fachada (Wrapper)**: Simplificación de la librería FullCalendar.

## 6. Historias de Usuario (Backlog)

| ID | Historia de Usuario | Prioridad | Esfuerzo |
|:---|:---|:---:|:---:|
| **HU-01** | Registro con Validación de Disponibilidad (No Overlap) | Muy Alta | 8 pts |
| **HU-02** | Gestión de Estados (Pendiente, Confirmada, Cancelada) | Alta | 5 pts |
| **HU-03** | Reprogramación Flexible de Sesiones | Alta | 5 pts |
| **HU-04** | Visualización de Agenda Semanal | Media | 8 pts |
| **HU-05** | Buscador Rápido de Pacientes | Media | 3 pts |

## 7. Tecnologías Utilizadas
* **Frontend**: JavaScript (ES6+), CSS3 (Flexbox/Grid), HTML5.
* **Backend as a Service**: Supabase.
* **Librerías**: FullCalendar API.
