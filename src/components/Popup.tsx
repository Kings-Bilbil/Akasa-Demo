import Link from 'next/link';
import React from 'react';

interface PopupProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  title?: string;
  actionUrl?: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
}

export default function Popup({ message, type, onClose, title, actionUrl, actionText, actionIcon }: PopupProps) {
  if (!message) return null;
  
  const defaultTitle = title || (type === 'success' ? 'Berhasil!' : 'Peringatan');
  
  return (
    <>
      <style>{`
        /* From Uiverse.io by 00Kubi - Customized for Azuraya */ 
        .azu-popup-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 9999;
          padding: 1rem;
        }

        .azu-card {
          width: 320px;
          min-height: 220px;
          height: auto;
          background-color: #1A1C23; /* Azuraya dark theme */
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 30px;
          gap: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(245, 197, 24, 0.1);
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .azu-logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .azu-logo-img {
          height: 36px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
        }

        .azu-logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #F5C518;
          font-family: var(--font-primary, sans-serif);
        }

        .azu-heading {
          font-size: 1.2em;
          font-weight: 800;
          text-align: center;
        }

        .azu-description {
          text-align: center;
          font-size: 0.85em;
          font-weight: 600;
          color: #A0AEC0;
          line-height: 1.5;
        }

        .azu-button-container {
          display: flex;
          gap: 12px;
          flex-direction: column;
          width: 100%;
          margin-top: 8px;
        }

        .azu-button-row {
          display: flex;
          gap: 16px;
          flex-direction: row;
          width: 100%;
          justify-content: center;
        }

        .azu-accept-button {
          flex: 1;
          height: 40px;
          background-color: #F5C518; /* Yellow instead of Purple */
          transition-duration: .2s;
          border: none;
          color: #000;
          cursor: pointer;
          font-weight: 700;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(245, 197, 24, 0.4), 0 2px 4px -1px rgba(245, 197, 24, 0.4);
          transition: all .2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }

        .azu-accept-button:hover {
          background-color: #fce883;
          box-shadow: 0 10px 15px -3px rgba(245, 197, 24, 0.5), 0 4px 6px -2px rgba(245, 197, 24, 0.5);
          transform: translateY(-2px);
        }

        .azu-decline-button {
          flex: 1;
          height: 40px;
          background-color: #27272a;
          transition-duration: .2s;
          color: #fff;
          border: none;
          cursor: pointer;
          font-weight: 600;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          transition: all .2s ease;
        }

        .azu-decline-button:hover {
          background-color: #3f3f46;
          box-shadow: 0 8px 12px -3px rgba(0,0,0,0.4);
        }
      `}</style>

      <div className="azu-popup-overlay" onClick={onClose}>
        <div className="azu-card" onClick={e => e.stopPropagation()}>
          
          <div className="azu-logo-container">
            <img src="/images/logo.png" alt="Azuraya" className="azu-logo-img" />
            <span className="azu-logo-text">AZURAYA</span>
          </div>

          <p className="azu-heading" style={{ color: type === 'error' ? '#EF4444' : '#F5C518' }}>
            {defaultTitle}
          </p>
          
          <p className="azu-description">
            {message}
          </p>

          <div className="azu-button-container">
            {actionUrl && actionText ? (
              <>
                <Link href={actionUrl} className="azu-accept-button">
                  {actionIcon}
                  {actionText}
                </Link>
                <button className="azu-decline-button" onClick={onClose}>
                  Tutup
                </button>
              </>
            ) : (
              <div className="azu-button-row">
                <button className="azu-accept-button" onClick={onClose} style={{ maxWidth: '140px' }}>
                  OK
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>
  );
}
