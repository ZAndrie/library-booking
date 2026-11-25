import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import User, { UserRole } from '@/backend/models/User';
import { findDevUserByIdentifier } from '@/backend/database/devStore';
import { comparePassword, signToken, getCurrentUser } from '@/backend/auth/jwt';

async function tryConnectDb(): Promise<boolean> {
  try {
    await connectToDatabase();
    return true;
  } catch (err: any) {
    console.warn('tryConnectDb notice:', err?.message || err);
    return false;
  }
}

export async function handleLogin(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.username || body.email || body.identifier || '').trim();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const hasDb = await tryConnectDb();
    let sessionUser: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      employeeId: string;
    } | null = null;

    if (hasDb) {
      const user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { employeeId: identifier.toUpperCase() },
          { name: { $regex: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        ],
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Account has been deactivated. Please contact an administrator.' },
          { status: 403 }
        );
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      sessionUser = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        employeeId: user.employeeId,
      };
    } else {
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        return NextResponse.json(
          { error: 'Database is temporarily unreachable. Please ensure MongoDB Atlas Network Access allows IP 0.0.0.0/0.' },
          { status: 503 }
        );
      }

      // Offline / Local Development Fallback
      console.log('MongoDB is offline. Verifying login using local dev store...');
      const devUser = findDevUserByIdentifier(identifier);
      if (!devUser) {
        return NextResponse.json(
          {
            error:
              'No account found with this email. Contact a Library Administrator to provision your account.',
          },
          { status: 401 }
        );
      }

      const isMatch = await comparePassword(password, devUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Invalid username/email or password' },
          { status: 401 }
        );
      }

      sessionUser = {
        id: devUser.id,
        name: devUser.name,
        email: devUser.email,
        role: devUser.role,
        employeeId: devUser.employeeId,
      };
    }

    const token = signToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      storageMode: hasDb ? 'mongodb' : 'local_dev_store',
    });

    response.cookies.set('staff_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function handleLogout() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('staff_auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  return response;
}

export async function handleGetCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
