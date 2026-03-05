const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
    const envContent = fs.readFileSync('C:/Users/Om/Desktop/BlogSite/Blog-website/.env.local', 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

    if (!urlMatch || !keyMatch) return;

    const url = urlMatch[1].replace(/['"\s]/g, '');
    const key = keyMatch[1].replace(/['"\s]/g, '');
    const supabase = createClient(url, key);

    const { data, error } = await supabase
        .from('posts')
        .select(`
            id,
            title,
            parent_post_id,
            parent_post:posts!parent_post_id(
                id,
                title,
                author:users!posts_user_id_fkey(name, username)
            )
        `)
        .order('created_at', { ascending: false })
        .limit(2);

    console.log(error ? error : JSON.stringify(data, null, 2));
}
check();
