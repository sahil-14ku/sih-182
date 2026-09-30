import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logAudit } from './auditLogs';

const router = Router();

// Demo users
const DEMO_USERS = [
  { id: 'demo-investigator', email: 'investigator@vasptrace.demo', password: 'demo1234', name: 'Demo Investigator', role: 'investigator', badge: 'INV-001' },
  { id: 'demo-admin', email: 'admin@vasptrace.demo', password: 'admin1234', name: 'Demo Admin', role: 'admin', badge: 'ADM-001' },
];

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vasptrace_demo_secret',
      { expiresIn: '7d' }
    );

    await logAudit({
      action: 'USER_LOGIN',
      userId: user.id,
      userRole: user.role,
      details: `User ${user.name} logged in successfully`,
      resourceType: 'Auth',
      severity: 'info',
    });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, badge: user.badge },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vasptrace_demo_secret') as { id: string; role: string };
    const user = DEMO_USERS.find(u => u.id === decoded.id);

    if (!user) return res.status(401).json({ success: false, error: 'User not found' });

    res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role, badge: user.badge } });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// POST /api/auth/demo-login — instant demo access
router.post('/demo-login', async (_req: Request, res: Response) => {
  const user = DEMO_USERS[0];
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'vasptrace_demo_secret',
    { expiresIn: '7d' }
  );
  res.json({
    success: true,
    data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, badge: user.badge } },
    message: 'Demo session started. All data is synthetic.',
  });
});

export default router;
