import type { TicketCategory } from "../types/tickets";

export type TicketQuestionType = "text" | "textarea" | "select";

export type TicketQuestion = {
  key: string;
  label: string;
  type: TicketQuestionType;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type TicketCategoryDefinition = {
  value: TicketCategory;
  label: string;
  description: string;
  allowGuest: boolean;
  questions: TicketQuestion[];
};

export const SUPPORT_SUBCATEGORIES = [
  "General Support",
  "Account / Login Issue",
  "Bug Report",
  "Lost Items / Claim Issue",
  "Player Report",
  "Store / Payment Concern",
  "Rank / Perk Issue",
  "Other Concern",
] as const;

export const STAFF_APPLICATION_ROLES = [
  "Developer",
  "Overseer / Manager",
  "Nexus | Admin",
  "Executor | Moderator",
  "Sentinel | Helper",
  "Architect | Builder",
  "Streamer",
  "Content Creator",
] as const;

export const TICKET_CATEGORIES: TicketCategoryDefinition[] = [
  {
    value: "support",
    label: "Support",
    description:
      "General help, account issues, bug reports, lost items, payment concerns, and more.",
    allowGuest: true,
    questions: [
      {
        key: "subcategory",
        label: "How can we assist?",
        type: "select",
        required: true,
        options: [...SUPPORT_SUBCATEGORIES],
      },
      {
        key: "minecraft_ign",
        label: "What is your In-Game Name (IGN)?",
        type: "text",
        required: true,
        placeholder: "Your Minecraft username",
      },
      {
        key: "description",
        label: "Describe your issue",
        type: "textarea",
        required: true,
        placeholder: "Give as much detail as you can...",
      },
    ],
  },
  {
    value: "ban_appeal",
    label: "Ban / Mute Appeal",
    description:
      "Were you banned or muted from Ellipsis SMP? Submit an appeal here.",
    allowGuest: true,
    questions: [
      {
        key: "subcategory",
        label: "What were you punished with?",
        type: "select",
        required: true,
        options: ["Ban", "Mute", "Jail"],
      },
      {
        key: "minecraft_ign",
        label: "What is your In-Game Name (IGN)?",
        type: "text",
        required: true,
        placeholder: "Your Minecraft username",
      },
      {
        key: "reason",
        label: "Why should you be unbanned/unmuted?",
        type: "textarea",
        required: true,
        placeholder: "Explain what happened and why you deserve a second chance...",
      },
    ],
  },
  {
    value: "staff_application",
    label: "Staff Application",
    description: "Apply to help create, fix, and maintain Ellipsis SMP.",
    allowGuest: false,
    questions: [
      {
        key: "subcategory",
        label: "Which position are you applying for?",
        type: "select",
        required: true,
        options: [...STAFF_APPLICATION_ROLES],
      },
      {
        key: "minecraft_ign",
        label: "What is your In-Game Name (IGN)?",
        type: "text",
        required: true,
        placeholder: "Your Minecraft username",
      },
      {
        key: "discord_username",
        label: "What is your Discord username?",
        type: "text",
        required: true,
        placeholder: "Your Discord username",
      },
      {
        key: "pitch",
        label: "Why should we pick you?",
        type: "textarea",
        required: true,
        placeholder: "Tell us about your experience and availability...",
      },
    ],
  },
];

export function getTicketCategoryDefinition(category: TicketCategory) {
  return TICKET_CATEGORIES.find((entry) => entry.value === category) || TICKET_CATEGORIES[0];
}
