import fs from 'fs/promises';
import path from 'path';

export interface ParsedReview {
  id: number;
  name: string;
  text: string;
  rating: number;
  dateLabel?: string;
}

function parseReviewerLine(line: string): { name: string; dateLabel?: string } {
  const cleaned = String(line || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return { name: 'Anonymous' };

  const datePattern = /(\d+\s*(?:Day|Days)\s*ago|\d{1,2}\s*[A-Za-z]{3})$/i;
  const dateMatch = cleaned.match(datePattern);
  if (!dateMatch) return { name: cleaned };

  const dateLabel = dateMatch[1].replace(/\s+/g, ' ').trim();
  const name = cleaned.slice(0, dateMatch.index).trim() || 'Anonymous';
  return { name, dateLabel };
}

export function parseReviewsFromProfile(content: string): ParsedReview[] {
  const blockRegex =
    /(^[^\n]+)\nRating:\s*([0-9]+)\s*out of 5 stars\s*\nCustomer review[\s\S]*?\nFeefo\n([\s\S]*?)(?=\n[^\n]+\nRating:\s*[0-9]+\s*out of 5 stars|\nFrequently asked questions|\nNewest first|\s*$)/gim;

  const rows: ParsedReview[] = [];
  let match: RegExpExecArray | null;
  let id = 1;

  while ((match = blockRegex.exec(content)) !== null) {
    const reviewerLine = match[1]?.trim() || '';
    const rating = Number.parseInt(match[2] || '0', 10);
    const rawText = (match[3] || '').trim();
    const text = rawText.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (!text) continue;

    const { name, dateLabel } = parseReviewerLine(reviewerLine);
    rows.push({
      id: id++,
      name,
      text,
      rating: Number.isFinite(rating) ? rating : 0,
      dateLabel,
    });
  }

  const seen = new Set<string>();
  const unique: ParsedReview[] = [];
  for (const review of rows) {
    const key = `${review.name.toLowerCase()}|${review.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(review);
  }

  return unique;
}

export async function loadReviewsFromProfile(limit?: number): Promise<ParsedReview[]> {
  const profilePath = path.join(process.cwd(), 'profile.txt');
  const content = await fs.readFile(profilePath, 'utf8');
  const parsed = parseReviewsFromProfile(content);
  if (!limit || limit <= 0) return parsed;
  return parsed.slice(0, limit);
}
