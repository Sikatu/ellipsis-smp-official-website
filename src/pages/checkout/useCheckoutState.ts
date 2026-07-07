import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { createCheckoutOrder } from "../../services/orders";
import {
  fetchMyMinecraftProfile,
  getCurrentPortalUser,
} from "../../services/playerProfilePortal";
import { ranks } from "../../data/ranks";
import { crates, furniture, plushies } from "../../data/storeItems";
import {
  paymentMethods,
  rankDetails,
} from "./checkoutData";
import { getCheckoutSelectionFromSearch } from "./checkoutSelection";
import type {
  Category,
  KeyQuantity,
  MobileCheckoutStep,
  Status,
} from "./checkoutTypes";

export function useCheckoutState() {
  const location = useLocation();
  const initialSelection = useMemo(
    () => getCheckoutSelectionFromSearch(location.search),
    [location.search]
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const productSectionRef = useRef<HTMLElement | null>(null);
  const paymentSectionRef = useRef<HTMLElement | null>(null);
  const claimSectionRef = useRef<HTMLDivElement | null>(null);

  const [mobileStep, setMobileStep] =
    useState<MobileCheckoutStep>("review");
  const [selectedCategory, setSelectedCategory] =
    useState<Category>(initialSelection.category);
  const [selectedRank, setSelectedRank] = useState(initialSelection.rank);
  const [selectedCrate, setSelectedCrate] = useState(initialSelection.crate);
  const [selectedKeyQuantity, setSelectedKeyQuantity] =
    useState<KeyQuantity>(initialSelection.keyQuantity);
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

  const selectedRankDetails =
    rankDetails.find((rank) => rank.name === selectedRank) || rankDetails[0];

  const selectedRankAsset =
    ranks.find((rank) => rank.name === selectedRankDetails.name) || ranks[0];

  const selectedCrateAsset =
    crates.find((crate) => crate.name === selectedCrate) || crates[0];

  const selectedCratePrice =
    selectedCrateAsset?.options.find(
      (option) => option.keys === selectedKeyQuantity
    )?.price || "Price not available";

  const categoryBanner = useMemo(() => {
    if (selectedCategory === "Premium Ranks") {
      return {
        src: selectedRankAsset.image,
        alt: `${selectedRankDetails.name} rank banner`,
      };
    }

    if (selectedCategory === "Premium Crates") {
      return {
        src: selectedCrateAsset?.image || crates[0]?.image || "",
        alt: `${selectedCrateAsset?.name || "Premium Crate"} banner`,
      };
    }

    if (selectedCategory === "Furnitures") {
      return {
        src:
          furniture.packs[furnitureSlide]?.image ||
          furniture.packs[0]?.image ||
          "",
        alt: "Furniture preview",
      };
    }

    return {
      src: plushies.image,
      alt: "Plushies preview",
    };
  }, [
    selectedCategory,
    selectedRankAsset.image,
    selectedRankDetails.name,
    selectedCrateAsset,
    furnitureSlide,
  ]);

  const selectedProduct = useMemo(() => {
    if (selectedCategory === "Premium Ranks") {
      return {
        name: selectedRankDetails.name,
        type: "Premium Rank",
        price: selectedRankDetails.price,
        image: selectedRankAsset.image,
        description: selectedRankDetails.description,
      };
    }

    if (selectedCategory === "Premium Crates") {
      return {
        name: `${selectedCrateAsset?.name || selectedCrate} - ${selectedKeyQuantity}`,
        type: "Premium Crate",
        price: selectedCratePrice,
        image: selectedCrateAsset?.image || "",
        description: `Premium crate package with ${selectedKeyQuantity}.`,
      };
    }

    if (selectedCategory === "Furnitures") {
      return {
        name: "Ellipsis Coins",
        type: "Furnitures",
        price: "PHP 50",
        image:
          furniture.packs[furnitureSlide]?.image ||
          furniture.packs[0]?.image ||
          "",
        description:
          "PHP 50 = 10 Ellipsis Coins. Use Ellipsis Coins in-game at /warp trades to choose the furniture you want.",
      };
    }

    return {
      name: "Plushie Keys",
      type: "Plushies",
      price: "PHP 50",
      image: plushies.image,
      description:
        "PHP 50 = 5 Plushie Keys. Use Plushie Keys in-game to unlock adorable plushies.",
    };
  }, [
    selectedCategory,
    selectedRankDetails,
    selectedRankAsset.image,
    selectedCrate,
    selectedCrateAsset,
    selectedKeyQuantity,
    selectedCratePrice,
    furnitureSlide,
  ]);

  const priceParts = useMemo(() => {
    const [currency, ...amountParts] = selectedProduct.price.split(" ");
    return {
      currency,
      amount: amountParts.join(" ") || selectedProduct.price,
    };
  }, [selectedProduct.price]);

  const productBadge = useMemo(() => {
    if (selectedCategory === "Premium Ranks") return "Premium Rank";
    if (selectedCategory === "Premium Crates") return "Premium Crate";
    if (selectedCategory === "Furnitures") return "Furniture Coins";
    return "Plushie Keys";
  }, [selectedCategory]);

  const receiveItems = useMemo(() => {
    if (selectedCategory === "Premium Ranks") {
      return [
        `${selectedRankDetails.name} Rank`,
        "30 Days Premium Access",
        "Delivered after staff verification",
      ];
    }

    if (selectedCategory === "Premium Crates") {
      return [
        `${selectedCrateAsset?.name || selectedCrate}`,
        selectedKeyQuantity,
        "Delivered after staff verification",
      ];
    }

    if (selectedCategory === "Furnitures") {
      return [
        "10 Ellipsis Coins",
        "Use at /warp trades",
        "Delivered after staff verification",
      ];
    }

    return [
      "5 Plushie Keys",
      "Unlock plushies in-game",
      "Delivered after staff verification",
    ];
  }, [
    selectedCategory,
    selectedRankDetails.name,
    selectedCrateAsset,
    selectedCrate,
    selectedKeyQuantity,
  ]);

  const quantityForOrder =
    selectedCategory === "Premium Crates" ? selectedKeyQuantity : null;

  const canSubmit = useMemo(() => {
    return Boolean(
      minecraftIgn.trim() &&
        discordUsername.trim() &&
        receiptFile &&
        hasConfirmedPayment
    );
  }, [minecraftIgn, discordUsername, receiptFile, hasConfirmedPayment]);

  const submitLabel = useMemo(() => {
    if (status === "sending") return "Submitting...";
    if (!minecraftIgn.trim()) return "Enter Minecraft IGN";
    if (!discordUsername.trim()) return "Enter Discord Username";
    if (!receiptFile) return "Upload Receipt";
    if (!hasConfirmedPayment) return "Confirm Payment Sent";
    return "Submit Payment Claim";
  }, [minecraftIgn, discordUsername, receiptFile, hasConfirmedPayment, status]);

  const isOnlinePayment = method.id === "PayMongo";

  const activeCheckoutStep = useMemo(() => {
    if (isOnlinePayment) return mobileStep === "review" ? 0 : 1;
    if (status === "success") return 3;
    if (mobileStep === "review") return 0;
    if (mobileStep === "pay") return 1;
    return 2;
  }, [mobileStep, status, isOnlinePayment]);

  const mobilePrimaryLabel =
    mobileStep === "review"
      ? "Continue to Payment"
      : mobileStep === "pay"
        ? "Continue to Claim"
        : submitLabel;

  const isMobilePrimaryDisabled =
    mobileStep === "claim" && (!canSubmit || status === "sending");

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
    if (selectedCategory !== "Furnitures") return;

    const interval = window.setInterval(() => {
      setFurnitureSlide((current) => (current + 1) % furniture.packs.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [selectedCategory]);

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
    const nextSelection = getCheckoutSelectionFromSearch(location.search);

    setSelectedCategory(nextSelection.category);
    setSelectedRank(nextSelection.rank);
    setSelectedCrate(nextSelection.crate);
    setSelectedKeyQuantity(nextSelection.keyQuantity);
    setFurnitureSlide(0);
    setMobileStep("review");
    resetCheckoutState();
  }, [location.search]);

  function clearReceiptUpload() {
    setReceiptFile(null);
    setFileError("");
    setIsDraggingReceipt(false);
    setIsReceiptZoomOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetCheckoutState() {
    if (!isIgnLocked) {
      setMinecraftIgn("");
    }
    setDiscordUsername("");
    setHasConfirmedPayment(false);
    setOrderId("");
    setSubmitError("");
    setStatus("idle");
    clearReceiptUpload();
  }

  function resetPurchase(category: Category) {
    setSelectedCategory(category);
    setSelectedRank(rankDetails[0].name);
    setSelectedCrate(crates[0]?.name || "");
    setSelectedKeyQuantity("1 key");
    setFurnitureSlide(0);
    setMobileStep("review");
    resetCheckoutState();
  }

  function updateRank(rankName: string) {
    setSelectedRank(rankName);
    resetCheckoutState();
  }

  function updateCrate(crateName: string) {
    setSelectedCrate(crateName);
    setSelectedKeyQuantity("1 key");
    resetCheckoutState();
  }

  function updateKeyQuantity(quantity: KeyQuantity) {
    setSelectedKeyQuantity(quantity);
    resetCheckoutState();
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

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

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
      const createdOrderId = await createCheckoutOrder({
        customerName: minecraftIgn.trim(),
        minecraftUsername: minecraftIgn.trim(),
        minecraftUuid: linkedMinecraftUuid,
        discordUsername: discordUsername.trim(),
        productId: `${selectedProduct.type}-${selectedProduct.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
        productName: selectedProduct.name,
        productCategory: selectedProduct.type,
        productPrice: selectedProduct.price,
        quantity: quantityForOrder,
        paymentMethod: method.label,
        receiptFile,
      });

      setOrderId(createdOrderId);
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
    selectedCategory,
    selectedRank,
    selectedCrate,
    selectedKeyQuantity,
    quantityForOrder,
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
  };
}
