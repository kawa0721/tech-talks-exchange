/**
 * この関数を追加して、コメントツリーを最大2階層に制限します
 */
const limitCommentTreeDepth = (comments: Comment[]): Comment[] => {
  return comments.map(comment => {
    // 最初の階層の返信だけを保持し、それ以降の返信は削除
    if (comment.replies && comment.replies.length > 0) {
      // 返信の返信（replies.replies）プロパティを削除
      const limitedReplies = comment.replies.map(reply => {
        const { replies, ...replyWithoutNestedReplies } = reply;
        return replyWithoutNestedReplies;
      });
      
      return {
        ...comment,
        replies: limitedReplies
      };
    }
    
    return comment;
  });
};

// ... formatした後、返す前に処理を追加 ...
if (isMounted) {
  // コメントの内容が前回と同じかチェック - isEqual の代わりに isDeepEqual を使用
  const isSameComments = isDeepEqual(formattedComments, lastFetchedCommentsRef.current);
  
  if (!isSameComments) {
    // 実際に変化がある場合のみコメントを更新
    console.log("新しいコメントデータをセット:", formattedComments.length, "件");
    
    // コメントを最大2階層に制限
    const limitedComments = limitCommentTreeDepth(formattedComments);
    
    setComments(limitedComments);
    // 最後に取得したコメントを保存
    lastFetchedCommentsRef.current = limitedComments;
  } else {
    console.log("コメントデータに変更なし - 更新をスキップ");
  }
  
  setLoading(false);
} 