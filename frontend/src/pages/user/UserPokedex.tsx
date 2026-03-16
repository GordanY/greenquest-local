import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "../../module_bindings";

export function UserPokedexSpecificName({plantName}:{plantName:string}) {

}


export function UserPokedex(){
    const [uploads, uploadsReady] = useTable(tables.user_uploads);

    if(!uploadsReady){
        return (<div>加載中</div>)；
    }

    return (<div>UserPokedex</div>);
}