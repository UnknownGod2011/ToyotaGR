export default function Navbar() {
  return (
    <nav className="w-full h-20 carbon-bg border-b-2 border-red-600/30 flex items-center justify-between px-8 relative z-50 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-cyan-500/10 animate-pulse" style={{ animation: 'shimmer 8s ease-in-out infinite' }} />
      </div>

      <div className="relative w-16 h-16 bg-gradient-to-br from-red-600/30 to-black border-2 border-red-600/60 flex items-center justify-center shadow-lg shadow-red-600/20">
        <div className="text-red-600 font-black text-2xl neon-red">GR</div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-[0.35em] neon-red relative whitespace-nowrap text-center">
          TOYOTA GR RACE ANALYSIS
          <div className="absolute inset-0 blur-lg opacity-50 neon-red pointer-events-none">
            TOYOTA GR RACE ANALYSIS
          </div>
        </h1>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-gray-500">LIVE</span>
        </div>
      </div>
    </nav>
  );
}
