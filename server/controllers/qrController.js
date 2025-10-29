import { makeQrPngBuffer } from '../services/qrService.js';
import { participantService } from '../services/participantService.js';

function attendanceUrl(baseUrl, token){
  return `${baseUrl.replace(/\/$/,'')}/attend?token=${encodeURIComponent(token)}`;
}

export const qrController = {
  async pngByToken(req, res){
    const token = req.params.token;
    const p = await participantService.byToken(token);
    if (!p) return res.status(404).json({ error: 'not found' });
    const baseUrl = process.env.PUBLIC_BASE_URL;
    if (!baseUrl) return res.status(500).json({ error: 'server not configured' });
    const url = attendanceUrl(baseUrl, token);
    const buf = await makeQrPngBuffer(url);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buf);
  }
};
