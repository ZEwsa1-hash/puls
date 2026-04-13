// Legend component - Color coding reference

import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div className="legend">
      <span className="legend-item">
        <span className="legend-dot zone2"></span> Zone 2
      </span>
      <span className="legend-item">
        <span className="legend-dot hiit"></span> HIIT
      </span>
      <span className="legend-item">
        <span className="legend-dot today"></span> Today
      </span>
    </div>
  );
};
