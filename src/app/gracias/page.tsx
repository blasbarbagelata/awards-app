export default function GraciasPage() {
  return (
    <main className="min-h-screen bg-dark flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '10%', left: '15%', delay: '0s', size: 'text-2xl' },
          { top: '20%', right: '10%', delay: '0.5s', size: 'text-lg' },
          { top: '70%', left: '8%', delay: '1s', size: 'text-xl' },
          { top: '80%', right: '15%', delay: '1.5s', size: 'text-2xl' },
          { top: '40%', left: '5%', delay: '0.3s', size: 'text-sm' },
          { top: '55%', right: '5%', delay: '0.8s', size: 'text-sm' },
          { top: '15%', left: '45%', delay: '1.2s', size: 'text-lg' },
          { top: '85%', left: '40%', delay: '0.6s', size: 'text-xl' },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute text-gold select-none"
            style={{
              top: s.top,
              left: 'left' in s ? s.left : undefined,
              right: 'right' in s ? s.right : undefined,
              fontSize: undefined,
              animation: `sparkle 2s ease-in-out infinite`,
              animationDelay: s.delay,
            }}
          >
            <span className={s.size}>✦</span>
          </span>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center">
        {/* Trophy */}
        <div
          className="text-8xl mb-8 animate-float"
          style={{ filter: 'drop-shadow(0 0 30px #D4AF3760)' }}
        >
          🏆
        </div>

        {/* Heading */}
        <h1 className="font-serif text-5xl md:text-6xl font-bold shimmer-text mb-4">
          ¡Voto registrado!
        </h1>

        {/* Decorative line */}
        <div className="flex items-center gap-3 mb-6 w-full max-w-xs">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/50" />
          <span className="text-gold text-lg">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/50" />
        </div>

        {/* Subtitle */}
        <p className="text-white/70 text-lg md:text-xl mb-4 leading-relaxed">
          Tu voto ha sido registrado exitosamente.
          <br />
          <span className="text-gold">¡Gracias por participar!</span>
        </p>

        {/* Message */}
        <div className="card-gold rounded-xl p-6 mt-4 w-full">
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Tus preferencias han quedado guardadas de forma segura. Los resultados serán revelados durante la ceremonia.
          </p>
          <div className="border-t border-dark-border pt-4">
            <p className="text-gold/60 text-xs italic">
              "Que gane el más merecedor... o el más votado por sus amigos."
            </p>
          </div>
        </div>

        {/* Stars decoration */}
        <div className="flex items-center gap-4 mt-8 text-gold/40 text-lg">
          <span>✦</span>
          <span className="text-sm text-white/20">Los Premios · Gala de Amigos</span>
          <span>✦</span>
        </div>

        <p className="text-white/20 text-xs mt-6">
          Este código ya ha sido utilizado y no puede volver a emplearse.
        </p>
      </div>
    </main>
  )
}
