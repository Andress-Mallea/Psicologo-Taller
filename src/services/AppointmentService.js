import { supabase } from '../api/supabaseClient.js';

export const AppointmentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('appointments') 
      .select('*');

    if (error) throw new Error('Error al cargar citas: ' + error.message);
    return data.map(item => ({
      id: item.id,
      title: item.patient_name,
      start: item.start_time,
      end: item.end_time,
      extendedProps: { notes: item.notes, phone: item.patient_phone }
    }));
  },
  async create(appointmentData) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select(); 

  if (error) throw error;
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