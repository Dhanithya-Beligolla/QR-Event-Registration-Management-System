import QRCode from 'qrcode';
export async function makeQrDataUrl(text){ return QRCode.toDataURL(text, { margin:1, width:320 }); }
export async function makeQrPngBuffer(text){ return QRCode.toBuffer(text, { type: 'png', margin:1, width:320 }); }
