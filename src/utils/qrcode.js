// QR Code utility functions
export function generateQRCode(text, size = 200) {
  // This is a simplified QR code generator
  // In a real application, you would use a library like qrcode-generator
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=${size}x${size}`;
}

export function isValidQRCodeFormat(text) {
  // Simple validation for QR code content
  return typeof text === 'string' && text.length > 0;
}