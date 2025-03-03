import { v4 as uuidv4 } from 'uuid';

// ローカルストレージのキー
const GUEST_ID_KEY = 'tech_talks_guest_id';

/**
 * ゲストユーザーIDを取得または作成する
 * ローカルストレージに保存されている場合はそれを返し、
 * なければ新たに生成して保存する
 */
export function getOrCreateGuestId(): string {
  // ローカルストレージからゲストIDを取得
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  // ゲストIDがない場合は新たに生成して保存
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
}

/**
 * ゲストIDを削除する (ログアウト時などに使用)
 */
export function clearGuestId(): void {
  localStorage.removeItem(GUEST_ID_KEY);
}

/**
 * ゲストIDを持っているかどうかを確認する
 */
export function hasGuestId(): boolean {
  return localStorage.getItem(GUEST_ID_KEY) !== null;
}
