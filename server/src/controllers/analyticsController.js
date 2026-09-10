import { Visitor } from '../models/Visitor.js';

/**
 * Determine genuine rough location based on real deployment reverse-proxy headers
 * or explicit client hint. If local/development IP, mark honestly as Localhost / Dev.
 */
const resolveRoughLocation = (req, ip, locationHint) => {
  // 1. Check real reverse-proxy / CDN headers (Cloudflare, Vercel, AWS CloudFront)
  const cfCity = req.headers['cf-ipcity'];
  const cfRegion = req.headers['cf-region'] || req.headers['cf-region-code'];
  const cfCountry = req.headers['cf-ipcountry'];

  if (cfCity || cfCountry) {
    return {
      city: cfCity || 'India Hub',
      region: cfRegion || '',
      country: cfCountry || 'India',
      countryCode: cfCountry || 'IN',
      isLocal: false
    };
  }

  const vercelCity = req.headers['x-vercel-ip-city'];
  const vercelRegion = req.headers['x-vercel-ip-country-region'];
  const vercelCountry = req.headers['x-vercel-ip-country'];

  if (vercelCity || vercelCountry) {
    return {
      city: vercelCity || 'India Hub',
      region: vercelRegion || '',
      country: vercelCountry || 'India',
      countryCode: vercelCountry || 'IN',
      isLocal: false
    };
  }

  // 2. Client-provided explicit location hint if present and genuine
  if (locationHint && locationHint.city && locationHint.city !== 'Unknown' && locationHint.city !== 'Localhost') {
    return {
      city: locationHint.city,
      region: locationHint.region || '',
      country: locationHint.country || 'India',
      countryCode: locationHint.countryCode || 'IN',
      isLocal: false
    };
  }

  // 3. Localhost / Private Subnet detection (Pre-deployment dev testing)
  const isPrivateIp = !ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
  if (isPrivateIp) {
    return {
      city: 'Localhost',
      region: 'Development',
      country: 'Local',
      countryCode: 'DEV',
      isLocal: true
    };
  }

  // 4. Public IP when deployed, but headers were omitted
  return {
    city: 'Public Web',
    region: 'India',
    country: 'India',
    countryCode: 'IN',
    isLocal: false
  };
};

// POST /api/analytics/ping (Heartbeat from visitors)
export const pingVisitor = async (req, res) => {
  try {
    const {
      visitorId,
      page = '/',
      device = 'Desktop',
      browser = 'Chrome',
      os = 'macOS',
      referrer = '',
      locationHint
    } = req.body;

    if (!visitorId) {
      return res.status(400).json({ success: false, message: 'visitorId is required' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
    const location = resolveRoughLocation(req, ip, locationHint);

    const now = new Date();

    await Visitor.findOneAndUpdate(
      { visitorId },
      {
        $set: {
          ip,
          city: location.city,
          region: location.region,
          country: location.country,
          countryCode: location.countryCode,
          device: ['Desktop', 'Mobile', 'Tablet'].includes(device) ? device : 'Desktop',
          browser,
          os,
          currentPage: page,
          referrer,
          lastActive: now
        },
        $inc: { totalVisits: 1 },
        $setOnInsert: { firstSeen: now }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Real live users count (active within last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const liveUsersCount = await Visitor.countDocuments({ lastActive: { $gte: twoMinutesAgo } });
    const totalVisitorsCount = await Visitor.countDocuments();

    res.status(200).json({
      success: true,
      liveUsersCount,
      totalVisitorsCount
    });
  } catch (error) {
    console.error('Analytics ping error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/live (Protected: All Admins & Master Admin)
export const getLiveAnalytics = async (req, res) => {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // 1. Live Users Count (active in last 2 mins - 100% real, no artificial minimum)
    const liveUsersCount = await Visitor.countDocuments({ lastActive: { $gte: twoMinutesAgo } });

    // 2. Total unique visitors in database
    const totalVisitorsCount = await Visitor.countDocuments();

    // 3. Aggregated Total Visits / Interactions
    const visitsAgg = await Visitor.aggregate([
      { $group: { _id: null, totalPageViews: { $sum: '$totalVisits' } } }
    ]);
    const totalPageViews = visitsAgg[0]?.totalPageViews || totalVisitorsCount;

    // 4. Active & Recent Visitors List (last 15 mins or latest 25)
    const recentVisitors = await Visitor.find({ lastActive: { $gte: fifteenMinutesAgo } })
      .sort({ lastActive: -1 })
      .limit(25)
      .lean();

    // Map visitors with live flag
    const formattedVisitors = recentVisitors.map(v => ({
      visitorId: v.visitorId,
      roughLocation: v.city === 'Localhost' ? 'Localhost (Dev)' : `${v.city}, ${v.region || v.country}`,
      city: v.city,
      region: v.region,
      country: v.country,
      countryCode: v.countryCode,
      device: v.device,
      currentPage: v.currentPage,
      lastActive: v.lastActive,
      isLive: new Date(v.lastActive) >= twoMinutesAgo,
      totalVisits: v.totalVisits
    }));

    // 5. Geographic Breakdown (Top cities by visitor count)
    const locationAgg = await Visitor.aggregate([
      {
        $group: {
          _id: { city: '$city', region: '$region', country: '$country' },
          count: { $sum: 1 },
          liveCount: {
            $sum: {
              $cond: [{ $gte: ['$lastActive', twoMinutesAgo] }, 1, 0]
            }
          }
        }
      },
      { $sort: { liveCount: -1, count: -1 } },
      { $limit: 8 }
    ]);

    const topLocations = locationAgg.map(item => ({
      location: item._id.city === 'Localhost' ? 'Localhost (Dev)' : `${item._id.city}, ${item._id.region || item._id.country}`,
      city: item._id.city,
      region: item._id.region,
      country: item._id.country,
      totalVisitors: item.count,
      liveVisitors: item.liveCount
    }));

    // 6. Device breakdown
    const deviceAgg = await Visitor.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);
    const deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0 };
    deviceAgg.forEach(d => {
      if (d._id && deviceStats[d._id] !== undefined) {
        deviceStats[d._id] = d.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        liveUsersCount,
        totalVisitorsCount,
        totalPageViews,
        recentVisitors: formattedVisitors,
        topLocations,
        deviceStats
      }
    });
  } catch (error) {
    console.error('Get live analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/analytics/reset (Protected: Clear pre-deployment / test data)
export const resetAnalytics = async (req, res) => {
  try {
    const result = await Visitor.deleteMany({});
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} test/pre-deployment visitor records. Live Radar is now completely fresh for real traffic.`
    });
  } catch (error) {
    console.error('Reset analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
