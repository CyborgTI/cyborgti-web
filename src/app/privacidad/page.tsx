export const metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de CyborgTI.",
};

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-base font-semibold text-white/90">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/70">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  const lastUpdated = "09/01/2026"; // cambia cuando edites

  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Política de Privacidad</h1>
        <p className="mt-4 text-white/70 leading-relaxed">
          Esta política explica qué datos recopilamos, para qué los usamos y qué opciones tienes sobre tu información.
        </p>
        <p className="mt-3 text-xs text-white/50">Última actualización: {lastUpdated}</p>
      </header>

      <div className="grid gap-6">
        <Item title="1. Datos que podemos recopilar">
          <ul className="list-disc pl-5 space-y-2">
            <li>Datos de contacto: nombre, correo, WhatsApp (si los proporcionas).</li>
            <li>Datos de compra: cursos adquiridos, montos, promociones aplicadas.</li>
            <li>Datos técnicos: dispositivo, navegador, páginas visitadas (analítica/cookies).</li>
          </ul>
        </Item>

        <Item title="2. Para qué usamos tus datos">
          <ul className="list-disc pl-5 space-y-2">
            <li>Procesar compras y habilitar accesos.</li>
            <li>Soporte, confirmaciones y comunicaciones relacionadas a tu pedido.</li>
            <li>Mejorar la experiencia, seguridad y rendimiento del sitio.</li>
            <li>Enviar novedades/promociones solo si aceptas o cuando la ley lo permita.</li>
          </ul>
        </Item>

        <Item title="3. Cookies y analítica">
          <p>
            Podemos usar cookies para funcionamiento del carrito, sesión y medición de uso. Puedes limitar
            cookies desde tu navegador, aunque algunas funciones podrían verse afectadas.
          </p>
        </Item>

        <Item title="4. Compartición con terceros">
          <p>
            Solo compartimos datos cuando es necesario para operar el servicio: pasarelas de pago,
            herramientas de analítica, hosting o atención al cliente. Estos terceros procesan datos bajo
            sus propias políticas y/o acuerdos.
          </p>
        </Item>

        <Item title="5. Conservación y seguridad">
          <p>
            Guardamos la información el tiempo necesario para brindar el servicio, cumplir obligaciones legales
            o resolver disputas. Aplicamos medidas razonables de seguridad para proteger tus datos.
          </p>
        </Item>

        <Item title="6. Tus derechos">
          <p>
            Puedes solicitar acceso, actualización o eliminación de tus datos, así como retirar consentimiento
            para comunicaciones promocionales (cuando aplique). Escríbenos para gestionarlo.
          </p>
        </Item>

        <Item title="7. Menores de edad">
          <p>
            Si eres menor, utiliza el servicio con supervisión y autorización de tu padre, madre o tutor,
            especialmente para compras.
          </p>
        </Item>

        <Item title="8. Cambios en esta política">
          <p>
            Podemos actualizar esta política. Si hay cambios relevantes, los comunicaremos por el sitio
            o por medios razonables.
          </p>
        </Item>

        <Item title="9. Contacto">
          <p>
            Para consultas de privacidad:{" "}
            <span className="text-white/85">contacto@cyborgti.com</span>.
          </p>
        </Item>
      </div>
    </main>
  );
}
