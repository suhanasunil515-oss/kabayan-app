import { NextRequest, NextResponse } from 'next/server';
import { registerUser, loginUser } from '@/lib/db-operations';
import { getClientIP } from '@/lib/ip-location';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    let body: { action?: string; phoneNumber?: string; password?: string; fullName?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    const { action, phoneNumber, password, fullName } = body;

    if (action === 'register') {
      // Validate inputs
      if (!phoneNumber || !password || !fullName) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      const result = await registerUser(phoneNumber, password, fullName);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      // Capture IP and location at registration so admin can see user area
      const { getLocationFromIP } = await import('@/lib/ip-location');
      const clientIp = getClientIP(req);
      const location = await getLocationFromIP(clientIp);
      const registrationLocation =
        location.city !== 'Unknown' || location.country !== 'Unknown'
          ? [location.city, location.region, location.country].filter(Boolean).join(', ')
          : `Unknown, IP: ${clientIp}`;
      await supabaseAdmin
        .from('users')
        .update({
          ip_address: clientIp,
          city: location.city !== 'Unknown' ? location.city : null,
          country: location.country !== 'Unknown' ? location.country : null,
          registration_location: registrationLocation,
        })
        .eq('id', result.data.id);

      // Don't return password hash
      const { password_hash, ...userWithoutPassword } = result.data;
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      });
    }

    if (action === 'login') {
      if (!phoneNumber || !password) {
        return NextResponse.json(
          { error: 'Missing phone number or password' },
          { status: 400 }
        );
      }
      const trimmedPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
      const trimmedPassword = typeof password === 'string' ? password.trim() : '';
      const result = await loginUser(trimmedPhone, trimmedPassword);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 401 }
        );
      }

      // Track login with the real client IP (so geolocation is correct)
      const clientIp = getClientIP(req);
      fetch(new URL('/api/track-login', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: result.data.id, clientIp }),
      }).catch(err => console.error('Failed to track login:', err));

      // Create session cookie
      const response = NextResponse.json({
        success: true,
        user: {
          id: result.data.id,
          phone_number: result.data.phone_number,
          full_name: result.data.full_name,
          credit_score: result.data.credit_score,
          wallet_balance: result.data.wallet_balance,
        },
      });

      // Store user ID in session (you can expand this with proper JWT)
      response.cookies.set({
        name: 'user_id',
        value: result.data.id.toString(),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
