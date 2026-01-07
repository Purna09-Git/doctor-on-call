import React from "react";
import { FaInbox } from "react-icons/fa";

const Empty = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      color: 'var(--medium-gray)',
      textAlign: 'center'
    }}>
      <FaInbox style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }} />
      <p style={{ fontSize: '1.25rem', fontWeight: '500' }}>No data available</p>
      <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>Check back later for updates</p>
    </div>
  );
};

export default Empty;
