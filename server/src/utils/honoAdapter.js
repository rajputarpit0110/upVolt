/**
 * Hono <-> Express Request/Response Adapter
 * Allows existing controllers to run on Hono without changing any business logic.
 */
export const adaptHandler = (handler) => {
  return async (c, next) => {
    // 1. Parse body for mutation methods
    let body = {};
    const method = c.req.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const contentType = c.req.header('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          body = await c.req.json();
        } catch {
          body = {};
        }
      } else if (
        contentType.includes('application/x-www-form-urlencoded') ||
        contentType.includes('multipart/form-data')
      ) {
        try {
          body = await c.req.parseBody();
        } catch {
          body = {};
        }
      }
    }

    // 2. Normalize headers map
    const headers = {};
    if (c.req.raw && c.req.raw.headers) {
      for (const [k, v] of c.req.raw.headers.entries()) {
        headers[k.toLowerCase()] = v;
      }
    }

    // 3. Construct req wrapper
    const req = {
      params: c.req.param(),
      query: c.req.query(),
      body: body || {},
      headers,
      user: c.get('user'),
      socket: {
        remoteAddress: headers['x-forwarded-for']?.split(',')[0].trim() || '127.0.0.1'
      },
      get(name) {
        return headers[name.toLowerCase()] || c.req.header(name);
      }
    };

    // 4. Construct res wrapper
    let responseObj = null;
    let statusCode = 200;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      get statusCode() {
        return statusCode;
      },
      set statusCode(code) {
        statusCode = code;
      },
      json(data) {
        responseObj = c.json(data, statusCode);
        return responseObj;
      },
      send(data) {
        if (typeof data === 'object' && data !== null) {
          responseObj = c.json(data, statusCode);
        } else {
          responseObj = c.text(String(data), statusCode);
        }
        return responseObj;
      },
      setHeader(name, value) {
        c.header(name, value);
        return this;
      }
    };

    // 5. Call controller handler
    const result = await handler(req, res, next);

    if (result instanceof Response) {
      return result;
    }

    if (responseObj) {
      return responseObj;
    }

    return c.body(null, statusCode);
  };
};
