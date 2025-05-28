export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl || !targetUrl.startsWith("http")) {
    return res.status(400).send("Missing or invalid 'url' query parameter.");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || '',
        'Range': req.headers['range'] || '',   // Range হেডার ফরোয়ার্ড করুন
        'Accept': '*/*',
      },
    });

    // Response status forward করুন (important for partial content)
    res.status(response.status);

    // Content-Type সেট করুন (response থেকে নেওয়া)
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // অন্যান্য হেডার ফরোয়ার্ড করুন (CORS এর জন্য কিছু হেডার যোগ করা যায়)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Accept-Ranges', 'bytes');

    // Response stream পিপ করুন
    response.body.pipe(res);

  } catch (err) {
    res.status(500).send("Proxy Error: " + err.message);
  }
}
