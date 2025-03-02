
import { supabase } from "@/integrations/supabase/client";
import { CHANNELS, CHANNEL_CATEGORIES } from "@/lib/data/channels";

// このユーティリティ関数は、既存のハードコードされたチャンネルとカテゴリーのデータを
// Supabaseデータベースに移行するために使用します
export const migrateChannelsData = async () => {
  try {
    console.log("チャンネルとカテゴリーのデータ移行を開始...");
    
    // カテゴリーがすでに存在するか確認
    const { data: existingCategories, error: categoriesError } = await supabase
      .from('channel_categories')
      .select('id');
      
    if (categoriesError) {
      throw categoriesError;
    }
    
    // カテゴリーデータがまだ存在しない場合のみ挿入
    if (existingCategories.length === 0) {
      console.log("カテゴリーデータを挿入中...");
      const { error: insertCategoriesError } = await supabase
        .from('channel_categories')
        .insert(
          CHANNEL_CATEGORIES.map(category => ({
            id: category.id,
            name: category.name
          }))
        );
        
      if (insertCategoriesError) {
        throw insertCategoriesError;
      }
      
      console.log("カテゴリーデータが正常に挿入されました");
    } else {
      console.log("カテゴリーデータはすでに存在します");
    }
    
    // チャンネルがすでに存在するか確認
    const { data: existingChannels, error: channelsError } = await supabase
      .from('channels')
      .select('id');
      
    if (channelsError) {
      throw channelsError;
    }
    
    // チャンネルデータがまだ存在しない場合のみ挿入
    if (existingChannels.length === 0) {
      console.log("チャンネルデータを挿入中...");
      const { error: insertChannelsError } = await supabase
        .from('channels')
        .insert(
          CHANNELS.map(channel => ({
            id: channel.id,
            name: channel.name,
            description: channel.description,
            icon: channel.icon,
            category_id: channel.categoryId
          }))
        );
        
      if (insertChannelsError) {
        throw insertChannelsError;
      }
      
      console.log("チャンネルデータが正常に挿入されました");
    } else {
      console.log("チャンネルデータはすでに存在します");
    }
    
    console.log("データ移行が完了しました");
    return true;
  } catch (error) {
    console.error("データ移行中にエラーが発生しました:", error);
    return false;
  }
};
