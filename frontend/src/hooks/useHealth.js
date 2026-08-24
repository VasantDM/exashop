import { useState, useEffect, useCallback } from 'react';
import { getHealthStatus } from '../services/healthService';

export const useHealth = (pollInterval = 10000) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHealthStatus();
      setHealthData(data);
      setError(null);
      setLastChecked(new Date());
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
      setHealthData(null);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    if (pollInterval > 0) {
      const interval = setInterval(checkHealth, pollInterval);
      return () => clearInterval(interval);
    }
  }, [checkHealth, pollInterval]);

  return { healthData, loading, error, lastChecked, refetch: checkHealth };
};
