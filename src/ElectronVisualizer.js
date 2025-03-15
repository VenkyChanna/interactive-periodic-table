import React, { useEffect, useRef, useState } from 'react';
import './visualizer.css';

const ElectronVisualizer = ({ electronConfiguration }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [speedFactor, setSpeedFactor] = useState(1);

  useEffect(() => {
    if (!electronConfiguration) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const setCanvasSize = () => {
      const size = Math.min(400, window.innerWidth * 0.9);
      canvas.width = size;
      canvas.height = size;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Parse electron configuration
    const parseConfiguration = (config) => {
      if (!config) return [];
      
      const orbitals = [];
      const regex = /(\d)([spdf])(\d*)/g;
      const matches = config.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const shell = parseInt(match[0]);
          const subshell = match[1];
          const electrons = parseInt(match.slice(2) || 1);
          
          orbitals.push({ shell, subshell, electrons });
        });
      }
      
      return orbitals;
    };

    const orbitals = parseConfiguration(electronConfiguration);
    
    // Group electrons by shell
    const electronsByShell = {};
    orbitals.forEach(orbital => {
      if (!electronsByShell[orbital.shell]) {
        electronsByShell[orbital.shell] = [];
      }
      
      for (let i = 0; i < orbital.electrons; i++) {
        electronsByShell[orbital.shell].push({
          shell: orbital.shell,
          subshell: orbital.subshell,
          color: getOrbitalColor(orbital.subshell)
        });
      }
    });
    
    // Calculate total electrons
    const totalElectrons = orbitals.reduce((sum, orbital) => sum + orbital.electrons, 0);
    
    // Draw nucleus
    const drawNucleus = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 10;
      
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0, 
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#ff9d00');
      gradient.addColorStop(1, '#ff4500');
      ctx.fillStyle = gradient;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect
      ctx.beginPath();
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, radius,
        centerX, centerY, radius * 2
      );
      glowGradient.addColorStop(0, 'rgba(255, 69, 0, 0.5)');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(totalElectrons.toString(), centerX, centerY);
    };
    
    // Get color for orbital type
    function getOrbitalColor(subshell) {
      switch (subshell) {
        case 's': return '#fe0303'; // Red
        case 'p': return '#0ffe03'; // Green
        case 'd': return '#0905f9'; // Blue
        case 'f': return '#f9f104'; // Yellow
        default: return '#ffffff';  // White
      }
    }
    
    // Create electron objects
    const createElectrons = () => {
      const electrons = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Base speed factor (adjusted by the speed control)
      const baseSpeed = 0.06;
      
      // Process each shell
      Object.keys(electronsByShell).forEach(shellNum => {
        const shell = parseInt(shellNum);
        const shellElectrons = electronsByShell[shell];
        const orbitRadius = 25 + (shell * 25);
        
        // Calculate speed inversely proportional to shell number
        // v ∝ 1/n where n is the shell number
        const speed = (baseSpeed / shell) * speedFactor;
        
        // Position electrons evenly around the orbit
        shellElectrons.forEach((electron, index) => {
          const totalInShell = shellElectrons.length;
          const angle = (index * (Math.PI * 2)) / totalInShell;
          
          electrons.push({
            x: centerX + orbitRadius * Math.cos(angle),
            y: centerY + orbitRadius * Math.sin(angle),
            radius: 4,
            shell,
            subshell: electron.subshell,
            color: electron.color,
            angle,
            speed,
            orbitRadius
          });
        });
      });
      
      return electrons;
    };

    // Draw orbits
    const drawOrbits = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Get unique shells
      const uniqueShells = Object.keys(electronsByShell).map(shell => parseInt(shell));
      
      uniqueShells.forEach(shell => {
        const orbitRadius = 25 + (shell * 25);
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(79, 209, 197, 0.3)';
        ctx.lineWidth = 1;
        ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
      });
    };
    
    // Draw electrons
    const drawElectrons = (electrons) => {
      electrons.forEach(electron => {
        // Update position
        electron.angle += electron.speed;
        electron.x = canvas.width / 2 + electron.orbitRadius * Math.cos(electron.angle);
        electron.y = canvas.height / 2 + electron.orbitRadius * Math.sin(electron.angle);
        
        // Draw electron
        ctx.beginPath();
        ctx.fillStyle = electron.color;
        ctx.arc(electron.x, electron.y, electron.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          electron.x, electron.y, 0,
          electron.x, electron.y, electron.radius * 2
        );
        gradient.addColorStop(0, `${electron.color}66`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(electron.x, electron.y, electron.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    
    // Animation function
    let electrons = createElectrons();
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawOrbits();
      drawElectrons(electrons);
      drawNucleus();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [electronConfiguration, speedFactor]);

  return (
    <div className="electron-visualizer">
      <canvas ref={canvasRef}></canvas>
      <div className="speed-control">
        <label htmlFor="speed-slider">Animation Speed:</label>
        <input
          id="speed-slider"
          type="range"
          min="0.1"
          max="4"
          step="0.1"
          value={speedFactor}
          onChange={(e) => setSpeedFactor(parseFloat(e.target.value))}
          className="speed-slider"
        />
        <span className="speed-value">{speedFactor.toFixed(1)}x</span>
      </div>
      <div className="orbital-legend">
        <div className="legend-item">
          <span className="color-dot" style={{ backgroundColor: '#ff4d4d' }}></span>
          <span>s</span>
        </div>
        <div className="legend-item">
          <span className="color-dot" style={{ backgroundColor: '#4dff4d' }}></span>
          <span>p</span>
        </div>
        <div className="legend-item">
          <span className="color-dot" style={{ backgroundColor: '#4d4dff' }}></span>
          <span>d</span>
        </div>
        <div className="legend-item">
          <span className="color-dot" style={{ backgroundColor: '#ffff4d' }}></span>
          <span>f</span>
        </div>
      </div>
    </div>
  );
};

export default ElectronVisualizer;
