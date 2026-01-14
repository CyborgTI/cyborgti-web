import Link from "next/link";
import Image from "next/image";

const PAY_LOGOS = [
  { src: "/pagos/visa.svg", alt: "Visa" },
  { src: "/pagos/mastercard.svg", alt: "Mastercard" },
  { src: "/pagos/yape.svg", alt: "Yape" },
  { src: "/pagos/googlepay.svg", alt: "Google Pay" },
] as const;

export function Footer() {
  return (
    <footer className="mt-0 w-full border-t border-white/10 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {/* ===== ROW 1 ===== */}
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1.2fr] md:items-start">
          {/* left: SOLO logo (RESPONSIVO por escala) */}
          <div className="flex items-center justify-center md:justify-start">
            <div
              className="
                relative
                w-[clamp(220px,32vw,380px)]
                h-[clamp(56px,8vw,88px)]
                opacity-95
              "
              aria-label="CyborgTI"
            >
              <Image
                src="/logo/logofooter.svg"
                alt="CyborgTI"
                fill
                priority={false}
                sizes="(max-width: 768px) 70vw, 380px"
                className="object-contain"
              />
            </div>
          </div>

          {/* center: nav */}
          <nav className="flex flex-col items-center gap-5 text-center">
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm tracking-[0.25em] text-white/90">
              <Link className="transition-cyborg hover:text-white" href="/">
                HOME
              </Link>
              <Link className="transition-cyborg hover:text-white" href="/cursos">
                CURSOS
              </Link>
              <Link className="transition-cyborg hover:text-white" href="/promociones">
                PROMOCIONES
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm text-white/70">
              <Link className="transition-cyborg hover:text-white" href="/terminos">
                Términos y Condiciones
              </Link>
              <Link className="transition-cyborg hover:text-white" href="/privacidad">
                Política de privacidad
              </Link>
            </div>
          </nav>

          {/* right: newsletter (UI only) */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <div className="text-sm text-white/70">Suscríbete a ultimas actualizaciones</div>

            <div className="relative w-full max-w-[520px]">
              <input
                type="email"
                placeholder="Email"
                className="
                  h-14 w-full rounded-full
                  bg-black/60 px-6 pr-16
                  text-white/90 placeholder:text-white/35
                  ring-1 ring-white/12
                  outline-none
                  transition-cyborg
                  focus:ring-2 focus:ring-brand-500/70
                "
              />

              <button
                type="button"
                aria-label="Suscribirme"
                className="
                  absolute right-1 top-1
                  grid h-12 w-12 place-items-center rounded-full
                  bg-brand-500 text-white
                  shadow-brand
                  transition-cyborg
                  hover:bg-brand-500/90
                  active:scale-[0.98]
                "
              >
                <span className="text-lg leading-none">↗</span>
              </button>
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="my-14 h-px w-full bg-white/10" />

        {/* ===== ROW 2 ===== */}
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr_1fr] md:items-center">
          {/* left */}
          <div className="text-center text-sm text-white/70 md:text-left">
            <div>© 2026. Cyborgti by Black Crow</div>
            <div className="mt-2 text-white/65">Necesitas contactarte?</div>
            <div className="text-white/80">Email: info@cyborgti.com</div>
          </div>

          {/* center */}
          <div className="flex flex-col items-center gap-5">
            <div className="text-center text-sm text-white/70">
              Aceptamos todos los metodos de pagos
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {PAY_LOGOS.map((p) => (
                <div
                  key={p.src}
                  className="
                    relative grid place-items-center rounded-full
                    bg-white
                    shadow-[0_10px_30px_rgba(0,0,0,.35)]
                    ring-1 ring-white/20
                    h-[clamp(40px,10vw,48px)]
                    w-[clamp(40px,10vw,48px)]
                  "
                  title={p.alt}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(max-width: 640px) 40px, 48px"
                    className="object-contain p-[clamp(8px,2.2vw,10px)]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* right */}
          <div className="flex flex-col items-center gap-3 text-sm tracking-[0.25em] text-white/85 md:items-end">
            <Link className="transition-cyborg hover:text-white" href="https://www.facebook.com/CyborgTI">
              FACEBOOK
            </Link>
            <Link className="transition-cyborg hover:text-white" href="#">
              (X)TWITTER
            </Link>
            <Link className="transition-cyborg hover:text-white" href="#">
              INSTAGRAM
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
