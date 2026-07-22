export default function LandingCanvas({ reduceMotion, focusRoom = 'library', customAppearance }) {
  // We will simply render the stylized static fallback for the landing
  // until a fully-fledged 3D Landing Scene is requested.
  return (
    <div className="absolute inset-0 bg-[#0a0503] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #8a2029 0%, #0d0b0c 80%)' }}
      />
      {/* 
        Temporarily disabled the tile background to prevent Rollup missing asset error:
        <div className="absolute inset-0 bg-[url('/mansion_tiles.png')] opacity-10 bg-repeat" style={{ backgroundSize: '128px' }} />
      */}
    </div>
  );
}
