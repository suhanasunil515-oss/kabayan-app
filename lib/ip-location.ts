import { NextRequest } from 'next/server';

export async function getLocationFromIP(ip: string) {
  try {
    // Remove localhost/private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        city: 'Local',
        country: 'Development',
        ip: ip || 'Unknown'
      };
    }

    // Try ip-api.com first (free, no API key)
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,query`, {
        timeout: 3000
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          city: data.city || 'Unknown',
          region: data.regionName || '',
          country: data.country || 'Unknown',
          isp: data.isp || 'Unknown',
          ip: data.query
        };
      }
    } catch (e) {
      console.log('[v0] ip-api.com failed');
    }

    // Return basic info if all APIs fail
    return {
      city: 'Unknown',
      country: 'Unknown',
      ip: ip || 'Unknown'
    };
  } catch (error) {
    console.error('[v0] IP Geolocation error:', error);
    return {
      city: 'Unknown',
      country: 'Unknown',
      ip: ip || 'Unknown'
    };
  }
}

export function getClientIP(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'Unknown';
}
