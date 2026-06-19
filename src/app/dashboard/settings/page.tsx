import { createClient } from "@/lib/supabase/server";
import Settings from "@/components/dashboard/Settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { count: tabsCount } = await supabase
    .from("tabs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { count: collectionsCount } = await supabase
    .from("collections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <Settings
      user={user!}
      profile={profile}
      tabsCount={tabsCount ?? 0}
      collectionsCount={collectionsCount ?? 0}
    />
  );
}
