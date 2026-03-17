import { useMemo } from 'react';
import { tables } from '../../module_bindings';
import { useTable } from 'spacetimedb/react';
import './UserPet.css';

export function xpToLevel(xp: number) {
    const x = Math.ceil(xp / 2);
    return (x === 0) ? 1 : x;
}

export function xpToNextLevel(level: number) {
    return 2*level+1;
}

export function levelToPetStage(level: number) {
    return (level >= 1) ?
        1 :
        ((level >= 2) ? 2 : 3);
}

interface UserPetProps {
    selectedPet?: string;
    setSelectedPet?: (pet: string) => void;
    petName?: string;
    setPetName?: (name: string) => void;
    onSubmit?: (e: any) => void;
}

const PET_TYPES = [
    { name: '種籽', icon: '🌱', image: '/pets/Pet1_1.png' },
    { name: '豆芽', icon: '🌿', image: '/pets/Pet2_1.png' },
];

export function UserPet(props?: UserPetProps) {
    const [matched_profiles, profile_ready] = useTable(tables.get_user_profile);
    const my_profile = matched_profiles[0];

    // If this is the selection screen (props provided)
    if (props?.onSubmit) {
        return (
            <div className="pet-selection-screen">
                <div className="selection-floaters">
                    <div className="floater">🌱</div>
                    <div className="floater">🌿</div>
                    <div className="floater">🍃</div>
                </div>

                <div className="pet-selection-header">
                    <h2 className="pet-selection-title">選擇你的寵物</h2>
                    <p className="pet-selection-subtitle">每個寵物都有獨特的特點，選擇你喜歡的夥伴</p>
                </div>

                <div className="pet-choices-container">
                    {PET_TYPES.map(pet => (
                        <div
                            key={pet.name}
                            className={`pet-choice-card ${props.selectedPet === pet.name ? 'selected' : ''}`}
                            onClick={() => props.setSelectedPet?.(pet.name)}
                        >
                            <img src={pet.image} alt={pet.name} className="pet-choice-image" />
                            <div className="pet-choice-name">{pet.name}</div>
                        </div>
                    ))}
                </div>

                <div className="pet-name-input-section">
                    <label className="pet-name-label">給你的寵物取個名字</label>
                    <input
                        type="text"
                        className="pet-name-input"
                        value={props.petName || ''}
                        onChange={(e) => props.setPetName?.(e.target.value)}
                        placeholder="輸入寵物名字..."
                    />
                </div>

                <button
                    className="start-game-btn"
                    onClick={props.onSubmit}
                    disabled={!props.petName || props.petName.trim().length === 0}
                >
                    開始遊戲
                </button>
            </div>
        );
    }

    // Otherwise, show the pet display screen (for viewing current pet)
    const petImage = useMemo<string | undefined>(()=>{
        if (!my_profile) return undefined;
        let type_index;
        let stage_index = levelToPetStage(xpToLevel(my_profile.experiencePoints));
        if(my_profile.petType ==='種籽') {
            type_index = 1;
        }else{
            type_index = 2;
        }
        console.log(`/pets/Pet${type_index}_${stage_index}.png`)
        return `/pets/Pet${type_index}_${stage_index}.png`;
    },[my_profile]);

    if (!profile_ready) {
        return (
            <div className="pet-selection-loading">
                <div className="loading-spinner"></div>
                <p className="loading-text">加載寵物中...</p>
            </div>
        );
    }

    const level = xpToLevel(my_profile.experiencePoints);
    const nextLevelXp = xpToNextLevel(level + 1);

    return (
        <div className="pet-display-modal">
            <div className="pet-display-content">
                <h2 className="pet-display-title">你的寵物</h2>

                <div className="pet-display-visual">
                    <img src={petImage} alt="寵物" className="pet-avatar" />
                    <h3 className="pet-display-name">{my_profile.petName}</h3>
                </div>

                <div className="pet-stats-display">
                    <div className="stat-row">
                        <span className="stat-label">等級</span>
                        <span className="stat-value">{level}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">種子</span>
                        <span className="stat-value">🌿 {my_profile.seeds}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">進度</span>
                        <span className="stat-value">{my_profile.experiencePoints % nextLevelXp}/{nextLevelXp}</span>
                    </div>
                </div>

                <div className="pet-level-bar">
                    <div className="xp-bar-container">
                        <div
                            className="xp-bar-fill"
                            style={{ width: `${((my_profile.experiencePoints % nextLevelXp) / nextLevelXp) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}