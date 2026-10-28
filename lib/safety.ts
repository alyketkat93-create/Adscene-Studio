const BLOCKED_KEYWORDS = [
  "weapon", "gun", "pistol", "rifle", "ammunition", "bomb", "explosive",
  "cocaine", "heroin", "meth", "narcotic", "illegal drug",
  "porn", "nude", "nudity", "nsfw", "erotic", "sex toy",
  "disney", "marvel", "mickey mouse", "batman", "superman", "pokemon",
  "celebrity", "taylor swift", "elon musk", "donald trump", "biden",
];

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
}

export function validateContentSafety(text: string): SafetyCheckResult {
  const lower = text.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        allowed: false,
        reason: `Content contains restricted terms or copyrighted subjects ("${keyword}"). AdScene Studio strictly adheres to commercial brand safety standards.`,
      };
    }
  }
  return { allowed: true };
}

// Simple in-memory sliding window rate limiter
const ipRequestMap = new Map<string, number[]>();

export function checkRateLimit(ip: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = ipRequestMap.get(ip) || [];
  const validTimestamps = timestamps.filter((time) => now - time < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(now);
  ipRequestMap.set(ip, validTimestamps);
  return true;
}
