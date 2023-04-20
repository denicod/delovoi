import { type Task } from './model/Task';
import { useAcceptTaskMutation } from './api/useAcceptTaskMutation';
import { useDismissMyTasksMutation } from './api/useDismissMyTasksMutation';
import { useGetMyTasksQuery } from './api/useGetMyTasksQuery';
import { useGetTasksQuery } from './api/useGetTasksQuery';
import { useGetVacanciesQuery } from './api/useGetVacanciesQuery';
import { useGetTasksPlacemarks } from './api/useGetTasksPlacemarks';
import { type MyTask } from './model/MyTask';

export {
  useGetTasksQuery,
  useAcceptTaskMutation,
  useDismissMyTasksMutation,
  useGetMyTasksQuery,
  useGetVacanciesQuery,
  useGetTasksPlacemarks,
  type Task,
  type MyTask,
};
