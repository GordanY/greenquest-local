import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "../../module_bindings";
import { useEffect, useMemo, useState } from "react";
import type { Identity } from "spacetimedb";

const START_OF_THE_MONTH = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);

export function UserRanking() {
    // calculate the start of this month
    const [uploads, uploadsReady] = useTable(tables.user_uploads.where(row => row.timestamp.gte(START_OF_THE_MONTH)));
    const [users, usersReady] = useTable(tables.user);
    const [ranking, setRanking] = useState<{ id: string; name: string; score: number; }[]>([]); // {id, name, score}
    const [rankingReady, setRankingReady] = useState(false);

    useEffect(() => {
        if(!uploadsReady || !usersReady) return;
        const scores = new Map<string, { name: string, score: number }>();

        for(let upload of uploads){
            let user = users.find(user => user.id.equals(upload.userId));
            if(!user) continue;
            if(upload.plantAnswerType!==upload.plantCorrectType) continue;
            let currentScore = (scores.get(upload.userId.toString())?.score ?? 0) + 1;
            scores.set(upload.userId.toString(), {
                name: user.name,
                score: currentScore
            });
        }
        const fresh_ranking = [];
        for (let [userId, record] of scores.entries()) {
            fresh_ranking.push({
                id: userId.toString(),
                name: record.name,
                score: record.score
            });
        }
        fresh_ranking.sort((a, b) => b.score - a.score);
        setRanking(fresh_ranking);
        setRankingReady(true);
    }, [uploadsReady, usersReady, uploads]);

    if (!rankingReady) {
        return (<div>加載中...</div>);
    }
    return (<div>{JSON.stringify(ranking)}</div>);
}