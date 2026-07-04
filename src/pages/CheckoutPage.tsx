import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { mobileCheckoutSteps } from "./checkout/checkoutData";
import CheckoutProductReviewSection from "./checkout/CheckoutProductReviewSection";
import CheckoutPaymentSection from "./checkout/CheckoutPaymentSection";
import CheckoutClaimSection from "./checkout/CheckoutClaimSection";
import CheckoutReceiptZoomModal from "./checkout/CheckoutReceiptZoomModal";
import CheckoutMobileActionBar from "./checkout/CheckoutMobileActionBar";
import { useCheckoutState } from "./checkout/useCheckoutState";

function CheckoutPage() {
  const {
    fileInputRef,
    resultRef,
    productSectionRef,
    paymentSectionRef,
    claimSectionRef,
    mobileStep,
    selectedCategory,
    selectedRank,
    selectedCrate,
    selectedKeyQuantity,
    method,
    setMethod,
    minecraftIgn,
    setMinecraftIgn,
    discordUsername,
    setDiscordUsername,
    receiptFile,
    receiptPreviewUrl,
    fileError,
    hasConfirmedPayment,
    setHasConfirmedPayment,
    status,
    setStatus,
    submitError,
    orderId,
    copiedRecipient,
    setCopiedRecipient,
    copiedOrderId,
    isDraggingReceipt,
    setIsDraggingReceipt,
    isReceiptZoomOpen,
    setIsReceiptZoomOpen,
    selectedRankDetails,
    categoryBanner,
    selectedProduct,
    priceParts,
    productBadge,
    receiveItems,
    canSubmit,
    submitLabel,
    activeCheckoutStep,
    mobilePrimaryLabel,
    isMobilePrimaryDisabled,
    resetPurchase,
    updateRank,
    updateCrate,
    updateKeyQuantity,
    downloadQr,
    copyRecipientInfo,
    copyOrderId,
    goToMobileStep,
    handleMobilePrimaryAction,
    processReceiptFile,
    clearReceiptUpload,
    submitClaim,
  } = useCheckoutState();

  return (
    <main className="min-h-screen bg-[#030014] px-3 pb-[calc(env(safe-area-inset-bottom)+8rem)] pt-28 text-white sm:px-6 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-purple-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="mb-4 grid grid-cols-3 gap-2 lg:hidden">
          {mobileCheckoutSteps.map((step, index) => {
            const isActive = mobileStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToMobileStep(step.id)}
                className={`rounded-2xl border px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.12em] transition ${isActive
                    ? "border-purple-200 bg-purple-500/25 text-white shadow-[0_0_24px_rgba(168,85,247,0.25)]"
                    : "border-purple-500/20 bg-white/[0.04] text-purple-200"
                  }`}
              >
                <span className="block text-[9px] text-purple-300/75">
                  Step {index + 1}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <CheckoutProductReviewSection
            productSectionRef={productSectionRef}
            mobileStep={mobileStep}
            activeCheckoutStep={activeCheckoutStep}
            categoryBanner={categoryBanner}
            productBadge={productBadge}
            selectedProduct={selectedProduct}
            selectedCategory={selectedCategory}
            selectedRank={selectedRank}
            selectedCrate={selectedCrate}
            selectedKeyQuantity={selectedKeyQuantity}
            selectedRankDetails={selectedRankDetails}
            priceParts={priceParts}
            receiveItems={receiveItems}
            resetPurchase={resetPurchase}
            updateRank={updateRank}
            updateCrate={updateCrate}
            updateKeyQuantity={updateKeyQuantity}
            goToMobileStep={goToMobileStep}
          />

          <section
            ref={paymentSectionRef}
            className={`rounded-[1.75rem] border border-purple-500/25 bg-white/[0.06] p-4 shadow-[0_0_55px_rgba(59,130,246,0.12)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6 ${mobileStep === "review" ? "hidden lg:block" : ""}`}
          >
            <CheckoutPaymentSection
              mobileStep={mobileStep}
              selectedProduct={selectedProduct}
              method={method}
              setMethod={setMethod}
              copiedRecipient={copiedRecipient}
              setCopiedRecipient={setCopiedRecipient}
              downloadQr={downloadQr}
              copyRecipientInfo={copyRecipientInfo}
              goToMobileStep={goToMobileStep}
            />
            <CheckoutClaimSection
              claimSectionRef={claimSectionRef}
              resultRef={resultRef}
              fileInputRef={fileInputRef}
              mobileStep={mobileStep}
              selectedProduct={selectedProduct}
              method={method}
              minecraftIgn={minecraftIgn}
              setMinecraftIgn={setMinecraftIgn}
              discordUsername={discordUsername}
              setDiscordUsername={setDiscordUsername}
              receiptFile={receiptFile}
              receiptPreviewUrl={receiptPreviewUrl}
              fileError={fileError}
              hasConfirmedPayment={hasConfirmedPayment}
              setHasConfirmedPayment={setHasConfirmedPayment}
              status={status}
              setStatus={setStatus}
              submitError={submitError}
              orderId={orderId}
              copiedOrderId={copiedOrderId}
              copyOrderId={copyOrderId}
              isDraggingReceipt={isDraggingReceipt}
              setIsDraggingReceipt={setIsDraggingReceipt}
              setIsReceiptZoomOpen={setIsReceiptZoomOpen}
              processReceiptFile={processReceiptFile}
              clearReceiptUpload={clearReceiptUpload}
              canSubmit={Boolean(canSubmit)}
              submitLabel={submitLabel}
              submitClaim={submitClaim}
              resetPurchase={resetPurchase}
            />
          </section>
        </div>

        {isReceiptZoomOpen && receiptPreviewUrl && (
          <CheckoutReceiptZoomModal
            receiptPreviewUrl={receiptPreviewUrl}
            onClose={() => setIsReceiptZoomOpen(false)}
          />
        )}

        {status !== "success" && (
          <CheckoutMobileActionBar
            selectedProduct={selectedProduct}
            mobileStep={mobileStep}
            mobilePrimaryLabel={mobilePrimaryLabel}
            isMobilePrimaryDisabled={isMobilePrimaryDisabled}
            onPrimaryAction={handleMobilePrimaryAction}
          />
        )}

      </div>
    </main>
  );
}

export default CheckoutPage;
