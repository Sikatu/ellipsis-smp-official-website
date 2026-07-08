import { ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";
import type { MobileCheckoutStep } from "./checkoutTypes";

type CheckoutMobileActionBarProps = {
  cartItemCount: number;
  subtotalText: string;
  mobileStep: MobileCheckoutStep;
  mobilePrimaryLabel: string;
  isMobilePrimaryDisabled: boolean;
  onPrimaryAction: () => void;
};

function CheckoutMobileActionBar({
  cartItemCount,
  subtotalText,
  mobileStep,
  mobilePrimaryLabel,
  isMobilePrimaryDisabled,
  onPrimaryAction,
}: CheckoutMobileActionBarProps) {
  return (
    <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-purple-500/30 bg-[#080019]/95 p-3 shadow-[0_0_35px_rgba(168,85,247,0.35)] backdrop-blur-xl sm:p-4 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-300">
            {subtotalText}
          </p>
          <p className="line-clamp-1 text-sm font-black text-white">
            {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in cart
          </p>
        </div>

        <Button
          onClick={onPrimaryAction}
          disabled={isMobilePrimaryDisabled}
          size="sm"
          className="min-w-[138px] shrink-0 rounded-xl py-3"
        >
          {mobilePrimaryLabel}
          {mobileStep !== "claim" && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export default CheckoutMobileActionBar;
