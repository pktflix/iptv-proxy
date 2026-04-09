import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import proxies from "../proxies.json";

function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)].proxy;
}

// retry system
async function fetchWithRetry(url, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const proxy = getRandomProxy();
      const agent = new HttpsProxyAgent(proxy);

      const response = await axios.get(url, {
        httpsAgent: agent,
        responseType: "arraybuffer",
        timeout: 8000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      return response;
    } catch (err) {
      console.log("Proxy failed, retrying...");
    }
  }
  throw new Error("All proxies failed");
}

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Missing URL");
  }

  try {
    // 🔥 m3u8 detect
    if (url.includes(".m3u8")) {
      const response = await fetchWithRetry(url);
      let data = response.data.toString();

      // 🔥 rewrite m3u8 links
      data = data.replace(/(https?:\/\/[^\s]+)/g, (match) => {
        return `/proxy?url=${encodeURIComponent(match)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");

      return res.send(data);
    }

    // 🔥 normal TS/video
    const response = await fetchWithRetry(url);

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(response.data);
  } catch (err) {
    res.status(500).send("Ultra Proxy Failed");
  }
}
