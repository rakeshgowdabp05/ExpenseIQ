import {
    BookOpen,
    Briefcase,
    Building2,
    Car,
    Coins,
    Ellipsis,
    Gamepad2,
    Gift,
    HeartPulse,
    House,
    Plane,
    ReceiptText,
    ShoppingBag,
    TrendingUp,
    Utensils,
    WalletCards,
  } from "lucide-react";
  
  export const CATEGORY_TYPE_OPTIONS = Object.freeze([
    {
      value: "EXPENSE",
      label: "Expense",
    },
    {
      value: "INCOME",
      label: "Income",
    },
  ]);
  
  export const CATEGORY_ICON_OPTIONS = Object.freeze([
    {
      value: "UTENSILS",
      label: "Food",
      icon: Utensils,
    },
    {
      value: "CAR",
      label: "Transport",
      icon: Car,
    },
    {
      value: "HOUSE",
      label: "Housing",
      icon: House,
    },
    {
      value: "SHOPPING_BAG",
      label: "Shopping",
      icon: ShoppingBag,
    },
    {
      value: "HEART_PULSE",
      label: "Healthcare",
      icon: HeartPulse,
    },
    {
      value: "BOOK_OPEN",
      label: "Education",
      icon: BookOpen,
    },
    {
      value: "GAMEPAD",
      label: "Entertainment",
      icon: Gamepad2,
    },
    {
      value: "RECEIPT",
      label: "Bills",
      icon: ReceiptText,
    },
    {
      value: "PLANE",
      label: "Travel",
      icon: Plane,
    },
    {
      value: "BRIEFCASE",
      label: "Salary",
      icon: Briefcase,
    },
    {
      value: "BUILDING",
      label: "Business",
      icon: Building2,
    },
    {
      value: "TRENDING_UP",
      label: "Investment",
      icon: TrendingUp,
    },
    {
      value: "GIFT",
      label: "Gift",
      icon: Gift,
    },
    {
      value: "COINS",
      label: "Money",
      icon: Coins,
    },
    {
      value: "WALLET",
      label: "Wallet",
      icon: WalletCards,
    },
    {
      value: "ELLIPSIS",
      label: "Other",
      icon: Ellipsis,
    },
  ]);
  
  export const CATEGORY_COLOR_OPTIONS = Object.freeze([
    {
      value: "SLATE",
      label: "Slate",
      swatchClass: "bg-slate-500",
      badgeClass:
        "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
      selectedClass:
        "border-slate-500 ring-slate-500/20",
    },
    {
      value: "BLUE",
      label: "Blue",
      swatchClass: "bg-blue-500",
      badgeClass:
        "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
      selectedClass:
        "border-blue-500 ring-blue-500/20",
    },
    {
      value: "CYAN",
      label: "Cyan",
      swatchClass: "bg-cyan-500",
      badgeClass:
        "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
      selectedClass:
        "border-cyan-500 ring-cyan-500/20",
    },
    {
      value: "EMERALD",
      label: "Emerald",
      swatchClass: "bg-emerald-500",
      badgeClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      selectedClass:
        "border-emerald-500 ring-emerald-500/20",
    },
    {
      value: "AMBER",
      label: "Amber",
      swatchClass: "bg-amber-500",
      badgeClass:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      selectedClass:
        "border-amber-500 ring-amber-500/20",
    },
    {
      value: "ORANGE",
      label: "Orange",
      swatchClass: "bg-orange-500",
      badgeClass:
        "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
      selectedClass:
        "border-orange-500 ring-orange-500/20",
    },
    {
      value: "ROSE",
      label: "Rose",
      swatchClass: "bg-rose-500",
      badgeClass:
        "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      selectedClass:
        "border-rose-500 ring-rose-500/20",
    },
    {
      value: "VIOLET",
      label: "Violet",
      swatchClass: "bg-violet-500",
      badgeClass:
        "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
      selectedClass:
        "border-violet-500 ring-violet-500/20",
    },
    {
      value: "INDIGO",
      label: "Indigo",
      swatchClass: "bg-indigo-500",
      badgeClass:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
      selectedClass:
        "border-indigo-500 ring-indigo-500/20",
    },
    {
      value: "PINK",
      label: "Pink",
      swatchClass: "bg-pink-500",
      badgeClass:
        "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
      selectedClass:
        "border-pink-500 ring-pink-500/20",
    },
    {
      value: "LIME",
      label: "Lime",
      swatchClass: "bg-lime-500",
      badgeClass:
        "bg-lime-50 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300",
      selectedClass:
        "border-lime-500 ring-lime-500/20",
    },
  ]);
  
  const iconMap = new Map(
    CATEGORY_ICON_OPTIONS.map((option) => [
      option.value,
      option.icon,
    ]),
  );
  
  const colorMap = new Map(
    CATEGORY_COLOR_OPTIONS.map((option) => [
      option.value,
      option,
    ]),
  );
  
  export function getCategoryIconComponent(iconKey) {
    return iconMap.get(iconKey) ?? Ellipsis;
  }
  
  export function getCategoryColorOption(colorKey) {
    return (
      colorMap.get(colorKey) ??
      CATEGORY_COLOR_OPTIONS[0]
    );
  }
  
  export function getCategoryTypeLabel(categoryType) {
    return (
      CATEGORY_TYPE_OPTIONS.find(
        (option) =>
          option.value === categoryType,
      )?.label ?? categoryType
    );
  }