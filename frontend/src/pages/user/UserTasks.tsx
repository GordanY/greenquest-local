import { useState, useMemo } from 'react';
import { tables, reducers } from '../../module_bindings';
import { useReducer, useTable } from 'spacetimedb/react';
import { Modal } from '../../components/Modal';
import './UserTasks.css';

interface Mission {
  id: string;
  icon: string;
  name: string;
  reward: number;
  requiredCategory: string | null;
}

const MISSIONS: Mission[] = [
  { id: 'dailyChallenge', icon: '🎯', name: '每日完成一次挑戰', reward: 20, requiredCategory: null },
  { id: 'challengeNonVascular', icon: '🌿', name: '挑戰：辨識非維管植物', reward: 15, requiredCategory: '非維管植物' },
  { id: 'challengeVascular', icon: '🌱', name: '挑戰：辨識維管植物', reward: 15, requiredCategory: '維管植物' },
  { id: 'challengeSeedless', icon: '🍃', name: '挑戰：辨識無種子植物', reward: 15, requiredCategory: '無種子植物' },
  { id: 'challengeSeeded', icon: '🌰', name: '挑戰：辨識種子植物', reward: 15, requiredCategory: '種子植物' },
  { id: 'challengeNonFlowering', icon: '🌲', name: '挑戰：辨識無花植物', reward: 15, requiredCategory: '無花植物' },
  { id: 'challengeFlowering', icon: '🌸', name: '挑戰：辨識有花植物', reward: 15, requiredCategory: '有花植物' },
  { id: 'challengeSingleLeaf', icon: '🌸', name: '挑戰：辨識單子葉植物', reward: 15, requiredCategory: '單子葉植物' },
  { id: 'challengeDoubleLeaf', icon: '🌸', name: '挑戰：辨識雙子葉植物', reward: 15, requiredCategory: '雙子葉植物' },
];

interface UserTasksProps {
  onBack: () => void;
}

export function UserTasks({ onBack }: UserTasksProps) {
  const [userUploads] = useTable(tables.user_uploads);
  const [missionClaims] = useTable(tables.get_my_mission_claims);
  const [claimModal, setClaimModal] = useState<{ type: 'success' | 'error'; title: string; message: string; reward?: number } | null>(null);
  const claimDailyMission = useReducer(reducers.claimDailyMission);

  // Compute today's UTC date string
  const todayStr = new Date().toISOString().slice(0, 10);

  // Client-side validation helper
  const validateMissionCompletion = (mission: Mission): boolean => {
    // Only validate if mission has a category requirement
    if (mission.requiredCategory === null) {
      // dailyChallenge: any upload today counts
      return userUploads.some(upload => {
        const uploadDate = new Date(upload.timestamp).toISOString().slice(0, 10);
        return uploadDate === todayStr;
      });
    }

    // Category-specific missions: require matching plantCorrectType
    return userUploads.some(upload => {
      const uploadDate = new Date(upload.timestamp).toISOString().slice(0, 10);
      if (uploadDate !== todayStr) return false;
      return upload.plantCorrectType === mission.requiredCategory;
    });
  };

  // Client-side validation: check if reward is claimed
  const validateMissionClaimed = (missionId: string): boolean => {
    // Query claims from server view
    console.log(`validateMissionClaimed: ${missionClaims}`);
    const claim = missionClaims.find(claim =>
      claim.missionId === missionId && claim.claimDate === todayStr
    );
    return !!claim;
  };

  // Derive mission completion status
  const missionStatus = useMemo(() => {
    const status: Record<string, { isCompleted: boolean; isClaimed: boolean; claimId?: bigint }> = {};

    MISSIONS.forEach(mission => {
      const isCompleted = validateMissionCompletion(mission);
      const isClaimed = validateMissionClaimed(mission.id);
      const claimRecord = missionClaims.find(claim =>
        claim.missionId === mission.id && claim.claimDate === todayStr
      );

      status[mission.id] = {
        isCompleted,
        isClaimed,
        claimId: claimRecord?.id
      };
    });

    return status;
  }, [userUploads, missionClaims, todayStr]);

  const handleClaimMission = async (missionId: string) => {
    // Client-side validation before sending to server
    const mission = MISSIONS.find(m => m.id === missionId);
    if (!mission) {
      setClaimModal({
        type: 'error',
        title: '錯誤',
        message: '找不到該任務'
      });
      return;
    }

    const status = missionStatus[missionId];

    // Verify completion
    if (!status || !status.isCompleted) {
      setClaimModal({
        type: 'error',
        title: '任務未完成',
        message: '請先完成任務才能領取獎勵'
      });
      return;
    }

    // Verify not already claimed
    if (status.isClaimed) {
      setClaimModal({
        type: 'error',
        title: '已領取',
        message: '您已經在今天領取過此獎勵'
      });
      return;
    }

    try {
      await claimDailyMission({ missionId });

      setClaimModal({
        type: 'success',
        title: '🎉',
        message: `獲得 ${mission.reward} 🌿！`,
        reward: mission.reward
      });
      setTimeout(() => setClaimModal(null), 2500);
    } catch (error: any) {
      setClaimModal({
        type: 'error',
        title: '領取失敗',
        message: String(error)
      });
      setTimeout(() => setClaimModal(null), 2000);
    }
  };

  return (
    <div className="user-tasks-container">
      <div className="tasks-header">
        <h2>任務中心</h2>
      </div>

      <div className="missions-list">
        {MISSIONS.map(mission => {
          const completed = missionStatus[mission.id]?.isCompleted ?? false;
          const claimed = missionStatus[mission.id]?.isClaimed ?? false;

          return (
            <div key={mission.id} className={`task-card ${claimed ? 'task-claimed' : ''}`}>
              <div className="task-content">
                <div>
                  <p className={`task-description ${claimed ? 'task-completed' : ''}`}>
                    {mission.icon} {mission.name}
                  </p>
                  <p className="task-reward">獎勵: {mission.reward} 🌿</p>
                </div>
                <button
                  className={`task-button ${claimed ? 'btn-disabled' : completed ? 'btn-claim' : 'btn-disabled'}`}
                  disabled={!completed || claimed}
                  onClick={() => handleClaimMission(mission.id)}
                >
                  {!completed ? '未完成' : claimed ? '已領取' : '領取'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {claimModal && (
        <Modal
          type={claimModal.type}
          title={claimModal.title}
          message={claimModal.message}
          onConfirm={() => setClaimModal(null)}
        />
      )}

      <button className="back-btn" onClick={onBack}>
        ← 返回主畫面
      </button>
    </div>
  );
}
