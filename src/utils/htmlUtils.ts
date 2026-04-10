import DOMPurify from 'isomorphic-dompurify';

/**
 * HTMLタグを除去してプレーンテキストを取得する
 * @param html HTML文字列
 * @returns プレーンテキスト
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

/**
 * HTMLをサニタイズする
 * <a>タグには target="_blank" と rel="noopener noreferrer" を自動付与する
 * @param html HTML文字列
 * @returns サニタイズされたHTML文字列
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // リンクを新しいタブで開くためのフックを追加
  // 注意: DOMPurifyはシングルトンのため、同時実行環境（サーバーサイド等）での競合には注意が必要だが、
  // 現状はクライアントサイドのモーダル表示でのみ使用されているため問題ない前提とする
  DOMPurify.addHook('afterSanitizeAttributes', (currentNode) => {
    // currentNodeの型は環境によって異なるためanyで扱う
    const element = currentNode as any;
    if ('tagName' in element && element.tagName === 'A') {
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    }
  });

  const clean = DOMPurify.sanitize(html);

  // フックを削除して副作用を防ぐ
  DOMPurify.removeHook('afterSanitizeAttributes');

  return clean;
};
