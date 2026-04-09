import { MATCH_STATUS } from '../validation/matches.js';

export function getMatchStatus(startTime, endTime, now = new Date()) {
    if (startTime == null) {
        return null;
    }

    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) {
        return null;
    }

    // End time is optional; if missing, the match can't be finished.
    const end = endTime == null ? null : new Date(endTime);
    if (end && Number.isNaN(end.getTime())) return null;

    if (now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (end && now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(match, updateStatus) {
    const nextStatus = getMatchStatus(match.startTime, match.endTime);
    if (!nextStatus) {
        return match.status;
    }
    if (match.status !== nextStatus) {
        await updateStatus(nextStatus);
        match.status = nextStatus;
    }
    return match.status;
}