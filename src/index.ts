#!/usr/bin/env node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GitLabClient, MergeRequest } from "./gitlab.js";

const GITLAB_URL = process.env.GITLAB_URL;
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;

if (!GITLAB_URL || !GITLAB_TOKEN) {
  process.exit(1);
}



const gitlabClient = new GitLabClient({
  url: GITLAB_URL,
  token: GITLAB_TOKEN,
});

const mcpServer = new McpServer(
  {
    name: "mcp-gitlab",
    version: "1.0.0",
  },
  {
   
    instructions: `
  You are a helpful assistant that can help with GitLab.
  You can query the GitLab and retrieve the data.
  `,
  }
);

function formatMergeRequest(mr: MergeRequest): string {
  const status =
    mr.state === "opened"
      ? "🟢 Open"
      : mr.state === "merged"
      ? "✅ Merged"
      : "❌ Closed";
  const pipeline = mr.pipeline
    ? mr.pipeline.status === "success"
      ? "✅"
      : mr.pipeline.status === "failed"
      ? "❌"
      : mr.pipeline.status === "running"
      ? "🟡"
      : "⚪"
    : "⚪";

  return `${status} ${pipeline} **${mr.title}**
Project: ${mr?.project?.path_with_namespace}
Branch: ${mr.source_branch} → ${mr.target_branch}
Author: ${mr.author.name} (@${mr.author.username})
Created: ${new Date(mr.created_at).toLocaleDateString()}
Updated: ${new Date(mr.updated_at).toLocaleDateString()}
URL: ${mr.web_url}
Status: ${mr.detailed_merge_status}
${mr.draft ? "📝 Draft" : ""}${mr.work_in_progress ? "🚧 WIP" : ""}

---`;
}

mcpServer.registerTool(
  "get-my-merge-requests",
  {
    title: "Get My Merge Requests",
    description: "Get merge requests created by the current user",
    inputSchema: {
      state: z
        .enum(["opened", "closed", "merged", "all"])
        .optional()
        .default("opened"),
    },
  },
  async (args) => {
    const state = args?.state || "opened";
    
    try {
      const mergeRequests = await gitlabClient.getMyMergeRequests(state);

      if (mergeRequests.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No merge requests found with state: ${state}`,
            },
          ],
        };
      }

      const formattedList = mergeRequests.map(formatMergeRequest).join("\n");

      return {
        content: [
          {
            type: "text",
            text: `# My Merge Requests (${state})\n\nFound ${mergeRequests.length} merge request(s):\n\n${formattedList}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching merge requests: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

mcpServer.registerTool(
  "get-merge-requests-for-review",
  {
    title: "Get Merge Requests for Review",
    description: "Get merge requests assigned to the current user for review",
    inputSchema: {
      state: z
        .enum(["opened", "closed", "merged", "all"])
        .optional()
        .default("opened"),
    },
  },
  async (args) => {
    const state = args?.state || "opened";
    
    try {
      const mergeRequests = await gitlabClient.getMergeRequestsForReview(state);

      if (mergeRequests.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No merge requests found for review with state: ${state}`,
            },
          ],
        };
      }

      const formattedList = mergeRequests.map(formatMergeRequest).join("\n");

      return {
        content: [
          {
            type: "text",
            text: `# Merge Requests for Review (${state})\n\nFound ${mergeRequests.length} merge request(s):\n\n${formattedList}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching merge requests for review: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

mcpServer.registerTool(
  "get-current-user",
  {
    title: "Get Current User",
    description: "Get the current user",
    inputSchema: {
    },
  },
  async (args) => {
    try {
      const user = await gitlabClient.getCurrentUser();

      if (!user) {
        return {
          content: [
            {
              type: "text",
              text: `No user found`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `# Current User\n\nFound ${user.name} (${user.username}) : ${JSON.stringify(user)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching current user: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

(async () => {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
})();