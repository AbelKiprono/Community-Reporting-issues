const URGENCY_KEYWORDS = {
  'death': 10, 'dead': 10, 'injury': 10, 'injured': 10, 'accident': 10,
  'fire': 10, 'electric shock': 10, 'live wire': 10, 'collapse': 10,
  'drowning': 10, 'flood': 10, 'emergency': 10, 'explosion': 10,
  'danger': 5, 'dangerous': 5, 'severe': 5, 'urgent': 5,
  'theft': 5, 'stolen': 5, 'robbed': 5, 'attack': 5, 'threat': 5,
  'broken': 5, 'overflowing': 5, 'blocked': 5, 'deep': 5,
  'exposed': 5, 'falling': 5,
  'pothole': 2, 'garbage': 2, 'leak': 2, 'dirty': 2,
  'crack': 2, 'damaged': 2, 'noise': 2, 'rubbish': 2, 'litter': 2,
};

export function classifyUrgency(text) {
  if (!text || text.trim().length < 3) {
    return { level: 'routine maintenance', score: 0, matches: [] };
  }
  const lower = text.toLowerCase();
  let score = 0;
  const matches = [];
  for (const [keyword, weight] of Object.entries(URGENCY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      score += weight;
      matches.push({ keyword, weight });
    }
  }
  let level;
  if (score >= 10) level = 'immediate danger or emergency';
  else if (score >= 5) level = 'urgent but not life-threatening';
  else level = 'routine maintenance';
  return { level, score, matches };
}

export function levelColor(level) {
  if (level === 'immediate danger or emergency') return 'bg-red-100 text-red-800 border-red-300';
  if (level === 'urgent but not life-threatening') return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-green-100 text-green-800 border-green-300';
}

export function levelEmoji(level) {
  if (level === 'immediate danger or emergency') return '🔴';
  if (level === 'urgent but not life-threatening') return '🟠';
  return '🟢';
}