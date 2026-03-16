import { useEffect, useState, useMemo } from 'react';
import { tables, reducers } from '../../module_bindings';
import { useSpacetimeDB, useReducer, useTable } from 'spacetimedb/react';

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

// Show 4 things: seed exp pet_image pet_name
export function UserPet() {
    const [matched_profiles, profile_ready] = useTable(tables.get_user_profile);
    const my_profile = matched_profiles[0];
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

    return (
        <div>
            {!profile_ready && "Loading"}
            {profile_ready && (
                <div>
                    <div>
                        <div>Level</div>
                        <div>{`${xpToLevel(my_profile.experiencePoints)}/${xpToNextLevel(xpToLevel(my_profile.experiencePoints)+1)}`}</div>
                    </div>

                    <div>
                        <div>Seed</div>
                        <div> {my_profile.seeds} </div>
                    </div>

                    <div>
                        <img src={petImage} />
                    </div>
                    <div>
                        <div> {my_profile.petName} </div>
                    </div>
                </div>
            )}
        </div>
    )
}