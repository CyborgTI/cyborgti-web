import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/course/ShareButton";
import { AddToCartButton } from "@/components/course/AddToCartButton";

import { CheckoutCard } from "@/components/detail/CheckoutCard";
import { PricingDisplay } from "@/components/detail/PricingDisplay";

export function CourseBuyPanel({
  slug,
  title,
  basePricePEN,
  finalPricePEN,
}: {
  slug: string;
  title: string;
  basePricePEN: number;
  finalPricePEN: number;
}) {
  const waText = encodeURIComponent(`Hola, quiero info del curso: ${title} (Cisco NetAcad).`);
  const waHref = `https://wa.me/+51974126985/?text=${waText}`;

  return (
    <CheckoutCard title="Obtener acceso" rightSlot={<ShareButton title={title} />}>
      <PricingDisplay
        basePEN={basePricePEN}
        finalPEN={finalPricePEN}
        size="md"
        showSave
        showPercent={false}
      />

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-sm font-semibold text-white/90">Beneficios clave</div>
        <div className="mt-2 grid gap-2 text-sm text-white/70">
          <div>• Acceso 3 meses (renovable sin perder avance)</div>
          <div>• Certificado Cisco NetAcad + insignias digitales</div>
          <div>• Vouchers de descuento (según especialidad)</div>
          <div>• Clases grabadas (link vía WhatsApp)</div>
        </div>
      </div>

      <div className="mt-5">
        <AddToCartButton
          slug={slug}
          title={title}
          label="Continuar compra"
          showShare={false}
          variant="ecom"
        />
        <p className="mt-2 text-xs text-white/45">
          * En el checkout te pediremos tu nombre, correo NetAcad y tu WhatsApp.
        </p>
      </div>

      <div className="mt-4">
        <Link href={waHref} target="_blank" rel="noreferrer" className="block">
          <Button
            variant="outline"
            className="w-full border-white/20 text-white/90 hover:bg-white/10"
          >
            Consultar por WhatsApp
          </Button>
        </Link>
      </div>
    </CheckoutCard>
  );
}
