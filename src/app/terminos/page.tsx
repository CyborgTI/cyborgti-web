export const metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de CyborgTI.",
};

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-base font-semibold text-white/90">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/70">{children}</div>
    </section>
  );
}

export default function TerminosPage() {
  const lastUpdated = "09/01/2026"; // cambia cuando edites

  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Términos y Condiciones</h1>
        <p className="mt-4 text-white/70 leading-relaxed">
          Al acceder y utilizar CyborgTI, aceptas estos términos. Si no estás de acuerdo, por favor
          no utilices nuestros servicios.
        </p>
        <p className="mt-3 text-xs text-white/50">Última actualización: {lastUpdated}</p>
      </header>

      <div className="grid gap-6">
        <Item title="1. Uso del sitio">
          <p>
            Puedes navegar y comprar cursos según las condiciones publicadas. Te comprometes a usar
            el sitio de forma lícita y sin afectar la disponibilidad, seguridad o experiencia de otros.
          </p>
        </Item>

        <Item title="2. Cuenta, datos y veracidad">
          <p>
            Si brindas información (por ejemplo correo o WhatsApp), declaras que es real y que tienes
            autorización para usarla. Podemos contactarte para confirmar compras o soporte.
          </p>
        </Item>

        <Item title="3. Compras, precios y promociones">
          <p>
            Los precios se muestran en la web y pueden cambiar sin previo aviso. Las promociones tienen
            vigencia y condiciones específicas. En caso de conflicto, prevalece lo mostrado al momento de pagar.
          </p>
        </Item>

        <Item title="4. Acceso a contenidos (licencias)">
          <p>
            El acceso a cursos es personal e intransferible, salvo que se indique lo contrario. No está
            permitido compartir credenciales, redistribuir material o revender accesos.
          </p>
        </Item>

        <Item title="5. Propiedad intelectual">
          <p>
            El contenido (videos, textos, recursos, marca y diseño) está protegido. Se permite el uso
            personal para aprendizaje. Queda prohibida la reproducción o distribución sin permiso.
          </p>
        </Item>

        <Item title="6. Reembolsos y devoluciones">
          <p>
            Los reembolsos (si aplican) dependerán del tipo de producto, estado de acceso/consumo del contenido
            y políticas específicas publicadas. Para solicitar soporte, contáctanos con tu comprobante.
          </p>
        </Item>

        <Item title="7. Disponibilidad y cambios">
          <p>
            Podemos actualizar, mejorar o modificar el sitio y sus contenidos. También pueden existir
            interrupciones temporales por mantenimiento o causas externas.
          </p>
        </Item>

        <Item title="8. Limitación de responsabilidad">
          <p>
            CyborgTI brinda contenidos educativos. No garantizamos resultados específicos. En la medida permitida
            por la ley, no somos responsables por daños indirectos derivados del uso del sitio.
          </p>
        </Item>

        <Item title="9. Enlaces a terceros">
          <p>
            Podemos incluir enlaces a servicios externos. No controlamos su contenido ni sus políticas.
            Te recomendamos revisar sus términos y privacidad.
          </p>
        </Item>

        <Item title="10. Contacto">
          <p>
            Para consultas sobre estos términos, escríbenos a{" "}
            <span className="text-white/85">contacto@cyborgti.com</span>.
          </p>
        </Item>
      </div>
    </main>
  );
}
