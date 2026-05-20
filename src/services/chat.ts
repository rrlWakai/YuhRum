import type { StayType } from "../lib/hooks";

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function toIso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeStayType(stay: StayType) {
  if (stay === "dayStay") return "Day Stay";
  if (stay === "nightStay") return "Night Stay";
  return "Overnight";
}

function parseDatesFromMessage(message: string): string[] {
  const found = new Set<string>();

  // YYYY-MM-DD
  const isoMatches = message.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/g) || [];
  for (const match of isoMatches) {
    const d = new Date(`${match}T00:00:00`);
    if (!Number.isNaN(d.getTime())) found.add(toIso(d));
  }

  // Month Day[, Year]
  const monthRegex =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:,\s*(\d{4}))?\b/gi;
  let monthMatch: RegExpExecArray | null = monthRegex.exec(message);
  while (monthMatch) {
    const monthName = monthMatch[1].toLowerCase();
    const day = Number(monthMatch[2]);
    const year = monthMatch[3] ? Number(monthMatch[3]) : new Date().getFullYear();
    const monthIndex = MONTHS[monthName];
    const d = new Date(year, monthIndex, day);
    if (
      d.getFullYear() === year &&
      d.getMonth() === monthIndex &&
      d.getDate() === day
    ) {
      found.add(toIso(d));
    }
    monthMatch = monthRegex.exec(message);
  }

  return Array.from(found).sort();
}

function isAvailabilityQuestion(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("available") ||
    m.includes("availability") ||
    m.includes("book") ||
    m.includes("reserve") ||
    m.includes("date")
  );
}

function getSuggestionReply(message: string): string | null {
  const normalized = message.trim().toLowerCase();

  if (normalized.includes("what makes yuhrum special")) {
    return "Yuhrum is designed for quiet luxury: private villas, calming natural spaces, and intimate moments shared with the people you love. Every stay is centered on rest, privacy, and a gentle return to nature.";
  }

  if (normalized.includes("tell me about villa availability")) {
    return "I can check availability instantly. Please share your preferred date in `YYYY-MM-DD` format, and I will confirm what is open.";
  }

  if (normalized.includes("what experiences do you offer")) {
    return "Our villas are ideal for peaceful escapes, family gatherings, intimate celebrations, and slow weekend retreats. Guests often enjoy private pool time, al fresco dining, and serene mornings surrounded by tropical gardens.";
  }

  return null;
}

export function getConciergeReply(
  message: string,
  blockedDates: Map<string, Set<StayType>>
): string {
  const suggestionReply = getSuggestionReply(message);
  if (suggestionReply) {
    return suggestionReply;
  }

  const dates = parseDatesFromMessage(message);
  const asksAvailability = isAvailabilityQuestion(message);

  if (asksAvailability && dates.length === 0) {
    return "Please share your preferred date in `YYYY-MM-DD` format, and I will check availability right away.";
  }

  if (dates.length > 0) {
    const lines = dates.map((iso) => {
      const blocked = blockedDates.get(iso);
      if (!blocked || blocked.size === 0) {
        return `${formatDateLabel(iso)} is available for booking.`;
      }

      const types = Array.from(blocked).map(normalizeStayType).join(", ");
      return `${formatDateLabel(iso)} is unavailable for: ${types}.`;
    });

    return lines.join("\n\n");
  }

  return "I can help check date availability instantly. Share a date like `2026-06-15` and I will confirm if it is open.";
}
