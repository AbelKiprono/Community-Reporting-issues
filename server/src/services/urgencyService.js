// Urgency formula — transparent, auditable, defensible in your defense
// score = category.baseWeight
//       + (upvotes * 2)
//       + (mlUrgencyHint multiplier)
//       + (age bonus: +3 if older than 7 days)
//
// mlUrgencyHint values: 'immediate danger or emergency' = 10
//                       'urgent but not life-threatening' = 5
//                       'routine maintenance' = 0
//                       null (not present) = 0

function computeUrgency({ baseWeight, upvotes = 0, mlUrgencyHint = null, createdAt = new Date() }) {
  let score = baseWeight || 1;
  score += upvotes * 2;

  if (mlUrgencyHint === 'immediate danger or emergency') score += 10;
  else if (mlUrgencyHint === 'urgent but not life-threatening') score += 5;

  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays > 7) score += 3;

  return Math.round(score);
}

module.exports = { computeUrgency };