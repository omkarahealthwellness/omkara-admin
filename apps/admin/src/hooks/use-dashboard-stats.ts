import { useQuery } from '@tanstack/react-query';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    staleTime: 1000 * 60 * 10, // 10 minutes
    queryFn: async () => {
      // Use getCountFromServer which is highly efficient and cheap in Firestore
      const [productsSnap, categoriesSnap, tagsSnap] = await Promise.all([
        getCountFromServer(collection(db, 'products')),
        getCountFromServer(collection(db, 'categories')),
        getCountFromServer(collection(db, 'tags')),
      ]);

      return {
        productsCount: productsSnap.data().count,
        categoriesCount: categoriesSnap.data().count,
        tagsCount: tagsSnap.data().count,
      };
    },
  });
}
