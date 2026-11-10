import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/backend/database/db';
import User, { UserRole } from '@/backend/models/User';
import {
  findDevUserByEmail,
  findDevUserByEmployeeId,
  createDevUser,
} from '@/backend/database/devStore';
import { comparePassword, hashPassword, signToken, getCurrentUser } from '@/backend/auth/jwt';

async function tryConnectDb(): Promise<boolean> {
  try {
    await connectToDatabase();
    return true;
  } catch {
    return false;
  }
}

export async function handleLogin(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
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
      const user = await User.findOne({ email: email.toLowerCase().trim() });
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
      // Offline / Local Development Fallback
      console.log('MongoDB is offline. Verifying login using local dev store...');
      const devUser = findDevUserByEmail(email);
      if (!devUser) {
        return NextResponse.json(
          {
            error:
              'No account found with this email. Please click "Register New Account" to create your Staff, Admin, or Super Admin account.',
          },
          { status: 401 }
        );
      }

      const isMatch = await comparePassword(password, devUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
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

export async function handleRegister(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, employeeId, password, role } = body;

    if (!name || !email || !employeeId || !password || !role) {
      return NextResponse.json(
        { error: 'Full name, email, staff/employee ID, password, and role are required.' },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ['staff', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role selected. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedEmpId = employeeId.toUpperCase().trim();
    const passwordHash = await hashPassword(password);

    const hasDb = await tryConnectDb();
    let sessionUser: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      employeeId: string;
    };

    if (hasDb) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return NextResponse.json(
          { error: `An account with email ${normalizedEmail} is already registered.` },
          { status: 400 }
        );
      }

      const existingEmpId = await User.findOne({ employeeId: normalizedEmpId });
      if (existingEmpId) {
        return NextResponse.json(
          { error: `An account with Staff/Employee ID ${normalizedEmpId} already exists.` },
          { status: 400 }
        );
      }

      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        employeeId: normalizedEmpId,
        role: role as UserRole,
        passwordHash,
        isActive: true,
      });

      sessionUser = {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserRole,
        employeeId: newUser.employeeId,
      };
    } else {
      // Local Dev Store Fallback
      console.log('MongoDB is offline. Saving registered user to local dev store...');
      const existingEmail = findDevUserByEmail(normalizedEmail);
      if (existingEmail) {
        return NextResponse.json(
          { error: `An account with email ${normalizedEmail} is already registered.` },
          { status: 400 }
        );
      }

      const existingEmpId = findDevUserByEmployeeId(normalizedEmpId);
      if (existingEmpId) {
        return NextResponse.json(
          { error: `An account with Staff/Employee ID ${normalizedEmpId} already exists.` },
          { status: 400 }
        );
      }

      const devUser = createDevUser({
        name,
        email: normalizedEmail,
        employeeId: normalizedEmpId,
        role,
        passwordHash,
      });

      sessionUser = {
        id: devUser.id,
        name: devUser.name,
        email: devUser.email,
        role: devUser.role,
        employeeId: devUser.employeeId,
      };
    }

    const token = signToken(sessionUser);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully',
        user: sessionUser,
        storageMode: hasDb ? 'mongodb' : 'local_dev_store',
      },
      { status: 201 }
    );

    response.cookies.set('staff_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
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
