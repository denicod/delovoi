import { useQuery } from 'react-query';
import fetcher from '../../../helpers/fetcher';
import { type Task } from '../model/Task';

interface ResponseBody {
  status: boolean;
  data: {
    placemarks: Task[];
  };
}

export const useGetTasksPlacemarks = (token: string | null) =>
  useQuery<ResponseBody>(
    ['placemarks'],
    async () =>
      await fetcher<ResponseBody>({
        url: '/task/placemarks',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
  );
