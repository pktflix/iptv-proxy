import type { VercelRequest, VercelResponse } from '@vercel/node'
import https from 'https'
import http from 'http'
import { parse } from 'url'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const fileUrl = req.query.url as string

  if (!fileUrl || (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://"))) {
    res.status(400).send("Invalid or missing `url` parameter")
    return
  }

  const client = fileUrl.startsWith('https') ? https : http

  const options = parse(fileUrl)
  options.headers = {
    'User-Agent': req.headers['user-agent'] || '',
    'Range': req.headers['range'] || '',
  }

  client.get(options, (streamRes) => {
    res.statusCode = streamRes.statusCode || 200

    for (const [key, value] of Object.entries(streamRes.headers)) {
      if (value) res.setHeader(key, value as string)
    }

    streamRes.pipe(res)
  }).on('error', (err) => {
    res.status(500).send("Proxy error: " + err.message)
  })
}