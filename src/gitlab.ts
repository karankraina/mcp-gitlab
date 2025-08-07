import axios, { AxiosInstance } from "axios";

export interface GitLabConfig {
  url: string;
  token: string;
}

export interface MergeRequest {
  id: number;
  title: string;
  description: string;
  state: string;
  author: {
    id: number;
    name: string;
    username: string;
  };
  assignees: Array<{
    id: number;
    name: string;
    username: string;
  }>;
  reviewers: Array<{
    id: number;
    name: string;
    username: string;
  }>;
  source_branch: string;
  target_branch: string;
  web_url: string;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  pipeline?: {
    id: number;
    status: string;
    web_url: string;
  };
  project_id: number;
  project: {
    id: number;
    name: string;
    path_with_namespace: string;
  };
  merge_status: string;
  detailed_merge_status: string;
  work_in_progress: boolean;
  draft: boolean;
}

export interface Project {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
}

export class GitLabClient {
  private client: AxiosInstance;
  private config: GitLabConfig;

  constructor(config: GitLabConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `${config.url}/api/v4`,
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get("/user");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get current user: ${error}`);
    }
  }

  async getMyMergeRequests(state: string = "opened"): Promise<MergeRequest[]> {
    try {
      const response = await this.client.get("/merge_requests", {
        params: {
          scope: "created_by_me",
          state,
          order_by: "updated_at",
          sort: "desc",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get merge requests: ${error}`);
    }
  }

  async getMergeRequestsForReview(
    state: string = "opened"
  ): Promise<MergeRequest[]> {
    try {
      const currentUser = await this.getCurrentUser();

      const reviewerResponse = await this.client.get("/merge_requests", {
        params: {
          reviewer_id: currentUser.id,
          state,
          scope: "all",
          order_by: "updated_at",
          sort: "desc",
        },
      });

      const reviewerMRs = reviewerResponse.data;

      return reviewerMRs;
    } catch (error) {
      throw new Error(`Failed to get merge requests for review: ${error}`);
    }
  }

  async getMergeRequest(
    projectId: number,
    mergeRequestIid: number
  ): Promise<MergeRequest> {
    try {
      const response = await this.client.get(
        `/projects/${projectId}/merge_requests/${mergeRequestIid}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get merge request: ${error}`);
    }
  }

  async updateMergeRequest(
    projectId: number,
    mergeRequestIid: number,
    updates: {
      state_event?: "close" | "reopen" | "merge";
      title?: string;
      description?: string;
    }
  ): Promise<MergeRequest> {
    try {
      const response = await this.client.put(
        `/projects/${projectId}/merge_requests/${mergeRequestIid}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update merge request: ${error}`);
    }
  }

  async approveMergeRequest(
    projectId: number,
    mergeRequestIid: number
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${projectId}/merge_requests/${mergeRequestIid}/approve`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to approve merge request: ${error}`);
    }
  }

  async unapproveMergeRequest(
    projectId: number,
    mergeRequestIid: number
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${projectId}/merge_requests/${mergeRequestIid}/unapprove`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to unapprove merge request: ${error}`);
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.client.get("/projects", {
        params: {
          membership: true,
          order_by: "last_activity_at",
          sort: "desc",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error}`);
    }
  }
}
