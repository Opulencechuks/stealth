import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Braces,
  File,
  FileArchive,
  FileText,
  Forward,
  Image,
  KeyRound,
  Paperclip,
  Reply,
  ReplyAll,
  Sparkles,
  Star,
  Table2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EventMailCard } from "@/features/calendar";
import type { Email } from "./data";
import { OTPCard, detectOtp } from "./OTPCard";

export function EmailView({ email }: { email: Email | null }) {
  const [replyMenuOpen, setReplyMenuOpen] = useState(false);

  useEffect(() => {
    setReplyMenuOpen(false);
  }, [email?.id]);

  return (
    <section className="mail-reader-atmosphere relative m-3 ml-0 flex h-[calc(100vh-3.5rem-1.5rem)] flex-1 flex-col overflow-hidden rounded-[8px]">
      <AnimatePresence mode="wait">
        {!email ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 items-center justify-center p-10 text-center"
          >
            <div>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground">No conversation selected</h3>
              <p className="mt-1 text-xs text-muted-foreground">Pick a thread from the list to read it here.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex h-full flex-col"
          >
            <div className="grid grid-cols-[minmax(180px,280px)_1fr_auto] items-center gap-3 border-b border-white/5 px-4 py-2.5">
              <SenderIdentity email={email} compact />

              <div className="flex min-w-0 items-center justify-center gap-1">
                <div className="relative">
                  <motion.button
                    key="reply"
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ y: -1 }}
                    onClick={() => setReplyMenuOpen((open) => !open)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition",
                      replyMenuOpen ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                    )}
                  >
                    <Reply className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Reply</span>
                  </motion.button>
                  <AnimatePresence>
                    {replyMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full z-40 mt-2 w-40 rounded-md border border-white/[0.12] bg-[oklch(0.15_0.005_270_/_0.88)] p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                      >
                        <motion.button
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full rounded-sm px-3 py-2 text-left text-xs text-foreground/90 transition hover:bg-white/[0.06]"
                        >
                          <div className="flex items-center gap-2">
                            <Reply className="h-3 w-3" />
                            <span>Manual reply</span>
                          </div>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {[
                  { icon: ReplyAll, label: "Reply all" },
                  { icon: Forward, label: "Forward" },
                ].map(({ icon: Icon, label }) => (
                  <motion.button
                    key={label}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ y: -1 }}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-1">
                {[Archive, Trash2, Star].map((Icon, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-md p-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              <article className="mx-auto w-full max-w-[920px]">
                <div className="border-b border-white/[0.07] pb-5">
                  <div className="min-w-0 flex-1">
                    <p className="mail-reader-meta mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Conversation
                    </p>
                    <h1 className="mail-reader-title max-w-[720px] text-[26px] font-semibold leading-[1.12] text-foreground sm:text-[30px]">
                      {email.subject}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {email.labels?.map((label) => (
                        <span
                          key={label}
                          className="mail-reader-meta rounded-md border border-white/[0.1] bg-white/[0.045] px-2 py-1 text-[10px] uppercase text-muted-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {email.event ? <EventMailCard event={email.event} /> : null}

                {(() => {
                  const otp = detectOtp(email.body);
                  return otp ? <OTPCard code={otp} /> : null;
                })()}

                <ReaderBody body={email.body} />

                {email.attachments?.length ? (
                  <div className="mt-7 max-w-[500px]">
                    <div className="mail-reader-meta mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <Paperclip className="h-3 w-3" /> {email.attachments.length} attachment
                      {email.attachments.length > 1 ? "s" : ""}
                    </div>
                    <div className="grid max-w-[440px] grid-cols-1 gap-2 sm:grid-cols-2">
                      {email.attachments.map((attachment) => (
                        <motion.div
                          key={attachment.name}
                          className="glass-tile flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5"
                        >
                          <AttachmentIcon type={attachment.type} />
                          <div className="min-w-0 flex-1">
                            <div className="mail-attachment-name truncate text-[11px] font-semibold leading-[14px] text-foreground/92">
                              {attachment.name}
                            </div>
                            <div className="text-[9.5px] leading-[12px] text-muted-foreground">{attachment.size}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="h-8" />
              </article>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function AttachmentIcon({ type }: { type: string }) {
  const { icon: Icon, className } = getAttachmentIcon(type);

  return (
    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/[0.1] bg-white/[0.06] shadow-[inset_0_1px_0_oklch(1_0_0/0.12)]">
      <Icon className={`h-4 w-4 ${className}`} />
    </div>
  );
}

function getAttachmentIcon(type: string): { icon: LucideIcon; className: string } {
  const normalized = type.toLowerCase();

  if (normalized === "pdf") return { icon: FileText, className: "text-red-300" };
  if (normalized === "key") return { icon: KeyRound, className: "text-sky-200" };
  if (normalized === "json") return { icon: Braces, className: "text-emerald-200" };
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(normalized)) return { icon: Image, className: "text-violet-200" };
  if (["zip", "rar", "7z"].includes(normalized)) return { icon: FileArchive, className: "text-amber-200" };
  if (["xls", "xlsx", "csv"].includes(normalized)) return { icon: Table2, className: "text-green-200" };
  return { icon: File, className: "text-slate-200" };
}

function SenderIdentity({ email, compact = false }: { email: Email; compact?: boolean }) {
  return (
    <div
      className={`glass-tile flex w-full items-center gap-2.5 rounded-lg ${
        compact ? "max-w-[280px] p-1.5" : "max-w-[280px] p-2.5"
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
        style={{ background: `linear-gradient(135deg, ${email.avatarColor}, #1a1a1d)` }}
      >
        {email.from
          .split(" ")
          .map((name) => name[0])
          .slice(0, 2)
          .join("")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mail-reader-meta truncate text-[12px] font-semibold leading-4 text-foreground/92">{email.from}</div>
        <div className="mail-reader-meta truncate text-[9.5px] leading-3 text-muted-foreground/80">{email.email}</div>
      </div>
    </div>
  );
}

type BodyBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "fields"; fields: { label: string; value: string }[] }
  | { kind: "list"; items: string[] };

function ReaderBody({ body }: { body: string }) {
  const blocks = getBodyBlocks(body);

  return (
    <div className="mail-reader-body mt-7 max-w-[68ch] space-y-5 text-[16px] leading-7 text-foreground/88 sm:text-[17px] sm:leading-8">
      {blocks.map((block, index) => {
        if (block.kind === "paragraph") {
          return (
            <p key={index} className="text-pretty">
              {block.text}
            </p>
          );
        }

        if (block.kind === "list") {
          return (
            <ul key={index} className="space-y-2 pl-1">
              {block.items.map((item) => (
                <li key={item} className="grid grid-cols-[16px_1fr] gap-2">
                  <span className="mt-[0.72em] h-1.5 w-1.5 rounded-full bg-foreground/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <dl
            key={index}
            className="glass-tile not-italic rounded-lg p-3"
          >
            {block.fields.map((field) => (
              <div
                key={field.label}
                className="grid gap-1 border-b border-white/[0.06] py-2 last:border-0 sm:grid-cols-[132px_1fr] sm:gap-4"
              >
                <dt className="mail-reader-field text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="break-words font-mono text-[12px] leading-5 text-foreground/86">{field.value}</dd>
              </div>
            ))}
          </dl>
        );
      })}
    </div>
  );
}

function getBodyBlocks(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  const lines = body.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (isBulletLine(line)) {
      const items: string[] = [];
      while (index < lines.length && isBulletLine(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^-\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "list", items });
      continue;
    }

    if (isFieldLine(line)) {
      const fields: { label: string; value: string }[] = [];
      while (index < lines.length && isFieldLine(lines[index].trim())) {
        fields.push(splitFieldLine(lines[index].trim()));
        index += 1;
      }
      blocks.push({ kind: "fields", fields });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current || isBulletLine(current) || isFieldLine(current)) break;
      paragraph.push(current);
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function isBulletLine(line: string) {
  return /^-\s+/.test(line);
}

function isFieldLine(line: string) {
  return /^[A-Za-z][A-Za-z0-9 -]{1,32}:\s+\S/.test(line);
}

function splitFieldLine(line: string) {
  const [label, ...value] = line.split(":");
  return { label, value: value.join(":").trim() };
}
