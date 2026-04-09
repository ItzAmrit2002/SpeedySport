import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { db } from "../db/db.js";
import { getMatchStatus } from "../utils/match-status.js";
import { matches } from "../db/schema.js";
import { desc } from "drizzle-orm";

const matchRouter = Router();
const MAX_LIMIT = 100;
matchRouter.get("/", async(req, res) => {
  const parsed =listMatchesQuerySchema.safeParse(req.query)
  if(!parsed.success){
    return res.status(400).json({ error: parsed.error.message, details: JSON.stringify(parsed.error) });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit);
    res.status(200).json({data});
  } catch (error) {
    res.status(500).json({ error: error.message, details: JSON.stringify(error) });
  }
});

matchRouter.post("/", async(req, res) => {
  const parsed = createMatchSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message, details: JSON.stringify(parsed.error) });
  }
  try {
    const [match] = await db.insert(matches).values({
        ...parsed.data,
        startTime: new Date(parsed.data.startTime),
        endTime: new Date(parsed.data.endTime),
        homeScore: parsed.data.homeScore ?? 0,
        awayScore: parsed.data.awayScore ?? 0,
        status: getMatchStatus(parsed.data.startTime, parsed.data.endTime),
    }).returning();
    res.status(201).json({data: match});
    } catch (error) {
      res.status(500).json({ error: error.message, details: JSON.stringify(error) });
    }
  },
);

export default matchRouter;