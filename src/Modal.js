import ElectronVisualizer from './ElectronVisualizer';
import { useEffect } from 'react';

const Modal = ({ element, onClose }) => {
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  if (!element) return null;

  const getStateIcon = (state) => {
    if (!state) return '•';
    switch (state.toLowerCase()) {
      case 'gas': return '💨';
      case 'solid': return '⬢';
      case 'liquid': return '💧';
      default: return '•';
    }
  };

  const getYearDisplay = (year) => {
    if (!year) return '🔍 Unknown';
    return year === "Ancient" ? "⌛ Ancient" : `🔬 ${year}`;
  };

  const formatAtomicMass = (mass) => {
    if (!mass) return 'Unknown';
    return typeof mass === 'number' ? mass.toFixed(4) : mass;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal cosmic-theme" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-left">
            <div className="element-header">
              <span className="atomic-number">#{element.atomicNumber}</span>
              <h2>{element.name}</h2>
              <div className="symbol-container">
                <span className="symbol">{element.symbol}</span>
                <span className="mass">⚖️ {formatAtomicMass(element.atomicMass)} u</span>
              </div>
            </div>

            <div className="element-details">
              <div className="info-grid">
                <div className="info-card physical-props">
                  <h4>⚛️ Physical Properties</h4>
                  <p><span>State:</span> {getStateIcon(element.standardState)} {element.standardState || 'Unknown'}</p>
                  <p><span>Density:</span> 🎯 {element.density ? `${element.density} g/cm³` : 'Unknown'}</p>
                </div>
                
                <div className="info-card classification">
                  <h4>📚 Classification</h4>
                  <p><span>Group:</span> 🔷 {element.groupBlock || 'Unknown'}</p>
                  <p><span>Discovered:</span> {getYearDisplay(element.yearDiscovered)}</p>
                </div>
              </div>
              
              <div className="info-card electronic-props">
                <h4>⚡ Electronic Properties</h4>
                {element.electronicConfiguration && (
                  <div className="electronic-config">
                    <p>Full Electronic Configuration: {element.fullElectronicConfiguration}</p>
                    <p>Electronic Configuration: {element.electronicConfiguration}</p>
                  </div>
                )}
                {element.oxidationStates && element.oxidationStates.length > 0 && (
                  <div className="oxidation-states">
                    <p>Oxidation States:</p>
                    <div className="states-container">
                      {element.oxidationStates.map((state, i) => (
                        <span key={i} className={`oxidation-state ${state >= 0 ? 'positive' : 'negative'}`}>
                          {state > 0 ? `+${state}` : state}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-right">
            <h3 className="visualizer-title">Bohr's model of {element.name}</h3>
            <ElectronVisualizer electronConfiguration={element.fullElectronicConfiguration} />
            <button className="close-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
