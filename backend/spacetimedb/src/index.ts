import { schema, table, t, SenderError } from 'spacetimedb/server';
import { Identity, TimeDuration } from 'spacetimedb';

// Stores all the keys for users to activate its admin privileges (become admin).
const admin_activate_key = table(
  { public: false },
  {
    key: t.string().primaryKey(),
    active: t.bool().default(true)
  }
);

const user = table(
  { public: true },
  {
    id: t.identity().primaryKey(), // unique per client connection
    name: t.string(),
    role: t.string().default('user') // 'admin' or 'user',
  }
);

const user_profile = table(
  { public: false },
  {
    user_id: t.identity().primaryKey(), // foreign key to user.id
    experience_points: t.number().default(0),  // total experience points earned by the user
    seeds: t.number().default(100),              // in-game currency
    pet_type: t.string(),              // type of pet the user has
    pet_stage: t.number().default(1),             // level of the user's pet
    pet_name: t.string().default('小種籽'),              // name of the user's pet
  }
);

const plant_types = table(
  { public: true },
  {
    name: t.string().primaryKey(), // unique plant type name
    description: t.string(),
    hints: t.string(),
    extras: t.string(),
    icons: t.string(),
  }
);

const user_uploads = table(
  { public: true },
  {
    user_id: t.identity(),
    mimeType: t.string(),
    photo_blob: t.string(),
    plant_answer_type: t.string(),
    reason: t.string(),
    plant_correct_name: t.string(),
    plant_correct_scientific_name: t.string(),
    plant_correct_type: t.string(),
    plant_correct_fun_fact: t.string(),
    timestamp: t.number()
  }
);

const class_sessions = table(
  { public: true },
  {
    access_code: t.string().index("btree"),
    creator_id: t.identity(),
    start_time: t.number(),
    end_time: t.number(),
  }
);

// admin users can create class sessions 
// users can submit an access code, then upload photos to that class session

const class_sessions_uploads = table(
  { public: true },
  {
    access_code: t.string(), // foreign key to class_sessions.access_code
    creator_nickname: t.string(),
    mimeType: t.string(),
    photo_blob: t.string(),
    plant_answer_type: t.string(),
    reason: t.string(),
    plant_correct_name: t.string(),
    plant_correct_scientific_name: t.string(),
    plant_correct_type: t.string(),
    plant_correct_fun_fact: t.string(),
    timestamp: t.number(),
  }
);

const ai_proxy_url = table(
  { public: false },
  {
    url: t.string().primaryKey()
  }
)


const spacetimedb = schema({
  user,
  admin_activate_key,
  user_profile,
  plant_types,
  // upload_records,
  user_uploads,
  class_sessions,
  class_sessions_uploads,
  ai_proxy_url
});
export default spacetimedb;

export const init = spacetimedb.init(ctx => {
  // set up initial data here, before any clients connect
  ctx.db.admin_activate_key.insert({
    key: 'let-me-in',
    active: true
  });


  // Shop items
  // ctx.db.shop_items.insert({
  //   type: 'consumable',
  //   name: '神奇營養液',
  //   description: '下次挑戰經驗值加倍！',
  //   price: 50,
  //   icon: '🧪',
  //   levelRequired: 1
  // });
  // ctx.db.shop_items.insert({
  //   type: 'decoration',
  //   name: '時尚草帽',
  //   description: '為你的寵物添購一頂可愛的草帽。',
  //   price: 150,
  //   icon: '👒',
  //   levelRequired: 1
  // });
  // ctx.db.shop_items.insert({
  //   type: 'consumable',
  //   name: '豐收肥料',
  //   description: '立即獲得 100 顆種子！',
  //   price: 200,
  //   icon: '🌾',
  //   levelRequired: 1
  // });
  // ctx.db.shop_items.insert({
  //   type: 'decoration',
  //   name: '酷炫墨鏡',
  //   description: '為你的寵物戴上一副時尚墨鏡。',
  //   price: 200,
  //   icon: '🕶️',
  //   levelRequired: 3
  // });
  // ctx.db.shop_items.insert({
  //   type: 'decoration',
  //   name: '花紋圍巾',
  //   description: '柔軟溫暖的花紋圍巾。',
  //   price: 250,
  //   icon: '🧣',
  //   levelRequired: 3
  // });
  // ctx.db.shop_items.insert({
  //   type: 'decoration',
  //   name: '植物學家之冠',
  //   description: '屬於真正植物學家的榮耀之冠。',
  //   price: 500,
  //   icon: '👑',
  //   levelRequired: 5
  // });
  // plant types
  ctx.db.plant_types.insert({
    name: '非維管植物',
    description: '非維管植物沒有導水的維管束組織。試試找找苔蘚（Mosses）、地錢（Liverworts）或藻類（Algae）——它們通常生長在潮濕的石頭、樹幹或水中。',
    extras: '你找到了非維管植物！它們是最古老的陸生植物之一，在約4億7千萬年前率先登上陸地。苔蘚沒有根，靠整個葉狀體吸收水分，因此特別依賴潮濕環境——它們也是濕地生態系的重要指示物種。',
    hints: '非維管植物的出現是植物演化史上的重大突破！維管束系統（木質部和韌皮部）讓植物得以長高，形成今日的森林。地球上超過90%的植物種類都是維管植物。',
    icons: '🌿'
  });
  ctx.db.plant_types.insert({
    name: '維管植物',
    description: '維管植物擁有運輸水分和養分的維管束。蕨類、開花植物和松樹都屬於維管植物，但苔蘚不算。試試找一種有葉有莖的植物。',
    extras: '維管植物的出現是植物演化史上的重大突破！維管束系統（木質部和韌皮部）讓植物得以長高，形成今日的森林。地球上超過90%的植物種類都是維管植物。',
    hints: '非維管植物的出現是植物演化史上的重大突破！維管束系統（木質部和韌皮部）讓植物得以長高，形成今日的森林。地球上超過90%的植物種類都是維管植物。',
    icons: '🌱'
  });
  ctx.db.plant_types.insert({
    name: '無種子植物',
    description: '無種子植物靠孢子繁殖，而非種子。蕨類（Ferns）就是最好的例子——注意葉背面的孢子囊，或在林蔭濕地尋找蕨類植物。',
    extras: '蕨類植物在3億多年前的石炭紀曾是地球的主宰！那時的蕨類可高達30公尺，形成龐大的「蕨類森林」。今天我們燃燒的煤炭，大部分正是由那個時代的蕨類化石形成的。',
    hints: '蕨類植物在石炭紀（約3.5億年前）稱霸地球，巨大的樹蕨高達30公尺。今天的煤炭大多由那時的蕨類森林形成。全球現存約1萬種蕨類。',
    icons: '🍃'
  });
  ctx.db.plant_types.insert({
    name: '種子植物',
    description: '種子植物用種子繁殖。開花植物和松樹、杉樹都是種子植物。試試找一棵結果或有毬果的樹木，或任何開花的植物。',
    extras: '種子是植物的偉大發明——它為胚胎提供養分和保護，讓植物得以在乾燥環境中繁殖。正因如此，種子植物在大約3億年前開始主導陸地生態系，並演化出我們今日看到的繁茂多樣。',
    hints: '種子是植物的偉大發明——它為胚胎提供養分和保護，讓植物得以在乾燥環境中繁殖。正因如此，種子植物在大約3億年前開始主導陸地生態系，並演化出我們今日看到的繁茂多樣。',
    icons: '🌰'
  });
  ctx.db.plant_types.insert({
    name: '無花植物',
    description: '無花植物（裸子植物）用毬果而非花朵繁殖。試試找松樹（Pine）、杉樹（Cypress）、銀杏（Ginkgo）或蘇鐵（Cycad）——它們的種子是「裸露」的，沒有果實包裹。',
    extras: '裸子植物的種子是「裸露」的，意思是沒有果實包裹。銀杏（Ginkgo biloba）是裸子植物中最古老的「活化石」，其祖先可追溯至2億7千萬年前，恐龍曾在銀杏樹下乘涼！香港的郊野公園中就有松樹和羅漢松等裸子植物。',
    hints: '裸子植物的種子是「裸露」的，意思是沒有果實包裹。銀杏（Ginkgo biloba）是裸子植物中最古老的「活化石」，其祖先可追溯至2億7千萬年前，恐龍曾在銀杏樹下乘涼！香港的郊野公園中就有松樹和羅漢松等裸子植物。',
    icons: '🌲'
  });
  ctx.db.plant_types.insert({
    name: '有花植物',
    description: '有花植物（被子植物）是最多樣的植物類群。無論是玫瑰、蘭花、向日葵還是禾草，只要會開花就算。試試在花圃或路邊找任何一種開花的植物。',
    extras: '被子植物是地球上最成功的植物類群，擁有超過30萬個已知種。它們與蜜蜂、蝴蝶等傳粉者共同演化，形成了地球生態系最重要的夥伴關係之一。從稻米、小麥到蘋果，人類的主食幾乎全來自被子植物。',
    hints: '被子植物是地球上最成功的植物類群，擁有超過30萬個已知種。它們與蜜蜂、蝴蝶等傳粉者共同演化，形成了地球生態系最重要的夥伴關係之一。從稻米、小麥到蘋果，人類的主食幾乎全來自被子植物。',
    icons: '🌸'
  });
  ctx.db.plant_types.insert({
    name: '裸子植物',
    description: '裸子植物的種子裸露在外，沒有果實包裹。松樹（Pine）、杉樹（Cypress）、銀杏（Ginkgo）和蘇鐵（Cycad）都是裸子植物——尋找有毬果的樹木。',
    extras: '裸子植物在距今約3億年前出現，是最早的種子植物。它們曾在恐龍時代主宰地球。銀杏是「活化石」，其形態在2億多年間幾乎沒有改變！',
    hints: '裸子植物在距今約3億年前出現，是最早的種子植物。它們曾在恐龍時代主宰地球。銀杏是「活化石」，其形態在2億多年間幾乎沒有改變！',
    icons: '🌲'
  });
  ctx.db.plant_types.insert({
    name: '蕨類植物',
    description: '蕨類植物沒有種子，靠孢子繁殖。注意它們特徵性的羽狀複葉，翻過來看葉背可能有棕色孢子囊群。在潮濕陰暗的林下或溪邊最容易找到。',
    extras: '蕨類植物在石炭紀（約3.5億年前）稱霸地球，巨大的樹蕨高達30公尺。今天的煤炭大多由那時的蕨類森林形成。全球現存約1萬種蕨類。',
    hints: '蕨類植物在石炭紀（約3.5億年前）稱霸地球，巨大的樹蕨高達30公尺。今天的煤炭大多由那時的蕨類森林形成。全球現存約1萬種蕨類。',
    icons: '☘️'
  });
  ctx.db.plant_types.insert({
    name: '單子葉植物',
    description: '單子葉植物的特徵是平行脈葉片、花瓣多為3的倍數。禾草、竹子、百合、蘭花、棕櫚、香蕉都是單子葉植物。',
    extras: '單子葉植物包含人類最重要的糧食作物：稻米、小麥、玉米。禾本科（草）覆蓋了地球陸地面積的約20%，是最成功的植物家族之一。',
    hints: '單子葉植物包含人類最重要的糧食作物：稻米、小麥、玉米。禾本科（草）覆蓋了地球陸地面積的約20%，是最成功的植物家族之一。',
    icons: '🌾'
  });
  ctx.db.plant_types.insert({
    name: '雙子葉植物',
    description: '雙子葉植物葉片通常有網狀脈，花瓣多為4或5的倍數。玫瑰、向日葵、豆科植物、大部分的樹木（楓、榕、木棉）都是雙子葉植物。',
    extras: '雙子葉植物是被子植物中種類最多的一群，約佔開花植物的75%。從微小的野花到巨大的闊葉樹，雙子葉植物的多樣性令人驚嘆。',
    hints: '雙子葉植物是被子植物中種類最多的一群，約佔開花植物的75%。從微小的野花到巨大的闊葉樹，雙子葉植物的多樣性令人驚嘆。',
    icons: '🌻'
  });
});

export const activate_admin = spacetimedb.reducer({ key: t.string() }, (ctx, { key }) => {
  const record = ctx.db.admin_activate_key.key.find(key);
  if (record && record.active) {
    // Activate admin privileges for the user
    const user = ctx.db.user.id.find(ctx.sender);
    if (user) {
      ctx.db.user.id.update({ ...user, role: 'admin' });
      return;
    } else {
      throw new SenderError('User not found');
    }
  } else {
    throw new SenderError('Invalid activation key');
  }
});

export const create_class_session = spacetimedb.reducer({ access_code: t.string(), duration_minutes: t.number() }, (ctx, { access_code, duration_minutes }) => {
  const user = ctx.db.user.id.find(ctx.sender);
  if (user && user.role === 'admin') {
    ctx.db.class_sessions.insert({
      access_code,
      creator_id: ctx.sender,
      start_time: Date.now(),
      end_time: Date.now() + duration_minutes * 60 * 1000,
    });
    return;
  } else {
    throw new SenderError('Unauthorized error: create class session');
  }
});

export const create_new_user = spacetimedb.reducer({ name: t.string(), pet_type: t.string(), pet_name: t.string() }, (ctx, { name, pet_type, pet_name }) => {
  const existingUser = ctx.db.user.id.find(ctx.sender);
  if (existingUser) {
    throw new SenderError('User already exists');
  }
  // If user already exists, we can choose to either throw an error or reset their profile. Here we choose to reset their profile.
  ctx.db.user_profile.user_id.delete(ctx.sender);
  const newUser = {
    id: ctx.sender,
    name,
    role: 'user'
  };
  ctx.db.user.insert(newUser);
  ctx.db.user_profile.insert({
    user_id: ctx.sender,
    experience_points: 0,
    seeds: 100,
    pet_type,
    pet_stage: 1,
    pet_name
  });
});

export const get_user_profile = spacetimedb.view({ name: 'my_profile', public: true }, t.option(user_profile.rowType), ctx => {
  const user_profile = ctx.db.user_profile.user_id.find(ctx.sender);
  if (!user_profile) {
    throw new SenderError('User profile not found');
  }
  return user_profile;
});

export const add_ai_proxy_url = spacetimedb.reducer({ proxy_url: t.string() }, (ctx, { proxy_url }) => {
  ctx.db.ai_proxy_url.insert({
    url: proxy_url
  });
});

export const remove_ai_proxy_url = spacetimedb.reducer({ proxy_url: t.string() }, (ctx, { proxy_url }) => {
  ctx.db.ai_proxy_url.delete({
    url: proxy_url
  });
});

const call_ai_model = (ctx: any, ai_proxy_url: string, { plant_answer_type, reason, photo_blob }: { plant_answer_type: string, reason: string, photo_blob: string }) => {
  const prompt = '你是一位植物學教師。請分析圖片中的植物，並判斷它是否屬於「' + plant_answer_type + '」這個類別。\n\n'
    + '首先，請確認圖片中是否有植物。若無植物，回傳 isPlant: false。\n\n'
    + '若有植物，請根據以下定義判斷它是否屬於目標類別：\n'
    + '- 非維管植物：苔蘚、地衣、藻類等沒有維管束的植物\n'
    + '- 維管植物：所有蕨類植物、裸子植物、被子植物（有根莖葉維管束系統的植物）\n'
    + '- 無種子植物：僅限蕨類植物及其近親（有維管束但靠孢子繁殖）\n'
    + '- 種子植物：所有裸子植物（松、杉、銀杏）和被子植物（開花植物）\n'
    + '- 無花植物：僅限裸子植物（松、杉、柏、銀杏、蘇鐵，種子裸露無果實）\n'
    + '- 有花植物：所有被子植物（單子葉和雙子葉，開花並有果實包裹種子）\n\n'
    + '目標類別：' + plant_answer_type + '\n\n'
    + '請嚴格按照以下JSON格式回傳（不要加任何解釋）：\n'
    + '{ "isPlant": true, "matchesCategory": true, "plantName": "植物中文名", "scientificName": "拉丁學名", '
    + '"plantType": "非維管植物、維管植物、無種子植物、種子植物、無花植物、有花植物 之一", '
    + '"funFact": "簡短有趣知識（30字左右）" }\n\n'
    + '若不是植物，回傳：\n'
    + '{ "isPlant": false, "matchesCategory": false, "plantName": "", "scientificName": "", "plantType": "", "funFact": "" }';

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: photo_blob } }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  let response;
  try {
    response = ctx.http.fetch(ai_proxy_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: TimeDuration.fromMillis(300000)
    });
    console.log(`Response status: ${response.status}`);
  } catch (err) {
    throw new SenderError(`$Error in http fetch (res: ${JSON.stringify(response)}}): ${String(err)}`)
  }

  if (response.status !== 200) {
    throw new SenderError(`API returned status ${response.status} ${response.text()}`);
  }

  const data = response.json();
  const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);

  if (!aiResponse) {
    throw new SenderError(`Failed to parse AI response ${data}`);
  }

  return {
    is_plant: aiResponse.isPlant,
    plant_correct_name: aiResponse.plantName,
    plant_correct_scientific_name: aiResponse.scientificName,
    plant_correct_type: aiResponse.plantType,
    plant_correct_fun_fact: aiResponse.funFact
  }
}

const AI_RESPONSE = t.object('data', { is_plant: t.bool(),  plant_correct_name: t.string(), plant_correct_scientific_name: t.string(), plant_correct_type: t.string(), plant_correct_fun_fact: t.string() });


export const user_call_ai_model = spacetimedb.procedure(
  { plant_answer_type: t.string(), reason: t.string(), photo_blob: t.string() },
  AI_RESPONSE,
  (ctx, { plant_answer_type, reason, photo_blob }) => {
    const proxy_url = ctx.withTx(ctx => {
      return ctx.db.ai_proxy_url.iter().next().value?.url;
    });

    console.log(`proxy_url = ${proxy_url}`);
    if (!proxy_url) {
      throw new SenderError(`ai_proxy_url is empty`);
    }

    const aiResponse = call_ai_model(ctx, proxy_url, { plant_answer_type, reason, photo_blob });

    const { is_plant, plant_correct_name, plant_correct_scientific_name, plant_correct_type, plant_correct_fun_fact } = aiResponse;

    if (is_plant) {
      ctx.withTx(txCtx => {
        txCtx.db.user_uploads.insert({
          user_id: ctx.sender,
          mimeType: "image/jpeg",
          photo_blob,
          plant_answer_type,
          reason,
          plant_correct_name,
          plant_correct_scientific_name,
          plant_correct_type,
          plant_correct_fun_fact,
          timestamp: Date.now()
        })
      });
    }

    return {
      is_plant,
      plant_correct_name,
      plant_correct_scientific_name,
      plant_correct_type,
      plant_correct_fun_fact
    }
  }
)

export const guest_call_ai_model = spacetimedb.procedure(
  { access_code: t.string(), nickname: t.string(), plant_answer_type: t.string(), reason: t.string(), photo_blob: t.string() },
  AI_RESPONSE,
  (ctx, { access_code, nickname, plant_answer_type, reason, photo_blob }) => {
    const proxy_url = ctx.withTx(ctx => {
      return ctx.db.ai_proxy_url.iter().next().value?.url;
    });

    console.log(`proxy_url = ${proxy_url}`);
    if (!proxy_url) {
      throw new SenderError(`ai_proxy_url is empty`);
    }

    const aiResponse = call_ai_model(ctx, proxy_url, { plant_answer_type, reason, photo_blob });

    const { is_plant, plant_correct_name, plant_correct_scientific_name, plant_correct_type, plant_correct_fun_fact } = aiResponse;

    if (is_plant) {
      // Store the conversation in the database
      ctx.withTx(txCtx => {
        txCtx.db.class_sessions_uploads.insert({
          access_code,
          creator_nickname: nickname,
          mimeType: "image/jpeg",
          photo_blob,
          plant_answer_type,
          reason,
          plant_correct_name,
          plant_correct_scientific_name,
          plant_correct_type,
          plant_correct_fun_fact,
          timestamp: Date.now()
        });
      });
    }

    return {
      is_plant,
      plant_correct_name,
      plant_correct_scientific_name,
      plant_correct_type,
      plant_correct_fun_fact
    };
  });

export const onConnect = spacetimedb.clientConnected(_ctx => {
  // Called every time a new client connects
  console.log(`A new client has connected to Spacetimedb! ${_ctx.identity}`);
});

export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {
  // Called every time a client disconnects
  console.log(`A client has disconnected from Spacetimedb! ${_ctx.identity}`);
});


// export const get_request = spacetimedb.procedure(t.unit(), ctx => {
//   try {
//     console.log("Attempting HTTP GET to httpbin.org...");
//     const response = ctx.http.fetch("https://httpbin.org/get");
//     console.log(`Got response with status ${response.status}`);
//     const body = response.text();
//     console.log(`Response body length: ${body.length}`);
//   } catch (e) {
//     console.error("Request failed: ", e);
//     throw new SenderError(`HTTP request failed: ${JSON.stringify(e)}`);
//   }
//   return {};
// });

// export const test_url = spacetimedb.procedure({ url: t.string() }, t.object('result', { status: t.number(), success: t.bool() }), (ctx, { url }) => {
//   try {
//     console.log(`Testing URL: ${url}`);
//     const response = ctx.http.fetch(url, {
//       timeout: TimeDuration.fromMillis(60000), // one minute time
//     });
//     // console.log(`Status: ${response.status}`);
//     return { status: response.status, success: true };
//   } catch (e) {
//     console.log(`URL test failed for ${url}:`, e);
//     throw new SenderError(`Failed to fetch ${url}: ${String(e)}`);
//   }
// });