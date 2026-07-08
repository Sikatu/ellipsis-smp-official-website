import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import SectionHeader from "../ui/SectionHeader";

const rules = [
    {
        title: "Respect Everyone",
        content:
            "Treat all players with respect. Harassment, slurs, hate speech, targeted bullying, and discrimination are prohibited.",
    },
    {
        title: "Leave Drama Out of Chat",
        content:
            "Personal conflicts do not belong in public channels. Use DMs, support tickets, or staff assistance instead.",
    },
    {
        title: "No Spam",
        content:
            "Keep chat readable. Repeated messages, excessive caps, flooding chat, and meaningless spam are not allowed.",
    },
    {
        title: "No Cheating or Unfair Advantages",
        content:
            "OptiFine, minimap mods, and performance mods are allowed. X-Ray, auto clickers, kill aura, fly hacks, and exploits are prohibited.",
    },
    {
        title: "Report Bugs — Do Not Abuse Them",
        content:
            "Found a bug? Report it to staff. Do not duplicate items, abuse glitches, or gain unfair advantages.",
    },
    {
        title: "PvP Rules",
        content:
            "PvP is only allowed in designated PvP areas or when both players agree. Spawn killing, death trapping, and harassment PvP are prohibited.",
    },
    {
        title: "Respect Other Players’ Property",
        content:
            "Do not steal, grief builds, destroy farms, or raid bases. Whether claimed or unclaimed, respect other players’ work.",
    },
    {
        title: "Build Responsibly",
        content:
            "Avoid offensive builds, inappropriate symbols, giant spam towers, and 1x1 pillar spam. Keep the world beautiful.",
    },
    {
        title: "Claim Your Land",
        content:
            "Use the server’s land claim system. Unclaimed builds outside protected areas may not be protected from player interaction.",
    },
    {
        title: "Avoid Excessive Lag",
        content:
            "Avoid excessive mob farms, redstone clocks, auto farms, and entity accumulation. Staff may remove lag-causing structures.",
    },
    {
        title: "Global Chat = English",
        content:
            "Use English in global chat to help moderation. Other languages are welcome in DMs, private channels, or party chats.",
    },
    {
        title: "No Advertising",
        content:
            "Do not advertise other Minecraft servers, Discord servers, websites, or social media communities without staff permission.",
    },
    {
        title: "Respect Privacy",
        content:
            "Never share another player’s real name, address, social media accounts, or personal information without consent.",
    },
    {
        title: "Respect Staff Decisions",
        content:
            "Disagree with a decision? Open a ticket and appeal respectfully. Do not argue publicly, harass staff, or evade punishments.",
    },
    {
        title: "No Impersonation",
        content:
            "Do not impersonate staff, content creators, or other players. This includes fake usernames, misleading nicknames, and deceptive skins.",
    },
];

const punishments = [
    "1st Offence — Verbal Warning",
    "2nd Offence — Formal Warning",
    "3rd Offence — Temporary Mute/Ban",
    "Severe Offence — Permanent Ban",
];

const faqs = [
    {
        question: "Is Ellipsis SMP Java and Bedrock compatible?",
        answer:
            "Yes. Ellipsis SMP is a crossplay server for Java and Bedrock players.",
    },
    {
        question: "How do I buy ranks or items?",
        answer: "Open a Discord ticket. Purchases are handled manually for now.",
    },
    {
        question: "Where do I get support?",
        answer:
            "Join the Discord and open a ticket for help, purchases, rewards, or questions.",
    },
    {
        question: "Can Bedrock players use all features?",
        answer:
            "Most features work, but some cosmetics or furniture may have Bedrock limitations.",
    },
];

function RulesFAQ() {
    const [openRule, setOpenRule] = useState<number | null>(0);

    return (
        <section id="rules" className="bg-transparent px-4 py-14 text-white sm:px-6 sm:py-20 md:py-24">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Ellipsis SMP"
                    title="Official Server Rules"
                    description="By joining Ellipsis SMP, you agree to follow all rules listed below. Ignorance of the rules is not an excuse."
                    tone="purple"
                />

                <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45 }}
                        className="rounded-3xl border border-purple-500/20 bg-white/5 p-5 backdrop-blur sm:p-8"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-400/20">
                                <ShieldCheck className="h-7 w-7 text-purple-300" />
                            </div>
                            <h3 className="text-2xl font-black sm:text-3xl">
                                Server Rules
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {rules.map((rule, index) => {
                                const isOpen = openRule === index;
                                const ruleNumber = String(index + 1).padStart(2, "0");

                                return (
                                    <motion.div
                                        key={rule.title}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.15 }}
                                        transition={{ duration: 0.35, delay: index * 0.025 }}
                                        className={`overflow-hidden rounded-2xl border bg-black/30 transition ${isOpen
                                            ? "border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.18)]"
                                            : "border-purple-500/20 hover:border-purple-400/40"
                                            }`}
                                    >
                                        <button
                                            onClick={() => setOpenRule(isOpen ? null : index)}
                                            className="flex w-full items-center justify-between gap-4 p-5 text-left"
                                        >
                                            <div className="flex items-start gap-4">
                                                <span
                                                    className={`mt-0.5 rounded-full px-3 py-1 text-xs font-black tracking-widest ${isOpen
                                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                                                        : "bg-white/5 text-purple-300 ring-1 ring-purple-500/20"
                                                        }`}
                                                >
                                                    {ruleNumber}
                                                </span>

                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                                                        Rule
                                                    </p>
                                                    <h4 className="mt-1 font-black text-white">
                                                        {rule.title}
                                                    </h4>
                                                </div>
                                            </div>

                                            <ChevronDown
                                                className={`h-5 w-5 shrink-0 text-purple-300 transition duration-300 ease-out ${isOpen ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.28, ease: "easeOut" }}
                                                >
                                                    <p className="px-5 pb-5 text-sm leading-6 text-gray-400 sm:pl-[5.25rem]">
                                                        {rule.content}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.45, delay: 0.1 }}
                            className="rounded-3xl border border-red-500/20 bg-white/5 p-8 backdrop-blur"
                        >
                            <h3 className="text-2xl font-black text-red-300 sm:text-3xl">
                                Punishment System
                            </h3>

                            <div className="mt-6 space-y-0">
                                {punishments.map((item, index) => (
                                    <div key={item} className="relative flex gap-4 pb-6 last:pb-0">
                                        {index !== punishments.length - 1 && (
                                            <div className="absolute left-[11px] top-7 h-full w-px bg-red-500/20" />
                                        )}

                                        <div className="relative mt-1 h-6 w-6 rounded-full border border-red-400/40 bg-red-500/20 shadow-[0_0_18px_rgba(239,68,68,0.2)]" />

                                        <div className="rounded-2xl border border-red-500/20 bg-black/30 px-4 py-3 text-sm text-gray-300">
                                            {item}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.45, delay: 0.15 }}
                            className="rounded-3xl border border-yellow-500/20 bg-white/5 p-8 backdrop-blur"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500/10 ring-1 ring-yellow-400/20">
                                    <Star className="h-6 w-6 text-yellow-300" />
                                </div>
                                <h3 className="text-2xl font-black">Community Values</h3>
                            </div>

                            <p className="leading-7 text-gray-300">
                                We aim to build a server that is friendly, creative, fair,
                                inclusive, and fun for everyone.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.45, delay: 0.2 }}
                            className="rounded-3xl border border-blue-500/20 bg-white/5 p-8 backdrop-blur"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-400/20">
                                    <HelpCircle className="h-7 w-7 text-blue-300" />
                                </div>
                                <h3 className="text-2xl font-black sm:text-3xl">FAQ</h3>
                            </div>

                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <motion.div
                                        key={faq.question}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.35, delay: index * 0.05 }}
                                        className="rounded-2xl border border-blue-500/20 bg-black/30 p-5 transition hover:border-blue-400/50 hover:shadow-[0_0_22px_rgba(59,130,246,0.16)]"
                                    >
                                        <h4 className="font-black text-blue-200">
                                            {faq.question}
                                        </h4>
                                        <p className="mt-2 text-sm leading-6 text-gray-400">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RulesFAQ;