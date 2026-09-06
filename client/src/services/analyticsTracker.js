// Client-side live visitor heartbeat & analytics tracker
const VISITOR_STORAGE_KEY = 'campuscircuit_visitor_id';

export const getOrCreateVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!id) {
      id = 'cc_vis_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(VISITOR_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'cc_vis_fallback_' + Date.now();
  }
};

export const detectDevice = () => {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return 'Mobile';
  return 'Desktop';
};

export const pingAnalytics = async (customPage) => {
  try {
    const visitorId = getOrCreateVisitorId();
    const page = customPage || window.location.pathname || '/';
    const device = detectDevice();

    let browser = 'Chrome';
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';

    let os = 'Unknown';
    if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    const payload = {
      visitorId,
      page,
      device,
      browser,
      os,
      referrer: document.referrer || ''
    };

    await fetch('/api/analytics/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Silent fail for non-blocking telemetry
    console.debug('Analytics ping notice:', err);
  }
};

export const initAnalyticsHeartbeat = () => {
  // Ping immediately
  pingAnalytics();

  // Ping every 25 seconds to keep active status fresh
  const intervalId = setInterval(() => {
    pingAnalytics();
  }, 25000);

  return () => clearInterval(intervalId);
};
