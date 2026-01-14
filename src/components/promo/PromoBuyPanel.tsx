import { Button } from "@/components/ui/button";
import { AddPromoToCartButton } from "@/components/promo/AddPromoToCartButton";

import { CheckoutCard } from "@/components/detail/CheckoutCard";
import { TrustList } from "@/components/detail/TrustList";
import { PricingDisplay } from "@/components/detail/PricingDisplay";
import { TRUST_PRESET_PROMO } from "@/components/detail/trustPresets";

export function PromoBuyPanel({
  pricePEN,
  slugs,
}: {
  pricePEN: number;
  slugs: string[];
}) {
  return (
    <CheckoutCard title="CHECKOUT">
      <div>
        <div className="text-sm text-white/55">Precio del bundle</div>
        <PricingDisplay basePEN={pricePEN} size="md" showSave={false} className="mt-2" />
        <div className="mt-2 text-xs text-white/55">{slugs.length} cursos incluidos</div>
      </div>

      <TrustList className="mt-4" items={TRUST_PRESET_PROMO} />

      <div className="mt-5">
        <AddPromoToCartButton slugs={slugs} label="COMPRAR PROMOCIÓN" />
        <p className="mt-2 text-xs text-white/45">
          * Mercado Pago se conecta en la siguiente etapa.
        </p>
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full border-white/20 text-white/90 hover:bg-white/10"
        >
          Consultar por WhatsApp
        </Button>
      </div>
    </CheckoutCard>
  );
}
