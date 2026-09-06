/**
 * Render & Cloud Server Keep-Alive Utility
 * Prevents free-tier cloud platforms (e.g., Render, Railway) from idling/sleeping.
 * Automatically sends an HTTP ping to /health or /api/health every 10 minutes infinitely.
 */

export const initKeepAlive = (port = 5001) => {
  // 10 minutes interval (Render idles after 15 mins of inactivity)
  const PING_INTERVAL_MS = 10 * 60 * 1000;

  const getTargetUrl = () => {
    // Render automatically injects RENDER_EXTERNAL_URL in production (e.g. https://your-service.onrender.com)
    const baseUrl =
      process.env.RENDER_EXTERNAL_URL ||
      process.env.SERVER_URL ||
      process.env.BACKEND_URL ||
      `http://localhost:${port}`;

    return `${baseUrl.replace(/\/+$/, '')}/health`;
  };

  const pingHealth = async () => {
    const url = getTargetUrl();
    try {
      const start = Date.now();
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CampusCircuit-Render-KeepAlive/1.0',
          'Accept': 'application/json'
        }
      });
      const latency = Date.now() - start;
      console.log(
        `[Keep-Alive 💓] Request sent to ${url} | Status: ${response.status} (${response.statusText}) | Latency: ${latency}ms | Time: ${new Date().toLocaleTimeString('en-IN')}`
      );
    } catch (err) {
      console.warn(`[Keep-Alive ⚠️] Error pinging ${url}:`, err.message);
    }
  };

  console.log(
    `[Keep-Alive 🚀] Automated 10-minute ping worker initialized (Target: ${getTargetUrl()}). Preventing server spindown indefinitely.`
  );

  // Initial ping 15 seconds after server startup
  const initialTimer = setTimeout(pingHealth, 15 * 1000);
  if (initialTimer.unref) initialTimer.unref();

  // Infinite recurring interval every 10 minutes
  const interval = setInterval(pingHealth, PING_INTERVAL_MS);
  if (interval.unref) interval.unref();

  return interval;
};
