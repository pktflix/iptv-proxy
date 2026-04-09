export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Missing URL");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let contentType = response.headers.get("content-type");

    // 🔥 if m3u8 → rewrite
    if (url.includes(".m3u8")) {
      let text = await response.text();

      const base = url.substring(0, url.lastIndexOf("/") + 1);

      text = text.replace(/(?!#)([^\n]+)/g, (line) => {
        if (line.startsWith("http")) {
          return `/proxy?url=${encodeURIComponent(line)}`;
        } else {
          return `/proxy?url=${encodeURIComponent(base + line)}`;
        }
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");

      return res.send(text);
    }

    // 🔥 normal ts
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType || "video/mp2t");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(Buffer.from(buffer));

  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}
