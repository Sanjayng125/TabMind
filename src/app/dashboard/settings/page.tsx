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

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const { count: tabsCount } = await supabase
    .from("tabs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { count: collectionsCount } = await supabase
    .from("collections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  // use this method if you want to fetch all data at once, but if one query fails, the whole thing fails.
  // const [
  //   { data: profile },
  //   { data: orders },
  //   { count: tabsCount },
  //   { count: collectionsCount },
  // ] = await Promise.all([
  //   supabase.from("profiles").select("*").eq("id", user!.id).single(),
  //   supabase
  //     .from("orders")
  //     .select("*")
  //     .eq("user_id", user!.id)
  //     .order("created_at", { ascending: false }),
  //   supabase
  //     .from("tabs")
  //     .select("*", { count: "exact", head: true })
  //     .eq("user_id", user!.id),
  //   supabase
  //     .from("collections")
  //     .select("*", { count: "exact", head: true })
  //     .eq("user_id", user!.id),
  // ]);

  return (
    <Settings
      user={user!}
      profile={profile}
      orders={orders ?? []}
      tabsCount={tabsCount ?? 0}
      collectionsCount={collectionsCount ?? 0}
    />
  );
}
