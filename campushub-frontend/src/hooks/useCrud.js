import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const useCrud = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint);
      setData(res || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  const create = async (body) => {
    const res = await api.post(endpoint, body);
    setData((p) => [...p, res]);
    return res;
  };

  const update = async (id, body) => {
    const res = await api.put(`${endpoint}/${id}`, body);
    setData((p) => p.map((item) => (item.id === id ? res : item)));
    return res;
  };

  const remove = async (id) => {
    await api.delete(`${endpoint}/${id}`);
    setData((p) => p.filter((item) => item.id !== id));
  };

  return { data, loading, error, reload: load, create, update, remove };
};

export default useCrud;
