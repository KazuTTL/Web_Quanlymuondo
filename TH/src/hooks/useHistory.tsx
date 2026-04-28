import { useEffect, useState } from 'react';
import { getUserBorrowRequests } from '@/services/borrow-request.service';
import type { BorrowRequest } from '@/services/borrow-request.service';

interface UseHistoryResult {
  data: BorrowRequest[];
  pagination: any;
  loading: boolean;
  refetch: () => Promise<void>;
}

const useHistory = (): UseHistoryResult => {
  const [data, setData] = useState<BorrowRequest[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUserBorrowRequests();
      setData(res.data);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, pagination, loading, refetch: fetchData };
};

export default useHistory;