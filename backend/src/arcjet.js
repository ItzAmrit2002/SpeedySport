import arcjet, {detectBot, shield, slidingWindow} from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE;

export const httpArcjet = arcjetKey ? arcjet({
    key: arcjetKey,
    rules: [
        shield({mode: arcjetMode}),
        detectBot({mode:arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW']}),
        slidingWindow({mode: arcjetMode, max:50, interval:'10s'})
    ]
}) : null

export const wsArcjet = arcjetKey ? arcjet({
    key: arcjetKey,
    rules: [
        shield({mode: arcjetMode}),
        detectBot({mode:arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW']}),
        slidingWindow({mode: arcjetMode, max:5, interval:'2s'})
    ]
}) : null

export function securityMiddleware(){
    return async(req,res,next) => {
        if(!httpArcjet){
            return next();
        }

        try {
            const decision = await httpArcjet.protect(req)

            if (decision.isDenied()) {
                if (decision.reason.isRateLimit()) {
                    return res.status(429).json({ error: "Too many requests" });
                }
                return res.status(403).json({ error: "Forbidden" });
            }
        } catch (error) {
            console.error("Security check failed:", error);
            return res.status(500).json({error: "Internal server error"});
        }
        next();
    };
}