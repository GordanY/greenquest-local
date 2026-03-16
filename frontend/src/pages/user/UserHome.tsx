import { useEffect, useState } from 'react';
import { tables, reducers } from '../../module_bindings';
import { useSpacetimeDB, useReducer, useTable } from 'spacetimedb/react';
import { useAuth0 } from '@auth0/auth0-react';
import { UserPet } from './UserPet';
import { UserPokedex } from './UserPokedex';
import { UserShop } from './UserShop';
import { UserChallenge } from './UserChallenge';
import { UserRanking } from './UserRanking';

export default function UserHome() {
  // const { identity, token } = useSpacetimeDB();
  const { user } = useAuth0();
  const [my_profile, profile_ready] = useTable(tables.get_user_profile);
  const [selectedPet, setSelectedPet] = useState('種籽');
  const [page, setPage] = useState('home');
  const [petName, setPetName] = useState('種籽');
  const [userInited, setUserInited] = useState(false);
  const createNewUser = useReducer(reducers.createNewUser);

  useEffect(()=>{
    setUserInited(profile_ready && my_profile.length > 0);
  });


  function handleUserInit(e:any) {
    e.preventDefault()
    if(user?.name === undefined || user?.name === null || user?.name.length <= 0){
      console.log(`cannot get user name from auth0 token ${JSON.stringify(user)}`);
      return;
    }
    createNewUser({
      name: user?.name,
      petType: selectedPet,
      petName: petName
    }).then(()=>{
      setUserInited(true);
    }).catch(err=>{
      console.log(`error when createNewUser: ${err}`)
    });
  };

  return (
    <div>
      {
        !profile_ready && (<div> loading users...</div>)
      }
      {
        profile_ready && !userInited && (
          <form onSubmit={e=>handleUserInit(e)}>
            <h1>選擇你的夥伴</h1>
            <p>點擊選擇一個夥伴，並為牠取個名字吧！</p>

            <div>
              <div onClick={()=>setSelectedPet('種籽')} data-visual="Pet1_1.png">
                <img src="/pets/Pet1_1.png"/>
                  <p>種籽</p>
              </div>
              <div onClick={()=>setSelectedPet('豆芽')} data-visual="Pet2_1.png">
                <img src="/pets/Pet2_1.png"/>
                  <p>豆芽</p>
              </div>
            </div>

            <input onChange={e=>setPetName(e.target.value)} type="text" id="start-pet-name" placeholder="輸入寵物名稱..."/> 
            <button type="submit">開始遊戲</button>
          </form>
        )
      }
      {
        profile_ready && userInited && (
          <div>
            {page === 'home' && <UserPet/>}
            {page === 'challenge' && <UserChallenge/>}
            {page === 'ranking' && <UserRanking/>}
            {page === 'shop' && <UserShop/>}
            {page === 'pokedex' && <UserPokedex/>}
            <nav>
              <button onClick={()=>setPage('home')}>主頁</button>
              <button onClick={()=>setPage('challenge')}>挑戰</button>
              <button onClick={()=>setPage('ranking')}>排名</button>
              <button onClick={()=>setPage('pokedex')}>圖鑒</button>
              <button onClick={()=>setPage('shop')}>商店</button>
            </nav>
          </div>
        )
      }
    </div>

  
  );
}
