import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />

      {/* Carbon fiber texture overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(6, 182, 212, 0.1) 2px,
            rgba(6, 182, 212, 0.1) 4px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            rgba(239, 68, 68, 0.1) 2px,
            rgba(239, 68, 68, 0.1) 4px
          )`
        }}
      />

      {/* Neon glows */}
      <motion.div 
        className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />
      <motion.div 
        className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 4 }}
      />

      {/* Moving grid */}
      <motion.svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </motion.svg>

      {/* Holographic circles */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-cyan-500/20"
            style={{
              width: `${200 + i * 200}px`,
              height: `${200 + i * 200}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 60 + i * 20, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Racing particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Light streaks */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`streak-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          style={{
            width: '200px',
            top: `${20 + i * 30}%`,
            left: '-200px',
          }}
          animate={{
            x: ['0vw', '120vw'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 2,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating orbs */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, delay: 5 }}
      />
      <motion.div 
        className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
        animate={{
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, delay: 10 }}
      />
    </div>
  );
}
