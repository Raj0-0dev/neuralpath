import { createClient } from "@supabase/supabase-js";

let supabase;

const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }
  return supabase;
};

export const uploadToSupabase = async (fileBuffer, originalName, mimetype) => {
  const supabaseBucketName = process.env.SUPABASE_BUCKET_NAME || "resumes";
  const path = `resumes/${Date.now()}_${originalName}`;
  const client = getSupabaseClient();
  const { data, error } = await client.storage
    .from(supabaseBucketName)
    .upload(path, fileBuffer, {
      contentType: mimetype,
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = client.storage
    .from(supabaseBucketName)
    .getPublicUrl(path);

  return urlData.publicUrl;
};
