import { makeQrDataUrl, makeQrPngBuffer } from '../services/qrService.js';
import { sendSMS } from '../services/smsService.js';
import { sendEmail } from '../services/emailService.js';
import { participantService } from '../services/participantService.js';
import Participant from '../models/Participant.js';

function attendanceUrl(baseUrl, token){
  return `${baseUrl.replace(/\/$/,'')}/attend?token=${encodeURIComponent(token)}`;
}

export const outboundController = {
  // Admin-triggered send
  async sendQR(req, res){
    const { participantId, via } = req.body; // 'sms' | 'email' | 'both'
    const p = await Participant.findById(participantId);
    if (!p) return res.status(404).json({ error: 'participant not found' });

    const baseUrl = process.env.PUBLIC_BASE_URL;
    const url = attendanceUrl(baseUrl, p.token);
  const qrDataUrl = await makeQrDataUrl(url);
  const qrPng = await makeQrPngBuffer(url);

  const results = { url, qr: qrDataUrl };

    if (via === 'sms' || via === 'both') {
      try {
        if (!p.phone) throw new Error('Participant missing phone');
        await sendSMS({ to: p.phone, text: `Hi ${p.name}, your event check-in link: ${url}` });
        results.sms = 'sent';
      } catch (e) { results.sms = `failed: ${e.message}`; }
    }

    if (via === 'email' || via === 'both') {
      try {
        if (!p.email) throw new Error('Participant missing email');
        const html = `<p>Hi ${p.name},</p><p>Your event check-in link is <a href="${url}">${url}</a>.</p><p>Or scan this QR:</p><img src="cid:event-qr" alt="QR"/>`;
        await sendEmail({ to: p.email, subject: 'Your Event QR', html, attachments: [{ filename: 'event-qr.png', content: qrPng, cid: 'event-qr' }] });
        results.email = 'sent';
      } catch (e) { results.email = `failed: ${e.message}`; }
    }

    res.json(results);
  },

  // Public register with explicit delivery channel
  async publicRegister(req, res){
    const { name, email, phone, department, ticketType, category, eventDateTime, via='sms' } = req.body || {};
    const p = await participantService.upsert({ name, email, phone, department, ticketType, category, eventDateTime });
    const baseUrl = process.env.PUBLIC_BASE_URL;
    const url = attendanceUrl(baseUrl, p.token);

  let delivery = {};
  const qrDataUrl = await makeQrDataUrl(url);
    if (via === 'sms' || via === 'both') {
      if (phone) {
        try { await sendSMS({ to: phone, text: `Hi ${name}, your event check-in link: ${url}` }); delivery.sms = 'sent'; } catch(e){ delivery.sms = `failed: ${e.message}`; }
      } else { delivery.sms = 'skipped: phone missing'; }
    }
    if (via === 'email' || via === 'both') {
      if (email) {
        try {
          const qrPng = await makeQrPngBuffer(url);
          const html = `<p>Hi ${name},</p><p>Use this link: <a href="${url}">${url}</a></p><p>Or scan this QR:</p><img src="cid:event-qr" alt="QR"/>`;
          await sendEmail({ to: email, subject: 'Your Event QR', html, attachments: [{ filename: 'event-qr.png', content: qrPng, cid: 'event-qr' }] });
          delivery.email = 'sent';
        } catch(e){ delivery.email = `failed: ${e.message}`; }
      } else { delivery.email = 'skipped: email missing'; }
    }

    res.json({ ok: true, participant: p, url, qr: qrDataUrl, delivery });
  }
};
