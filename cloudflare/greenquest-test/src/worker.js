export default {
  async fetch(request, env) {
    // 處理跨域問題 (CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("請使用 POST 請求", { status: 405 });
    }

    // 從環境變數讀取 API Key
    const API_KEY = env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    console.log(url);

    // 轉發前端的請求內容
    // Optimization: Stream the request body directly to avoid memory issues with large payloads
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: request.body,
    });

    // Safely handle the response text first
    const textData = await response.text();
    let data;

    try {
      // Try to parse it as JSON
      data = JSON.parse(textData);
    } catch (e) {
      // If Gemini sends back an HTML/Text error, return it gracefully so you can debug!
      return new Response(textData, {
        status: response.status,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // If it is JSON, return it as normal
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
