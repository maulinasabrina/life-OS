import { useEffect, useState } from 'react';
import * as habitService from '@/features/habits/services/habitService';
import type { YearlyOverview } from '@/shared/types/habit';

interface UseYearlyOverviewResult {
  overview: YearlyOverview | null;
  isLoading: boolean;
  error: string | null;
}

export function useYearlyOverview(year: number): UseYearlyOverviewResult {
  const [overview, setOverview] = useState<YearlyOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    habitService
      .fetchYearlyOverview(year)
      .then((data) => {
        if (isMounted) setOverview(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load yearly overview.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [year]);

  return { overview, isLoading, error };
}
