export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl || !targetUrl.startsWith("http")) {
    return res.status(400).send("Missing or invalid 'url' query parameter.");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || '',
        'Range': req.headers['range'] || '',
      },
    });

    res.status(response.status);
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Proxy Error: " + err.message);
  }
}