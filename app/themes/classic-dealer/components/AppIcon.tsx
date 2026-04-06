import type { ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  Banknote,
  Building2,
  CalendarCheck,
  Car,
  CarFront,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Clock3,
  Cog,
  CreditCard,
  Expand,
  Facebook,
  FileText,
  Fuel,
  Gauge,
  Handshake,
  Heart,
  House,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  MessageSquareMore,
  MessageSquareText,
  Phone,
  PhoneCall,
  Play,
  PoundSterling,
  Printer,
  Quote,
  RefreshCw,
  Scale,
  Search,
  Send,
  Share2,
  Shield,
  Signature,
  SlidersHorizontal,
  Truck,
  Twitter,
  Users,
  Wrench,
  X,
  Youtube,
  Zap,
} from "lucide-react";

export type AppIconName =
  | "arrow-right"
  | "arrows-rotate"
  | "award"
  | "bolt"
  | "building"
  | "calendar-check"
  | "car"
  | "car-side"
  | "check"
  | "check-circle"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "circle-check"
  | "clock"
  | "cog"
  | "comment-dots"
  | "comments"
  | "credit-card"
  | "envelope"
  | "expand"
  | "facebook-f"
  | "file-alt"
  | "file-signature"
  | "gas-pump"
  | "handshake"
  | "heart"
  | "house"
  | "instagram"
  | "linkedin-in"
  | "location-dot"
  | "lock"
  | "map-marker-alt"
  | "money-check-alt"
  | "paper-plane"
  | "phone"
  | "phone-alt"
  | "play"
  | "pound-sign"
  | "print"
  | "quote-left"
  | "road"
  | "scale-balanced"
  | "search"
  | "share-nodes"
  | "shield-alt"
  | "sliders-h"
  | "times"
  | "tools"
  | "truck"
  | "twitter"
  | "users"
  | "wrench"
  | "youtube";

const ICON_MAP: Record<AppIconName, LucideIcon> = {
  "arrow-right": ArrowRight,
  "arrows-rotate": RefreshCw,
  award: Award,
  bolt: Zap,
  building: Building2,
  "calendar-check": CalendarCheck,
  car: Car,
  "car-side": CarFront,
  check: Check,
  "check-circle": CircleCheck,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "circle-check": CircleCheck,
  clock: Clock3,
  cog: Cog,
  "comment-dots": MessageSquareMore,
  comments: MessageSquareText,
  "credit-card": CreditCard,
  envelope: Mail,
  expand: Expand,
  "facebook-f": Facebook,
  "file-alt": FileText,
  "file-signature": Signature,
  "gas-pump": Fuel,
  handshake: Handshake,
  heart: Heart,
  house: House,
  instagram: Instagram,
  "linkedin-in": Linkedin,
  "location-dot": MapPin,
  lock: Lock,
  "map-marker-alt": MapPin,
  "money-check-alt": Banknote,
  "paper-plane": Send,
  phone: Phone,
  "phone-alt": PhoneCall,
  play: Play,
  "pound-sign": PoundSterling,
  print: Printer,
  "quote-left": Quote,
  road: Gauge,
  "scale-balanced": Scale,
  search: Search,
  "share-nodes": Share2,
  "shield-alt": Shield,
  "sliders-h": SlidersHorizontal,
  times: X,
  tools: Wrench,
  truck: Truck,
  twitter: Twitter,
  users: Users,
  wrench: Wrench,
  youtube: Youtube,
};

type AppIconProps = Omit<ComponentPropsWithoutRef<"i">, "children"> & {
  name: AppIconName;
  size?: number | string;
  strokeWidth?: number;
  filled?: boolean;
};

const DEFAULT_ICON_SIZE = "1em";
const DEFAULT_STROKE_WIDTH = 2;

function canUseAbsoluteStrokeWidth(size: number | string): boolean {
  if (typeof size === "number") {
    return Number.isFinite(size);
  }

  return /^-?\d+(\.\d+)?$/.test(size.trim());
}

export default function AppIcon({
  name,
  className,
  size = DEFAULT_ICON_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  filled = false,
  "aria-hidden": ariaHidden,
  ...rest
}: AppIconProps) {
  const Icon = ICON_MAP[name];
  const iconClassName = className ? `app-icon ${className}` : "app-icon";
  const normalizedSize =
    typeof size === "number" && Number.isFinite(size)
      ? size
      : typeof size === "string" && size.trim().length
        ? size.trim()
        : DEFAULT_ICON_SIZE;
  const normalizedStrokeWidth =
    typeof strokeWidth === "number" && Number.isFinite(strokeWidth)
      ? strokeWidth
      : DEFAULT_STROKE_WIDTH;
  const absoluteStrokeWidth = canUseAbsoluteStrokeWidth(normalizedSize);

  return (
    <i className={iconClassName} aria-hidden={ariaHidden ?? true} {...rest}>
      <Icon
        size={normalizedSize}
        strokeWidth={normalizedStrokeWidth}
        absoluteStrokeWidth={absoluteStrokeWidth}
        fill={filled ? "currentColor" : "none"}
      />
    </i>
  );
}
