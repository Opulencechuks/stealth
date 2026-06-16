export type Attachment = {
  name: string;
  size: string;
  type: "file" | "image";
};

export type ComposeMode = "compose" | "reply" | "reply-all" | "forward" | "schedule";

export type RecipientReadiness = {
  address: string;
  policy: "allowed" | "verify" | "blocked";
  postage: "ready" | "required";
  message: string;
};

export type ComposeDraft = {
  to: string;
  subject?: string;
  body: string;
  postage: string;
  blockedRecipients?: string[];
};

export type ComposeSubmission = {
  to: string;
  subject: string;
  body: string;
  attachments: Attachment[];
  encrypted: boolean;
  receipt: boolean;
  postage: string;
  scheduled: boolean;
  mode?: ComposeMode;
};

export function parseRecipients(value: string) {
  return value
    .split(/[;,]/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

export function getRecipientReadiness(
  value: string,
  postage: string,
  blockedRecipients: string[] = [],
): RecipientReadiness[] {
  const blocked = new Set(blockedRecipients.map((recipient) => recipient.toLowerCase()));
  const postageReady = Number.parseFloat(postage) > 0;

  return parseRecipients(value).map((address) => {
    const normalized = address.toLowerCase();
    const isBlocked = blocked.has(normalized) || normalized.includes("blocked");
    const policy = isBlocked ? "blocked" : normalized.includes("unknown") ? "verify" : "allowed";

    return {
      address,
      policy,
      postage: postageReady ? "ready" : "required",
      message: isBlocked
        ? "Blocked by sender policy"
        : postageReady
          ? policy === "verify"
            ? "Policy review needed; postage reserved"
            : "Policy allowed; postage ready"
          : "Postage required before send",
    };
  });
}

export function validateComposeDraft({ to, body, postage, blockedRecipients = [] }: ComposeDraft) {
  const recipients = getRecipientReadiness(to, postage, blockedRecipients);

  if (!recipients.length) return "Please enter a recipient";
  if (!body.trim()) return "Please enter a message";
  if (recipients.some((recipient) => recipient.policy === "blocked")) {
    return "Remove blocked recipients before sending";
  }
  if (recipients.some((recipient) => recipient.postage === "required")) {
    return "Add postage before sending";
  }

  return null;
}
