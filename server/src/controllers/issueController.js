const prisma = require('../config/db');
const { computeUrgency } = require('../services/urgencyService');

exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, categoryId, lat, lng, addressText, mlCategoryHint, mlUrgencyHint } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Location (lat, lng) is required' });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    let baseWeight = 1;
    let catId = null;
    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: parseInt(categoryId) } });
      if (!cat) return res.status(400).json({ error: 'Invalid category' });
      baseWeight = cat.baseWeight;
      catId = cat.id;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const urgencyScore = computeUrgency({ baseWeight, mlUrgencyHint });

    const issue = await prisma.issue.create({
      data: {
        userId: req.user.id,
        categoryId: catId,
        title,
        description,
        imageUrl,
        lat: latNum,
        lng: lngNum,
        addressText: addressText || null,
        status: 'pending',
        urgencyScore,
        mlCategoryHint: mlCategoryHint || null,
        mlUrgencyHint: mlUrgencyHint || null,
      },
      include: { category: true, user: { select: { id: true, fullName: true } } },
    });

    res.status(201).json(issue);
  } catch (err) { next(err); }
};

exports.getIssues = async (req, res, next) => {
  try {
    const { status, categoryId, sort } = req.query;
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);

    let orderBy = { createdAt: 'desc' };
    if (sort === 'urgency') orderBy = [{ urgencyScore: 'desc' }, { createdAt: 'asc' }];

    const issues = await prisma.issue.findMany({
      where,
      orderBy,
      include: {
        category: true,
        user: { select: { id: true, fullName: true } },
      },
    });
    res.json(issues);
  } catch (err) { next(err); }
};

exports.getMyIssues = async (req, res, next) => {
  try {
    const issues = await prisma.issue.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    res.json(issues);
  } catch (err) { next(err); }
};

exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        user: { select: { id: true, fullName: true } },
        history: { include: { admin: { select: { fullName: true } } }, orderBy: { changedAt: 'desc' } },
      },
    });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const allowed = ['pending', 'in_progress', 'acted_on', 'not_done'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use: ' + allowed.join(', ') });
    }

    const issueId = parseInt(req.params.id);
    const existing = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!existing) return res.status(404).json({ error: 'Issue not found' });

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: { status, adminNote: note || null },
    });

    await prisma.statusHistory.create({
      data: {
        issueId,
        oldStatus: existing.status,
        newStatus: status,
        changedBy: req.user.id,
        note: note || null,
      },
    });

    res.json(updated);
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const [total, pending, inProgress, actedOn, notDone, byCategory] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'pending' } }),
      prisma.issue.count({ where: { status: 'in_progress' } }),
      prisma.issue.count({ where: { status: 'acted_on' } }),
      prisma.issue.count({ where: { status: 'not_done' } }),
      prisma.category.findMany({
        include: { _count: { select: { issues: true } } },
      }),
    ]);

    res.json({
      total,
      byStatus: { pending, in_progress: inProgress, acted_on: actedOn, not_done: notDone },
      byCategory: byCategory.map(c => ({ id: c.id, name: c.name, count: c._count.issues })),
    });
  } catch (err) { next(err); }
};