import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as appointmentsApi from '../../lib/api/appointments.api';
import { appointmentKeys } from '../../lib/query/keys';
import type { CreateAppointmentFormValues } from '../../lib/schemas/appointments.schema';
import type { AppointmentStatus } from '../../types';

export function useAppointments(status?: AppointmentStatus) {
  return useQuery({
    queryKey: appointmentKeys.list(status),
    queryFn: () => appointmentsApi.fetchAppointments(status),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateAppointmentFormValues) => appointmentsApi.createAppointment(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentsApi.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
