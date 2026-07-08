import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { createCheckoutOrders, type CartOrderLine } from "../../services/orders";
import {
  fetchMyMinecraftProfile,
  getCurrentPortalUser,
} from "../../services/playerProfilePortal";
import { ranks } from "../../data/ranks";
import { crates, furniture, plushies } from "../../data/storeItems";
import { paymentMethods, rankDetails } from "./checkoutData";
import { getCheckoutSelectionFromSearch } from "./checkoutSelection";
import {
  buildCrateLine,
  buildFurnitureLine,
  buildPlushieLine,
  buildRankLine,
  formatPhp,
  type CartLine,
} from "./cartTypes";
import type { Category, KeyQuantity, MobileCheckoutStep, Status } from "./checkoutTypes";

export function useCheckoutState() {
  const location = useLocation();
  const initialSelection = useMemo(
    () => getCheckoutSelectionFromSearch(location.search),
    // Only ever read on mount -- the cart shouldn't get wiped/reseeded just
    // because the URL changes while the page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const hasInitialParams = useMemo(
    () => Boolean(location.search),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const productSectionRef = useRef<HTMLElement | null>(null);
  const paymentSectionRef = useRef<HTMLElement | null>(null);
  const claimSectionRef = useRef<HTMLDivElement | null>(null);
  const hasSeededCartRef = useRef(false);

  const [mobileStep, setMobileStep] = useState<MobileCheckoutStep>("review");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(!hasInitialParams);
  const [pickerCategory, setPickerCategory] = useState<Category>(
    initialSelection.category
  );
  const [pickerRank, setPickerRank] = useState(initialSelection.rank);
  const [pickerCrate, setPickerCrate] = useState(initialSelection.crate);
  const [pickerKeyQuantity, setPickerKeyQuantity] = useState<KeyQuantity>(
    initialSelection.keyQuantity
  );
  const [furnitureSlide, setFurnitureSlide] = useState(0);
  const [method, setMethod] = useState(paymentMethods[0]);
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [linkedMinecraftUuid, setLinkedMinecraftUuid] = useState<string | null>(null);
  const [isIgnLocked, setIsIgnLocked] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [copiedRecipient, setCopiedRecipient] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isDraggingReceipt, setIsDraggingReceipt] = useState(false);
  const [isReceiptZoomOpen, setIsReceiptZoomOpen] = useState(false);

  const pickerRankDetails =
    rankDetails.find((rank) => rank.name === pickerRank) || rankDetails[0];
  const pickerRankAsset =
    ranks.find((rank) => rank.name === pickerRankDetails.name) || ranks[0];
  const pickerCrateAsset =
    crates.find((crate) => crate.name === pickerCrate) || crates[0];

  const subtotalPhp = useMemo(
    () => cart.reduce((total, line) => total + line.unitPricePhp * line.quantity, 0),
    [cart]
  );
  const subtotalText = formatPhp(subtotalPhp);
  const cartItemCount = useMemo(
    () => cart.reduce((count, line) => count + line.quantity, 0),
    [cart]
  );

  const isOnlinePayment = method.id === "PayMongo";

  const activeCheckoutStep = useMemo(() => {
    if (isOnlinePayment) return mobileStep === "review" ? 0 : 1;
    if (status === "success") return 3;
    if (mobileStep === "review") return 0;
    if (mobileStep === "pay") return 1;
    return 2;
  }, [mobileStep, status, isOnlinePayment]);

  const canSubmit = useMemo(() => {
    return Boolean(
      cart.length > 0 &&
        minecraftIgn.trim() &&
        discordUsername.trim() &&
        receiptFile &&
        hasConfirmedPayment
    );
  }, [cart.length, minecraftIgn, discordUsername, receiptFile, hasConfirmedPayment]);

  const submitLabel = useMemo(() => {
    if (status === "sending") return "Submitting...";
    if (cart.length === 0) return "Add an Item to Cart";
    if (!minecraftIgn.trim()) return "Enter Minecraft IGN";
    if (!discordUsername.trim()) return "Enter Discord Username";
    if (!receiptFile) return "Upload Receipt";
    if (!hasConfirmedPayment) return "Confirm Payment Sent";
    return "Submit Payment Claim";
  }, [cart.length, minecraftIgn, discordUsername, receiptFile, hasConfirmedPayment, status]);

  const mobilePrimaryLabel =
    mobileStep === "review"
      ? "Continue to Payment"
      : mobileStep === "pay"
        ? "Continue to Claim"
        : submitLabel;

  const isMobilePrimaryDisabled =
    (mobileStep === "review" && cart.length === 0) ||
    (mobileStep === "claim" && (!canSubmit || status === "sending"));

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreviewUrl("");
      return;
    }

    const preview = URL.createObjectURL(receiptFile);
    setReceiptPreviewUrl(preview);

    return () => URL.revokeObjectURL(preview);
  }, [receiptFile]);

  useEffect(() => {
    if (pickerCategory !== "Furnitures") return;

    const interval = window.setInterval(() => {
      setFurnitureSlide((current) => (current + 1) % furniture.packs.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [pickerCategory]);

  useEffect(() => {
    if (status === "success" || status === "error") {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  useEffect(() => {
    let isMounted = true;

    async function loadLinkedProfile() {
      const { user } = await getCurrentPortalUser();
      if (!user || !isMounted) return;

      const { data: profile } = await fetchMyMinecraftProfile();
      if (!profile || !isMounted) return;

      setMinecraftIgn(profile.minecraft_username);
      setLinkedMinecraftUuid(profile.minecraft_uuid);
      setIsIgnLocked(true);
    }

    void loadLinkedProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasInitialParams || hasSeededCartRef.current) return;
    hasSeededCartRef.current = true;

    if (initialSelection.category === "Premium Ranks") {
      addLine(buildRankLine(pickerRankDetails, pickerRankAsset.image));
    } else if (initialSelection.category === "Premium Crates" && pickerCrateAsset) {
      addLine(buildCrateLine(pickerCrateAsset, initialSelection.keyQuantity));
    } else if (initialSelection.category === "Furnitures") {
      addLine(buildFurnitureLine(furniture));
    } else {
      addLine(buildPlushieLine(plushies));
    }
    // Intentionally mount-only: seeds the cart from URL params exactly once.
    // The ref guard (not just an empty dep array) matters because
    // StrictMode double-invokes mount effects in dev.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addLine(line: CartLine) {
    setCart((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === line.id);
      if (existingIndex === -1) return [...current, line];

      const next = [...current];
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: next[existingIndex].quantity + 1,
      };
      return next;
    });
  }

  function addFromPicker() {
    if (pickerCategory === "Premium Ranks") {
      addLine(buildRankLine(pickerRankDetails, pickerRankAsset.image));
    } else if (pickerCategory === "Premium Crates" && pickerCrateAsset) {
      addLine(buildCrateLine(pickerCrateAsset, pickerKeyQuantity));
    } else if (pickerCategory === "Furnitures") {
      addLine(buildFurnitureLine(furniture));
    } else {
      addLine(buildPlushieLine(plushies));
    }
    setIsPickerOpen(false);
  }

  function removeLine(lineId: string) {
    setCart((current) => current.filter((line) => line.id !== lineId));
  }

  function setLineQuantity(lineId: string, quantity: number) {
    if (quantity <= 0) {
      removeLine(lineId);
      return;
    }

    setCart((current) =>
      current.map((line) => (line.id === lineId ? { ...line, quantity } : line))
    );
  }

  function incrementLine(lineId: string) {
    setCart((current) =>
      current.map((line) =>
        line.id === lineId ? { ...line, quantity: line.quantity + 1 } : line
      )
    );
  }

  function decrementLine(lineId: string) {
    const line = cart.find((entry) => entry.id === lineId);
    if (!line) return;
    setLineQuantity(lineId, line.quantity - 1);
  }

  function openPicker(category: Category) {
    setPickerCategory(category);
    setIsPickerOpen(true);
  }

  function closePicker() {
    setIsPickerOpen(false);
  }

  function updatePickerRank(rankName: string) {
    setPickerRank(rankName);
  }

  function updatePickerCrate(crateName: string) {
    setPickerCrate(crateName);
    setPickerKeyQuantity("1 key");
  }

  function updatePickerKeyQuantity(quantity: KeyQuantity) {
    setPickerKeyQuantity(quantity);
  }

  function clearReceiptUpload() {
    setReceiptFile(null);
    setFileError("");
    setIsDraggingReceipt(false);
    setIsReceiptZoomOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function startNewPurchase() {
    setCart([]);
    setIsPickerOpen(true);
    setPickerCategory("Premium Ranks");
    setMobileStep("review");
    if (!isIgnLocked) setMinecraftIgn("");
    setDiscordUsername("");
    setHasConfirmedPayment(false);
    setOrderId("");
    setSubmitError("");
    setStatus("idle");
    clearReceiptUpload();
  }

  function downloadQr() {
    const link = document.createElement("a");
    link.href = method.qr;
    link.download = `${method.label.toLowerCase()}-ellipsis-smp-qr`;
    link.click();
  }

  async function copyRecipientInfo() {
    const recipientInfo = "Account name: DG\nAccount number: 09153461734";

    try {
      await navigator.clipboard.writeText(recipientInfo);
      setCopiedRecipient(true);
      window.setTimeout(() => setCopiedRecipient(false), 1800);
    } catch {
      setCopiedRecipient(false);
    }
  }

  async function copyOrderId() {
    if (!orderId) return;

    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      window.setTimeout(() => setCopiedOrderId(false), 1800);
    } catch {
      setCopiedOrderId(false);
    }
  }

  function goToMobileStep(step: MobileCheckoutStep) {
    setMobileStep(step);

    const targetRef =
      step === "review"
        ? productSectionRef
        : step === "pay"
          ? paymentSectionRef
          : claimSectionRef;

    window.requestAnimationFrame(() => {
      targetRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleMobilePrimaryAction() {
    if (mobileStep === "review") {
      if (cart.length === 0) return;
      goToMobileStep("pay");
      return;
    }

    if (mobileStep === "pay") {
      goToMobileStep("claim");
      return;
    }

    void submitClaim();
  }

  function processReceiptFile(file: File | null) {
    setFileError("");
    setStatus("idle");

    if (!file) {
      setReceiptFile(null);
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      clearReceiptUpload();
      setFileError("Receipt must be PNG, JPG, JPEG, or WEBP.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      clearReceiptUpload();
      setFileError("Receipt image must be under 4MB.");
      return;
    }

    setReceiptFile(file);
  }

  async function submitClaim() {
    if (!canSubmit || !receiptFile) return;

    setStatus("sending");
    setSubmitError("");
    setOrderId("");

    try {
      const lines: CartOrderLine[] = cart.map((line) => ({
        productId: line.productId,
        productName: line.orderProductName,
        productCategory: line.orderProductCategory,
        productPrice: line.unitPriceText,
        quantity: line.orderQuantityLabel,
        unitCount: line.quantity,
      }));

      const createdOrderReference = await createCheckoutOrders({
        customerName: minecraftIgn.trim(),
        minecraftUsername: minecraftIgn.trim(),
        minecraftUuid: linkedMinecraftUuid,
        discordUsername: discordUsername.trim(),
        paymentMethod: method.label,
        receiptFile,
        lines,
      });

      setOrderId(createdOrderReference);
      setStatus("success");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setStatus("error");
    }
  }

  return {
    fileInputRef,
    resultRef,
    productSectionRef,
    paymentSectionRef,
    claimSectionRef,
    isOnlinePayment,
    mobileStep,
    cart,
    subtotalPhp,
    subtotalText,
    cartItemCount,
    isPickerOpen,
    pickerCategory,
    pickerRank,
    pickerCrate,
    pickerKeyQuantity,
    pickerRankDetails,
    furnitureSlide,
    method,
    setMethod,
    minecraftIgn,
    setMinecraftIgn,
    isIgnLocked,
    linkedMinecraftUuid,
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
    canSubmit,
    submitLabel,
    activeCheckoutStep,
    mobilePrimaryLabel,
    isMobilePrimaryDisabled,
    addFromPicker,
    removeLine,
    setLineQuantity,
    incrementLine,
    decrementLine,
    openPicker,
    closePicker,
    updatePickerRank,
    updatePickerCrate,
    updatePickerKeyQuantity,
    startNewPurchase,
    downloadQr,
    copyRecipientInfo,
    copyOrderId,
    goToMobileStep,
    handleMobilePrimaryAction,
    processReceiptFile,
    clearReceiptUpload,
    submitClaim,
  };
}
