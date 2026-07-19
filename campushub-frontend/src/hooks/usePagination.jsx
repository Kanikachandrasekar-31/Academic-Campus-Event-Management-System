import { useState, useMemo } from 'react';

const usePagination = (data, pageSize = 10) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => data.slice((safePage - 1) * pageSize, safePage * pageSize),
    [data, safePage, pageSize]
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, data.length)} of {data.length}
        </span>
        <ul className="pagination mb-0">
          <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(safePage - 1)}>‹</button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <li key={`e${i}`} className="page-item disabled"><span className="page-link">…</span></li>
              ) : (
                <li key={p} className={`page-item ${p === safePage ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                </li>
              )
            )}
          <li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(safePage + 1)}>›</button>
          </li>
        </ul>
      </div>
    );
  };

  return { paged, page: safePage, setPage, totalPages, Pagination };
};

export default usePagination;
