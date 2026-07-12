import { useEffect, useRef, useState } from 'react';

export default function LandingCanvas({ reduceMotion, focusRoom = 'library' }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Responsive Fallback Check
    if (reduceMotion || window.innerWidth < 768) {
      setUseFallback(true);
      return;
    }

    if (!containerRef.current) return;

    let destroyed = false;

    const initPhaser = async () => {
      const PhaserModule = await import('phaser');
      const { createGameConfig } = await import('../game/config');

      if (destroyed) return;

      const containerId = 'landing-phaser-container';
      
      const onGameReady = (game) => {
        if (destroyed) {
          game.destroy(true);
          return;
        }
        game.registry.set('focusRoom', focusRoom);
        game.scene.start('LandingScene');
        gameRef.current = game;
      };

      const config = createGameConfig(containerId, onGameReady);
      config.scene = config.scene.filter(s => s.name === 'LandingScene' || s.key === 'LandingScene' || typeof s === 'function');
      
      new PhaserModule.default.Game(config);
    };

    initPhaser();

    return () => {
      destroyed = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [reduceMotion]);

  if (useFallback) {
    return (
      <div className="absolute inset-0 bg-[#0a0503] flex items-center justify-center overflow-hidden">
        {/* We would load a static pixel art image here, for now a dark stylized gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #8a2029 0%, #0d0b0c 80%)' }}
        />
        <div className="absolute inset-0 bg-[url('/mansion_tiles.png')] opacity-10 bg-repeat" style={{ backgroundSize: '128px' }} />
      </div>
    );
  }

  return (
    <div 
      id="landing-phaser-container" 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none" 
      style={{ zIndex: 0 }}
    />
  );
}
