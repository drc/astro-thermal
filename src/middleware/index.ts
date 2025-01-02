import { defineMiddleware } from "astro:middleware";

const rateLimit = new Map();

export const onRequest = defineMiddleware((context, next) => {
    const windowMs = 30 * 1000;
    const limit = 3;
    const { request } = context;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    const userLimit = rateLimit.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > userLimit.resetTime) {
        userLimit.count = 1;
        userLimit.resetTime = now + windowMs;
    } else {
        userLimit.count++;
    }

    rateLimit.set(ip, userLimit);

    console.log(rateLimit);
    if (userLimit.count > limit) {
        return new Response(JSON.stringify({ error: "Too many requests" }), {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": "" + Math.ceil((userLimit.resetTime - now) / 1000),
            },
        });
    }
    return next();
});
