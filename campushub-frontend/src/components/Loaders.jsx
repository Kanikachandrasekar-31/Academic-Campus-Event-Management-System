export const Spinner = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}>
        <div className="skeleton-box" style={{ height: 18, borderRadius: 4, background: '#e9ecef', animation: 'pulse 1.5s infinite' }} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </>
);
