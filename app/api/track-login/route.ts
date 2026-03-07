import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientIP, getLocationFromIP } from '@/lib/ip-location';

export async function POST(req: NextRequest) {
  try {
    const { userId, clientIp: bodyIp } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Use client IP from request body (set by auth when user logs in) so we get the real user IP, not server
    const ipAddress = bodyIp && typeof bodyIp === 'string' ? bodyIp : getClientIP(req);
    const location = await getLocationFromIP(ipAddress);
    
    // Format location string: e.g. "Manila, Metro Manila, Philippines" or "Manila, Philippines"
    let locationString = 'Unknown';
    if (location.city !== 'Unknown' || location.country !== 'Unknown') {
      const parts = [location.city, (location as { region?: string }).region, location.country].filter(Boolean);
      locationString = parts.join(', ');
    } else {
      locationString = `Unknown, IP: ${ipAddress}`;
    }

    // Update ONLY the new columns we added
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        last_login_ip: ipAddress,
        last_login_location: locationString,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[v0] Track login error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[v0] Tracked login for user ${userId}: ${locationString}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Track login error:', error);
    return NextResponse.json({ error: 'Failed to track login' }, { status: 500 });
  }
}
