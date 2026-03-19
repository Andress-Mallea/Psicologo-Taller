import { supabase } from '../api/supabaseClient.js';

export const AppointmentService = {
  // Obtener todas las citas
  async getAll() {
    const { data, error } = await supabase
      .from('appointments') // Tu tabla en Supabase
      .select('*');

    if (error) throw new Error('Error al cargar citas: ' + error.message);
    
    // Mapeo simple para que FullCalendar lo entienda
    return data.map(item => ({
      id: item.id,
      title: item.patient_name,
      start: item.start_time,
      end: item.end_time,
      extendedProps: { notes: item.notes, phone: item.patient_phone }
    }));
  },

  // Guardar una nueva cita
  async create(appointmentData) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData]) // Envuelve en array
    .select(); // <--- CRUCIAL: Sin esto, data será null o vacío

  if (error) throw error;
  
  // Verificación defensiva
  return (data && data.length > 0) ? data[0] : null;
  },
   async update(id, updateData) {
    const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
},
   async delete(id) {
      const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);

      if (error) throw error;
      return true;
  }
};