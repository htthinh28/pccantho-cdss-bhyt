/**
 * Đọc văn bản tiếng Việt (TTS) — Web: SpeechSynthesis; native: expo-speech.
 * Không gửi dữ liệu ra ngoài thiết bị.
 */
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

const stripMarkdownNhe = (s) => String(s || '')
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/^\s*[-*]\s+/gm, '')
  .replace(/\n{2,}/g, '\n')
  .trim();

export const dungDocDangChay = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.speaking || window.speechSynthesis.pending;
  }
  return false;
};

export const dungDoc = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    return;
  }
  try {
    Speech.stop();
  } catch {
    /* ignore */
  }
};

/**
 * @param {string} text
 * @param {{ rate?: number, pitch?: number }} [opts]
 */
export const docVanBan = async (text, opts = {}) => {
  const plain = stripMarkdownNhe(text);
  if (!plain) return;

  const rate = typeof opts.rate === 'number' ? opts.rate : 0.96;
  const pitch = typeof opts.pitch === 'number' ? opts.pitch : 1.0;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis && window.SpeechSynthesisUtterance) {
    dungDoc();
    const u = new window.SpeechSynthesisUtterance(plain);
    u.rate = rate;
    u.pitch = pitch;
    const voices = window.speechSynthesis.getVoices?.() || [];
    const vi = voices.find((v) => /^vi/i.test(v.lang)) || voices.find((v) => /viet/i.test(v.name || ''));
    if (vi) u.voice = vi;
    u.lang = vi?.lang || 'vi-VN';
    window.speechSynthesis.speak(u);
    return;
  }

  dungDoc();
  Speech.speak(plain, {
    language: 'vi-VN',
    rate,
    pitch,
  });
};
