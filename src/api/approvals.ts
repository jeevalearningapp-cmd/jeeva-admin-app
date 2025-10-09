import { supabase } from '@/lib/supabase'
import { ContentApproval, CreateApprovalInput, ReviewApprovalInput, ApprovalsFilters } from '@/types/approval'

const mapToApproval = (data: any): ContentApproval => ({
  id: data.id,
  resourceId: data.resource_id,
  resourceType: data.resource_type,
  resourceTitle: data.resource_title,
  status: data.status,
  submittedBy: data.submitted_by,
  submittedByName: data.submitted_by_name,
  reviewedBy: data.reviewed_by,
  reviewedByName: data.reviewed_by_name,
  reviewComments: data.review_comments,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  reviewedAt: data.reviewed_at,
})

const mapFromApproval = (data: Partial<ContentApproval>): any => ({
  resource_id: data.resourceId,
  resource_type: data.resourceType,
  resource_title: data.resourceTitle,
  status: data.status,
  submitted_by: data.submittedBy,
  reviewed_by: data.reviewedBy,
  review_comments: data.reviewComments,
})

export const approvalsAPI = {
  async getAll(filters: ApprovalsFilters = {}): Promise<ContentApproval[]> {
    let query = supabase
      .from('content_approvals')
      .select(`
        *,
        submitted_admin:admin_users!content_approvals_submitted_by_fkey(full_name),
        reviewed_admin:admin_users!content_approvals_reviewed_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.resourceType && filters.resourceType !== 'all') {
      query = query.eq('resource_type', filters.resourceType)
    }

    if (filters.search) {
      query = query.ilike('resource_title', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((item: any) => ({
      ...mapToApproval(item),
      submittedByName: item.submitted_admin?.full_name,
      reviewedByName: item.reviewed_admin?.full_name,
    }))
  },

  async getById(id: string): Promise<ContentApproval> {
    const { data, error } = await supabase
      .from('content_approvals')
      .select(`
        *,
        submitted_admin:admin_users!content_approvals_submitted_by_fkey(full_name),
        reviewed_admin:admin_users!content_approvals_reviewed_by_fkey(full_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      ...mapToApproval(data),
      submittedByName: data.submitted_admin?.full_name,
      reviewedByName: data.reviewed_admin?.full_name,
    }
  },

  async create(input: CreateApprovalInput): Promise<ContentApproval> {
    const { data, error } = await supabase
      .from('content_approvals')
      .insert([mapFromApproval(input)])
      .select()
      .single()

    if (error) throw error

    return mapToApproval(data)
  },

  async review(input: ReviewApprovalInput): Promise<ContentApproval> {
    const { data, error } = await supabase
      .from('content_approvals')
      .update({
        status: input.status,
        reviewed_by: input.reviewedBy,
        review_comments: input.reviewComments,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw error

    return mapToApproval(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_approvals')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
  }> {
    const { data, error } = await supabase
      .from('content_approvals')
      .select('status')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      pending: data?.filter((item) => item.status === 'pending').length || 0,
      approved: data?.filter((item) => item.status === 'approved').length || 0,
      rejected: data?.filter((item) => item.status === 'rejected').length || 0,
    }

    return stats
  },
}
