export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ResourceType =
  | "module"
  | "topic"
  | "lesson"
  | "question"
  | "flashcard";

export interface ContentApproval {
  id: string;
  resourceId: string;
  resourceType: ResourceType;
  resourceTitle: string;
  status: ApprovalStatus;
  submittedBy: string;
  submittedByName?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewComments?: string;
  createdAt: string;
  updatedAt?: string;
  reviewedAt?: string;
}

export interface CreateApprovalInput {
  resourceId: string;
  resourceType: ResourceType;
  resourceTitle: string;
  submittedBy: string;
}

export interface ReviewApprovalInput {
  id: string;
  status: "approved" | "rejected";
  reviewComments?: string;
  reviewedBy: string;
}

export interface ApprovalsFilters {
  status?: ApprovalStatus | "all";
  resourceType?: ResourceType | "all";
  search?: string;
}
