import { useTable, useSpacetimeDB } from "spacetimedb/react";
import { tables } from "../../module_bindings";
import { useEffect, useState } from "react";
import './UserRanking.css';

const START_OF_THE_MONTH = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);

function getMonthYearString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return `${year}年${month}月 排行榜`;
}

export function UserRanking() {
    const [uploads, uploadsReady] = useTable(tables.user_uploads.where(row => row.timestamp.gte(START_OF_THE_MONTH)));
    const [users, usersReady] = useTable(tables.user);
    const [ranking, setRanking] = useState<{ id: string; name: string; score: number; }[]>([]);
    const [rankingReady, setRankingReady] = useState(false);

    useEffect(() => {
        if(!uploadsReady || !usersReady) return;
        const scores = new Map<string, { name: string, score: number }>();

        for(let upload of uploads){
            let user = users.find(user => user.id.equals(upload.userId));
            if(!user) continue;
            if(upload.plantAnswerType !== upload.plantCorrectType) continue;
            let currentScore = (scores.get(upload.userId.toString())?.score ?? 0) + 1;
            scores.set(upload.userId.toString(), {
                name: user.name,
                score: currentScore
            });
        }
        const fresh_ranking = [];
        for (let [userId, record] of scores.entries()) {
            fresh_ranking.push({
                id: userId,
                name: record.name,
                score: record.score
            });
        }
        fresh_ranking.sort((a, b) => b.score - a.score);
        setRanking(fresh_ranking);
        setRankingReady(true);
    }, [uploadsReady, usersReady, uploads]);

    const { getConnection } = useSpacetimeDB();
    const conn = getConnection();
    const myIdentity = conn?.identity?.toHexString();

    if (!rankingReady) {
        return (
            <div className="ranking-loading">
                <div className="loading-spinner"></div>
                <p className="loading-text">加載排名中...</p>
            </div>
        );
    }

    const topThree = ranking.slice(0, 3);
    const myScore = ranking.find(r => r.id === myIdentity)?.score ?? 0;
    const myCorrect = uploads.filter(u => u.userId.toHexString?.() === myIdentity && u.plantAnswerType === u.plantCorrectType).length;
    const myIncorrect = uploads.filter(u => u.userId.toHexString?.() === myIdentity && u.plantAnswerType !== u.plantCorrectType).length;

    return (
        <div className="ranking-container">
            <h2 className="page-title">競賽模式</h2>
            <p className="ranking-subtitle">{getMonthYearString()}</p>

            {topThree.length > 0 && (
                <div className="podium-section">
                    {topThree[1] && (
                        <div className="podium-item">
                            <div className="podium-info">
                                <div className="podium-avatar">🌿</div>
                                <p className="podium-name">{topThree[1].name}</p>
                                <p className="podium-score">{topThree[1].score} 分</p>
                            </div>
                            <div className="podium-height podium-silver">
                                <span className="podium-medal">🥈</span>
                            </div>
                        </div>
                    )}

                    {topThree[0] && (
                        <div className="podium-item">
                            <div className="podium-info">
                                <div className="podium-avatar">🌿</div>
                                <p className="podium-name">{topThree[0].name}</p>
                                <p className="podium-score">{topThree[0].score} 分</p>
                            </div>
                            <div className="podium-height podium-gold">
                                <span className="podium-medal">🥇</span>
                            </div>
                        </div>
                    )}

                    {topThree[2] && (
                        <div className="podium-item">
                            <div className="podium-info">
                                <div className="podium-avatar">🌿</div>
                                <p className="podium-name">{topThree[2].name}</p>
                                <p className="podium-score">{topThree[2].score} 分</p>
                            </div>
                            <div className="podium-height podium-bronze">
                                <span className="podium-medal">🥉</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {ranking.length > 0 && (
                <div className="leaderboard-box">
                    {ranking.map((row, idx) => (
                        <div key={row.id} className={`leaderboard-row ${row.id === myIdentity ? 'leaderboard-user-row' : ''}`}>
                            <div className="leaderboard-left">
                                <span className="rank-index">{idx + 1}</span>
                                <span className="rank-avatar">🌿</span>
                                <span className="rank-name">{row.name}</span>
                            </div>
                            <span className="rank-score">{row.score} 分</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="ranking-stats">
                <p className="stats-label">我的本月成績</p>
                <p className="stats-score">{myScore} 分</p>
                <p className="stats-detail">答對 {myCorrect} / 答錯 {myIncorrect}</p>
            </div>

            {ranking.length === 0 && (
                <div className="ranking-empty">
                    <div className="empty-emoji">🌱</div>
                    <p className="empty-message">本月還沒有排名數據</p>
                </div>
            )}
        </div>
    );
}