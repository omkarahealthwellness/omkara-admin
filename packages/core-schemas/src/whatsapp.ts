/**
 * WhatsApp message serializer — stateless, pure function.
 *
 * Takes a cart state + WhatsApp config → produces the wa.me deep link URL.
 * All token substitution is from a closed whitelist — no eval, no injection.
 */
import { formatPaise, WHATSAPP_TOKENS } from './primitives';
import type { CartLine } from './cart';

export interface WhatsAppSerializerInput {
  greeting: string;
  orderTemplate: string;
  footer: string;
  whatsappNumber: string; // E.164 with + prefix
  businessName: string;
  lines: CartLine[];
  orderNote: string;
  total: number; // paise
  subtotal?: number | undefined; // paise, optional
}

/** Format a single cart line for the WhatsApp message. */
function formatLine(line: CartLine): string {
  let text = `• ${line.productName}`;
  if (line.variantName) {
    text += ` (${line.variantName})`;
  }
  if (line.addonNames.length > 0) {
    text += ` + ${line.addonNames.join(', ')}`;
  }
  text += ` × ${line.quantity}`;
  text += ` — ${formatPaise(line.unitPrice * line.quantity)}`;
  if (line.note.trim()) {
    text += `\n  📝 ${line.note.trim()}`;
  }
  return text;
}

/**
 * Replace whitelisted tokens in a template string.
 * Unknown tokens are left as-is (they should have been blocked at save time).
 */
function substituteTokens(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key: string) => {
    const token = `{{${key}}}`;
    if (WHATSAPP_TOKENS.includes(token as (typeof WHATSAPP_TOKENS)[number])) {
      return values[key] ?? match;
    }
    return match; // unknown token left as-is (shouldn't happen — blocked at save)
  });
}

/** Maximum practical WhatsApp message length. Warn at 3000, block at 4000. */
export const WA_MESSAGE_WARN_LENGTH = 3000;
export const WA_MESSAGE_MAX_LENGTH = 4000;

/**
 * Serialize cart to a WhatsApp message string.
 * Returns the full message text (not URL-encoded).
 */
export function serializeWhatsAppMessage(input: WhatsAppSerializerInput): string {
  const itemsText = input.lines.map(formatLine).join('\n\n');
  const totalText = formatPaise(input.total);

  const tokenValues: Record<string, string> = {
    items: itemsText,
    total: totalText,
    subtotal: input.subtotal !== undefined ? formatPaise(input.subtotal) : totalText,
    orderNote: input.orderNote.trim(),
    businessName: input.businessName,
  };

  const parts: string[] = [];

  if (input.greeting.trim()) {
    parts.push(substituteTokens(input.greeting, tokenValues));
  }

  parts.push(itemsText);
  parts.push(`\nTotal: ${totalText}`);

  if (input.orderNote.trim()) {
    parts.push(`\nNote: ${input.orderNote.trim()}`);
  }

  if (input.footer.trim()) {
    parts.push(substituteTokens(input.footer, tokenValues));
  }

  return parts.join('\n\n');
}

/**
 * Build the full wa.me deep link URL.
 * Strips the + from E.164 number for wa.me format.
 */
export function buildWhatsAppUrl(input: WhatsAppSerializerInput): string {
  const message = serializeWhatsAppMessage(input);
  const digits = input.whatsappNumber.replace('+', '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
