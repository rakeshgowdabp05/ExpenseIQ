import { createWorker } from "tesseract.js";

const MAX_RECEIPT_FILE_SIZE_BYTES =
  8 * 1024 * 1024;

const RECEIPT_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const OCR_LANGUAGE = "eng";
const MAX_TEXT_LENGTH = 120;

const MONTH_NAME_TO_NUMBER =
  Object.freeze({
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  });

const DOCUMENT_NOISE_PATTERN =
  /\b(share|official poster|coming soon|tap for support|support|details|more actions|qr|barcode|cancellation|find venue|google wallet|reward|rewards|tap to open|unlock|offer|advertisement|poster|terms|conditions|thank you|thanks|welcome|cashier|counter|token|copy|duplicate|customer copy|merchant copy|phone|mobile|email|address|website|gstin|cin|pan|fssai|license|qty|quantity|rate|price|subtotal|sub total|cgst|sgst|igst|tax|round off|change|cash|card|visa|mastercard|rupay)\b/i;

const MERCHANT_NOISE_PATTERN =
  /\b(receipt|invoice|tax invoice|bill|memo|m-ticket|ticket\(s\)|ticket|booking id|transaction id|txn id|ref|reference|order id|order no|date|time|total|amount|paid|payment|upi|seat|seats|screen|gold|silver|platinum|dolby|atmos|2d|3d|qr|barcode|google wallet|reward|offer|support|details|cancellation)\b/i;

const TOTAL_KEYWORD_PATTERN =
  /\b(grand\s*total|total\s*amount|amount\s*paid|paid\s*amount|net\s*amount|net\s*payable|balance\s*due|final\s*amount|total\s*payable|you\s*paid|total)\b/i;

const BAD_AMOUNT_CONTEXT_PATTERN =
  /\b(phone|mobile|gstin|gst|cin|pan|fssai|license|invoice\s*no|bill\s*no|booking\s*id|order\s*id|transaction\s*id|txn\s*id|ref|reference|date|time|seat|seats|screen|ticket\(s\)|ticket|qty|quantity|pin|otp|pincode|zip|reward|rewards|offer|discount|coupon|cashback|unlock|off)\b/i;

const TICKET_CONTEXT_PATTERN =
  /\b(ticket|ticket\(s\)|booking|booking id|venue|theatre|theater|cinema|multiplex|screen|seat|seats|gold|silver|platinum|balcony|stall|audi|auditorium|hall|show)\b/i;

const EVENT_TITLE_CONTEXT_PATTERN =
  /\b(kannada|hindi|english|tamil|telugu|malayalam|marathi|2d|3d|imax|dolby|atmos|fri|sat|sun|mon|tue|wed|thu|am|pm)\b/i;

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOcrText(text) {
  return String(text ?? "")
    .replace(/[₹]/g, " INR ")
    .replace(/[|]/g, " | ")
    .replace(/[•·]/g, " ")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[--]/g, "-")
    .replace(/\r/g, "\n")
    .split("\n")
    .map(normalizeWhitespace)
    .filter(Boolean)
    .join("\n");
}

function getCleanLines(text) {
  return normalizeOcrText(text)
    .split("\n")
    .map(normalizeWhitespace)
    .filter(Boolean);
}

function truncate(value, maxLength = MAX_TEXT_LENGTH) {
  const text = normalizeWhitespace(value);

  if (!text) {
    return null;
  }

  return text.length > maxLength
    ? text.slice(0, maxLength)
    : text;
}

function isValidReceiptFile(file) {
  return (
    file &&
    RECEIPT_IMAGE_TYPES.has(file.type) &&
    file.size <=
      MAX_RECEIPT_FILE_SIZE_BYTES
  );
}

function parseNumber(value) {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  if (!cleaned) {
    return null;
  }

  const dotCount =
    (cleaned.match(/[.]/g) ?? [])
      .length;

  if (dotCount > 1) {
    return null;
  }

  const amount = Number(cleaned);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }

  return amount.toFixed(2);
}

function getQuantityValuesFromText(text) {
  const values = [];
  const pattern =
    /\b(\d{1,2})\s*(?:ticket\(s\)|ticket|tickets|item|items|qty|quantity|pcs|piece|pieces|unit|units)\b/gi;

  for (const match of text.matchAll(pattern)) {
    values.push(match[1]);
  }

  return values;
}

function getNearbyText(lines, lineIndex, radius = 4) {
  const start = Math.max(
    0,
    lineIndex - radius,
  );

  const end = Math.min(
    lines.length,
    lineIndex + radius + 1,
  );

  return lines
    .slice(start, end)
    .join(" ");
}

function correctMergedQuantityAmount(
  amountText,
  nearbyText,
) {
  const cleanedAmount = String(amountText ?? "")
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  const quantityValues =
    getQuantityValuesFromText(nearbyText);

  for (const quantity of quantityValues) {
    if (
      cleanedAmount.startsWith(quantity) &&
      cleanedAmount.length >
        quantity.length + 1
    ) {
      const withoutQuantity =
        cleanedAmount.slice(
          quantity.length,
        );

      if (
        withoutQuantity.includes(".") &&
        Number(withoutQuantity) > 0
      ) {
        const corrected =
          parseNumber(withoutQuantity);

        if (corrected) {
          return corrected;
        }
      }
    }
  }

  return parseNumber(cleanedAmount);
}

function parseDatePart(day, month, year) {
  const normalizedYear =
    String(year).length === 2
      ? `20${year}`
      : String(year);

  const yyyy = Number(normalizedYear);
  const mm = Number(month);
  const dd = Number(day);

  if (
    yyyy < 2000 ||
    yyyy > 2100 ||
    mm < 1 ||
    mm > 12 ||
    dd < 1 ||
    dd > 31
  ) {
    return null;
  }

  const date = new Date(
    Date.UTC(yyyy, mm - 1, dd),
  );

  if (
    date.getUTCFullYear() !== yyyy ||
    date.getUTCMonth() !== mm - 1 ||
    date.getUTCDate() !== dd
  ) {
    return null;
  }

  return `${normalizedYear}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function getMonthNumber(monthText) {
  return MONTH_NAME_TO_NUMBER[
    String(monthText ?? "")
      .toLowerCase()
  ];
}

function isTimeAfterMatch(text, endIndex) {
  const afterText = text
    .slice(endIndex, endIndex + 12)
    .trim();

  return /^[:]\d{2}/.test(afterText) ||
    /^(AM|PM)\b/i.test(afterText);
}

function pushDateCandidate(
  candidates,
  date,
  score,
  sourceText,
) {
  if (!date) {
    return;
  }

  candidates.push({
    date,
    score,
    sourceText,
  });
}

function scoreDateContext(text) {
  let score = 0;

  if (/\b(mon|tue|wed|thu|fri|sat|sun)\b/i.test(text)) {
    score += 25;
  }

  if (/\b(date|dated|show|booking|ticket|invoice|bill|receipt|order)\b/i.test(text)) {
    score += 18;
  }

  if (/\b(am|pm|\d{1,2}:\d{2})\b/i.test(text)) {
    score += 8;
  }

  if (/\b(unlock|offer|reward|rewards|discount|cashback|coupon)\b/i.test(text)) {
    score -= 50;
  }

  return score;
}

function extractTransactionDate(lines) {
  const candidates = [];

  lines.forEach((line, lineIndex) => {
    const nearbyText =
      getNearbyText(lines, lineIndex, 2);

    const contextScore =
      scoreDateContext(nearbyText) +
      Math.max(0, 20 - lineIndex);

    const isoPattern =
      /\b(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/g;

    for (const match of line.matchAll(isoPattern)) {
      pushDateCandidate(
        candidates,
        parseDatePart(
          match[3],
          match[2],
          match[1],
        ),
        100 + contextScore,
        match[0],
      );
    }

    const indianDatePattern =
      /\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20\d{2}|\d{2})\b/g;

    for (const match of line.matchAll(indianDatePattern)) {
      pushDateCandidate(
        candidates,
        parseDatePart(
          match[1],
          match[2],
          match[3],
        ),
        95 + contextScore,
        match[0],
      );
    }

    const dayMonthPattern =
      /\b(?:mon|tue|wed|thu|fri|sat|sun)?[,.]?\s*(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s*[-,\s|]+\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s*[-,\s|]+\s*(20\d{2}|\d{2})(?!\s*:))?\b/gi;

    for (const match of line.matchAll(dayMonthPattern)) {
      const month =
        getMonthNumber(match[2]);

      const year =
        match[3] ??
        String(new Date().getFullYear());

      pushDateCandidate(
        candidates,
        parseDatePart(
          match[1],
          month,
          year,
        ),
        125 + contextScore,
        match[0],
      );
    }

    const monthDayPattern =
      /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[-,\s]+\s*(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?(?!\s*:)(?:\s*[-,\s]+\s*(20\d{2}|\d{2})(?!\s*:))?\b/gi;

    for (const match of line.matchAll(monthDayPattern)) {
      const matchEnd =
        (match.index ?? 0) +
        match[0].length;

      if (isTimeAfterMatch(line, matchEnd)) {
        continue;
      }

      const month =
        getMonthNumber(match[1]);

      const year =
        match[3] ??
        String(new Date().getFullYear());

      pushDateCandidate(
        candidates,
        parseDatePart(
          match[2],
          month,
          year,
        ),
        85 + contextScore,
        match[0],
      );
    }
  });

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort(
    (left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (
        right.sourceText.length -
        left.sourceText.length
      );
    },
  )[0].date;
}

function extractReferenceNumber(lines) {
  const patterns = [
    /\b(?:booking\s*id|booking\s*no)\s*[:#-]?\s*([A-Z0-9][A-Z0-9/-]{2,})\b/i,
    /\b(?:invoice\s*no|invoice\s*number|inv\s*no|bill\s*no|receipt\s*no|rcpt\s*no)\s*[:#-]?\s*([A-Z0-9][A-Z0-9/-]{2,})\b/i,
    /\b(?:order\s*id|order\s*no|order\s*number)\s*[:#-]?\s*([A-Z0-9][A-Z0-9/-]{2,})\b/i,
    /\b(?:transaction\s*id|txn\s*id|txn\s*no|utr|upi\s*ref|upi\s*reference|ref\s*no|reference\s*no)\s*[:#-]?\s*([A-Z0-9][A-Z0-9/-]{2,})\b/i,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);

      if (match?.[1]) {
        return truncate(match[1], 100);
      }
    }
  }

  return null;
}

function getCurrencyAmountMatches(
  line,
  nearbyText,
) {
  const matches = [];
  const pattern =
    /(?:INR|Rs\.?|RS\.?|Rupees?)\s*([0-9]{1,7}(?:,[0-9]{2,3})*(?:\.\d{1,2})?|[0-9]{1,7}(?:\.\d{1,2})?)/gi;

  for (const match of line.matchAll(pattern)) {
    const amount =
      correctMergedQuantityAmount(
        match[1],
        nearbyText,
      );

    if (amount) {
      matches.push({
        amount,
        raw: match[1],
        hasCurrency: true,
        index: match.index ?? 0,
      });
    }
  }

  return matches;
}

function getDecimalAmountMatches(
  line,
  nearbyText,
) {
  const matches = [];
  const pattern =
    /\b([0-9]{1,7}(?:,[0-9]{2,3})*\.\d{1,2}|[0-9]{1,7}\.\d{1,2})\b/g;

  for (const match of line.matchAll(pattern)) {
    const amount =
      correctMergedQuantityAmount(
        match[1],
        nearbyText,
      );

    if (amount) {
      matches.push({
        amount,
        raw: match[1],
        hasCurrency: false,
        index: match.index ?? 0,
      });
    }
  }

  return matches;
}

function getIntegerAmountMatchesOnTotalLine(
  line,
  nearbyText,
) {
  if (!TOTAL_KEYWORD_PATTERN.test(line)) {
    return [];
  }

  const matches = [];
  const pattern =
    /\b([0-9]{1,7}(?:,[0-9]{2,3})*)\b/g;

  for (const match of line.matchAll(pattern)) {
    const amount =
      correctMergedQuantityAmount(
        match[1],
        nearbyText,
      );

    if (amount) {
      matches.push({
        amount,
        raw: match[1],
        hasCurrency: false,
        index: match.index ?? 0,
      });
    }
  }

  return matches;
}

function getLineAmountMatches(
  line,
  nearbyText,
) {
  const matches = [
    ...getCurrencyAmountMatches(
      line,
      nearbyText,
    ),
    ...getDecimalAmountMatches(
      line,
      nearbyText,
    ),
    ...getIntegerAmountMatchesOnTotalLine(
      line,
      nearbyText,
    ),
  ];

  const seen = new Set();

  return matches.filter((match) => {
    const key = `${match.amount}-${match.index}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function scoreAmountCandidate(
  line,
  match,
  lineIndex,
  nearbyText,
) {
  let score = 0;
  const amount = Number(match.amount);

  if (TOTAL_KEYWORD_PATTERN.test(nearbyText)) {
    score += 170;
  }

  if (TOTAL_KEYWORD_PATTERN.test(line)) {
    score += 90;
  }

  if (/\b(paid|payable|balance|net|grand|final)\b/i.test(nearbyText)) {
    score += 35;
  }

  if (match.hasCurrency) {
    score += 25;
  }

  if (/\.\d{1,2}\b/.test(match.raw)) {
    score += 15;
  }

  if (getQuantityValuesFromText(nearbyText).length > 0) {
    score += 8;
  }

  if (BAD_AMOUNT_CONTEXT_PATTERN.test(line)) {
    score -= 70;
  }

  if (/\b(reward|rewards|offer|discount|coupon|cashback|unlock|off)\b/i.test(nearbyText)) {
    score -= 90;
  }

  if (amount > 0 && amount < 10_000_000) {
    score += 5;
  } else {
    score -= 150;
  }

  score += Math.min(lineIndex, 50) * 0.2;

  return score;
}

function extractTotalAmount(lines) {
  const candidates = [];

  lines.forEach((line, lineIndex) => {
    const nearbyText =
      getNearbyText(lines, lineIndex, 5);

    const matches =
      getLineAmountMatches(
        line,
        nearbyText,
      );

    matches.forEach((match) => {
      candidates.push({
        amount: match.amount,
        score: scoreAmountCandidate(
          line,
          match,
          lineIndex,
          nearbyText,
        ),
        lineIndex,
      });
    });
  });

  if (candidates.length === 0) {
    return null;
  }

  const strongCandidates =
    candidates.filter(
      (candidate) => candidate.score >= 35,
    );

  const usableCandidates =
    strongCandidates.length > 0
      ? strongCandidates
      : candidates.filter(
          (candidate) =>
            candidate.score >= -5,
        );

  if (usableCandidates.length === 0) {
    return null;
  }

  return usableCandidates.sort(
    (left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (
        right.lineIndex !==
        left.lineIndex
      ) {
        return (
          right.lineIndex -
          left.lineIndex
        );
      }

      return (
        Number(right.amount) -
        Number(left.amount)
      );
    },
  )[0].amount;
}

function cleanMerchantText(value) {
  return truncate(
    String(value ?? "")
      .replace(/^[^A-Za-z0-9]+/, "")
      .replace(/\s+[|].*$/, "")
      .replace(/\b(INR|Rs\.?|Rupees?)\b.*$/i, "")
      .replace(/\b(total|amount|paid|date|time)\b.*$/i, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function isMostlyUppercase(text) {
  const letters =
    String(text ?? "")
      .replace(/[^A-Za-z]/g, "");

  if (!letters) {
    return false;
  }

  const uppercase =
    letters.replace(/[^A-Z]/g, "");

  return (
    uppercase.length / letters.length >=
    0.75
  );
}

function isGoodMerchantCandidate(line) {
  const text = cleanMerchantText(line);

  if (!text || text.length < 3) {
    return false;
  }

  if (!/[A-Za-z]/.test(text)) {
    return false;
  }

  if (/^[\d\s.,:/#-]+$/.test(text)) {
    return false;
  }

  if (/\b\d{4,}\b/.test(text)) {
    return false;
  }

  if (MERCHANT_NOISE_PATTERN.test(text)) {
    return false;
  }

  if (DOCUMENT_NOISE_PATTERN.test(text)) {
    return false;
  }

  return true;
}

function extractLabeledMerchant(lines) {
  const labelPattern =
    /\b(?:paid\s*to|payee|merchant|seller|vendor|biller|store|restaurant|shop|business|venue|theatre|theater|cinema|hall)\s*[:#-]?\s*(.+)$/i;

  for (const line of lines) {
    const match = line.match(labelPattern);

    if (
      match?.[1] &&
      isGoodMerchantCandidate(match[1])
    ) {
      return cleanMerchantText(match[1]);
    }
  }

  return null;
}

function scoreGenericMerchantCandidate(
  line,
  index,
  lines,
) {
  const text = cleanMerchantText(line);

  if (!isGoodMerchantCandidate(text)) {
    return -999;
  }

  const nextText = lines
    .slice(index + 1, index + 4)
    .join(" ");

  let score = 80;

  if (index <= 8) {
    score += 35 - index * 2;
  }

  const wordCount =
    text.split(/\s+/).length;

  if (wordCount >= 1 && wordCount <= 5) {
    score += 18;
  }

  if (
    /\b(invoice|receipt|bill|payment|paid|order|upi|card|total)\b/i.test(
      nextText,
    )
  ) {
    score += 15;
  }

  if (isMostlyUppercase(text)) {
    score += 5;
  }

  if (text.length > 60) {
    score -= 20;
  }

  return score;
}

function scoreTicketVenueCandidate(
  line,
  index,
  lines,
) {
  const text = cleanMerchantText(line);

  if (!isGoodMerchantCandidate(text)) {
    return -999;
  }

  const previousText = lines
    .slice(Math.max(0, index - 5), index)
    .join(" ");

  const nextText = lines
    .slice(index + 1, index + 5)
    .join(" ");

  const nearbyText =
    `${previousText} ${nextText}`;

  let score = 30;

  if (TICKET_CONTEXT_PATTERN.test(nearbyText)) {
    score += 75;
  }

  if (
    /\b(gold|silver|platinum|seat|seats|screen|audi|auditorium|hall|balcony|stall)\b/i.test(
      nextText,
    )
  ) {
    score += 85;
  }

  if (
    /\b\d{1,2}\s*(?:ticket\(s\)|ticket|tickets)\b/i.test(
      previousText,
    )
  ) {
    score += 70;
  }

  if (
    /\b(venue|theatre|theater|cinema|multiplex|hall|auditorium)\b/i.test(
      text,
    )
  ) {
    score += 45;
  }

  if (isMostlyUppercase(text)) {
    score += 28;
  }

  if (index > 2 && index < lines.length - 2) {
    score += 14;
  }

  if (EVENT_TITLE_CONTEXT_PATTERN.test(nextText)) {
    score -= 70;
  }

  if (index <= 3 && !isMostlyUppercase(text)) {
    score -= 45;
  }

  if (text.length > 55) {
    score -= 20;
  }

  return score;
}

function extractMerchantName(
  lines,
  documentType,
) {
  const labeled =
    extractLabeledMerchant(lines);

  if (labeled) {
    return labeled;
  }

  const candidates = lines
    .map((line, index) => {
      const value =
        cleanMerchantText(line);

      const score =
        documentType === "TICKET"
          ? scoreTicketVenueCandidate(
              line,
              index,
              lines,
            )
          : scoreGenericMerchantCandidate(
              line,
              index,
              lines,
            );

      return {
        value,
        score,
        index,
      };
    })
    .filter(
      (candidate) =>
        candidate.value &&
        candidate.score > 0,
    )
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.index - right.index;
    });

  return candidates[0]?.value ?? null;
}

function inferDocumentType(lines) {
  const text =
    lines.join(" ").toLowerCase();

  if (
    /\b(ticket|booking id|m-ticket|seat|screen|show|venue|theatre|cinema)\b/.test(
      text,
    )
  ) {
    return "TICKET";
  }

  if (
    /\b(invoice|tax invoice|gstin|bill no|inv no)\b/.test(
      text,
    )
  ) {
    return "INVOICE";
  }

  if (
    /\b(upi|transaction id|txn id|utr|paid to|payment successful|debited)\b/.test(
      text,
    )
  ) {
    return "PAYMENT_RECEIPT";
  }

  if (
    /\b(order id|delivered|shipping|ecommerce|online order)\b/.test(
      text,
    )
  ) {
    return "ORDER_RECEIPT";
  }

  return "RECEIPT";
}

function buildDescription(parsed) {
  const documentLabel =
    parsed.documentType
      ? parsed.documentType
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
          )
      : "Receipt";

  const parts = [
    documentLabel,

    parsed.merchantName
      ? `from ${parsed.merchantName}`
      : null,

    parsed.referenceNumber
      ? `Ref ${parsed.referenceNumber}`
      : null,
  ].filter(Boolean);

  return parts.join(" · ");
}

function calculateConfidence(parsed) {
  let score = 0;

  if (parsed.merchantName) {
    score += 30;
  }

  if (parsed.totalAmount) {
    score += 35;
  }

  if (parsed.transactionDate) {
    score += 25;
  }

  if (parsed.referenceNumber) {
    score += 10;
  }

  return Math.min(score, 100);
}

function parseReceiptText(text) {
  const normalizedText =
    normalizeOcrText(text);

  const lines =
    getCleanLines(normalizedText);

  const documentType =
    inferDocumentType(lines);

  const merchantName =
    extractMerchantName(
      lines,
      documentType,
    );

  const transactionDate =
    extractTransactionDate(lines);

  const referenceNumber =
    extractReferenceNumber(lines);

  const totalAmount =
    extractTotalAmount(lines);

  const parsed = {
    documentType,
    merchantName,
    totalAmount,
    transactionDate,
    referenceNumber,
    rawText: normalizedText,
  };

  return {
    ...parsed,
    description: buildDescription(parsed),
    confidence: calculateConfidence(parsed),
  };
}

async function scanReceiptImage(file, options = {}) {
  if (!isValidReceiptFile(file)) {
    throw new Error(
      "Upload a valid image under 8 MB. Supported formats: JPG, PNG and WEBP.",
    );
  }

  const worker =
    await createWorker(OCR_LANGUAGE, 1, {
      logger(message) {
        if (
          message?.status ===
            "recognizing text" &&
          typeof message.progress ===
            "number"
        ) {
          options.onProgress?.(
            Math.round(
              message.progress * 100,
            ),
          );
        }
      },
    });

  try {
    const result =
      await worker.recognize(file);

    const text =
      result?.data?.text ?? "";

    return parseReceiptText(text);
  } finally {
    await worker.terminate();
  }
}

export const receiptOcrService =
  Object.freeze({
    scanReceiptImage,
    parseReceiptText,
  });