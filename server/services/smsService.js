import fetch from 'node-fetch';
export async function sendSMS({ to, text }){
  const { SMS_API_URL, SMS_API_KEY, SMS_SENDER_ID } = process.env;
  if (!SMS_API_URL || !SMS_API_KEY || !SMS_SENDER_ID) throw new Error('SMS env not configured');
  const res = await fetch(SMS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SMS_API_KEY}` },
    body: JSON.stringify({ sender: SMS_SENDER_ID, to, message: text })
  });
  if (!res.ok) throw new Error(`SMS failed: ${res.status}`);
  return res.json().catch(()=>({ ok:true }));
}
