import { supabase } from "@/lib/supabase";
import { Topic, CreateTopicInput, UpdateTopicInput } from "@/types/content";

const mapToTopic = (data: any): Topic => ({
  id: data.id,
  moduleId: data.module_id,
  title: data.title,
  description: data.description,
  isActive: data.is_active,
  displayOrder: data.display_order,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  module: data.modules
    ? {
        id: data.modules.id,
        title: data.modules.title,
        description: data.modules.description,
        thumbnailUrl: data.modules.thumbnail_url,
        isActive: data.modules.is_active,
        displayOrder: data.modules.display_order,
        createdAt: data.modules.created_at,
        updatedAt: data.modules.updated_at,
      }
    : undefined,
});

export const topicsAPI = {
  async getAll(): Promise<Topic[]> {
    const { data, error } = await supabase
      .from("topics")
      .select("*, modules(*)")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapToTopic);
  },

  async getByModuleId(moduleId: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from("topics")
      .select("*, modules(*)")
      .eq("module_id", moduleId)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapToTopic);
  },

  async getById(id: string): Promise<Topic> {
    const { data, error } = await supabase
      .from("topics")
      .select("*, modules(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapToTopic(data);
  },

  async create(input: CreateTopicInput): Promise<Topic> {
    const { data, error } = await supabase
      .from("topics")
      .insert([
        {
          module_id: input.moduleId,
          title: input.title,
          description: input.description,
          is_active: input.isActive ?? true,
          display_order: input.displayOrder ?? 0,
        },
      ])
      .select("*, modules(*)")
      .single();

    if (error) throw error;
    return mapToTopic(data);
  },

  async update(id: string, input: UpdateTopicInput): Promise<Topic> {
    const updateData: any = {};
    if (input.moduleId !== undefined) updateData.module_id = input.moduleId;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.displayOrder !== undefined)
      updateData.display_order = input.displayOrder;

    const { data, error } = await supabase
      .from("topics")
      .update(updateData)
      .eq("id", id)
      .select("*, modules(*)")
      .single();

    if (error) throw error;
    return mapToTopic(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("topics").delete().eq("id", id);

    if (error) throw error;
  },
};
