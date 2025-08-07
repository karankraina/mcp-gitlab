# MCP GitLab Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with GitLab. This server provides tools to view and manage merge requests, get project information, and perform review actions.

## Features

- 🔍 **View Merge Requests**: See MRs you created or need to review
- 📋 **Get MR Details**: Get comprehensive information about specific merge requests
- ✅ **Review Actions**: Approve or unapprove merge requests
- 📝 **Update MRs**: Modify titles, descriptions, and states
- 🏗️ **Project Management**: List accessible GitLab projects

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd mcp-gitlab
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Set up environment variables:
```bash
cp sample.env .env
# Edit .env with your GitLab configuration
```

## Configuration

Create a `.env` file with the following variables:

```env
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your_gitlab_personal_access_token_here
```

### Getting a GitLab Personal Access Token

1. Go to your GitLab instance (e.g., gitlab.com)
2. Navigate to User Settings → Access Tokens
3. Create a new token with the following scopes:
   - `api` - Full API access
   - `read_user` - Read user information
   - `read_repository` - Read repository information

## Available Tools

### `get-my-merge-requests`
Get merge requests created by the current user.

**Parameters:**
- `state` (optional): Filter by state (`opened`, `closed`, `merged`, `all`). Default: `opened`

### `get-merge-requests-for-review`
Get merge requests assigned to the current user for review.

**Parameters:**
- `state` (optional): Filter by state (`opened`, `closed`, `merged`, `all`). Default: `opened`

### `get-merge-request-details`
Get detailed information about a specific merge request.

**Parameters:**
- `project_id` (required): The project ID
- `merge_request_iid` (required): The merge request IID (internal ID)

### `approve-merge-request`
Approve a merge request.

**Parameters:**
- `project_id` (required): The project ID
- `merge_request_iid` (required): The merge request IID

### `unapprove-merge-request`
Remove approval from a merge request.

**Parameters:**
- `project_id` (required): The project ID
- `merge_request_iid` (required): The merge request IID

### `update-merge-request`
Update a merge request's title, description, or state.

**Parameters:**
- `project_id` (required): The project ID
- `merge_request_iid` (required): The merge request IID
- `title` (optional): New title for the merge request
- `description` (optional): New description for the merge request
- `state_event` (optional): State change to apply (`close`, `reopen`, `merge`)

### `get-projects`
Get list of GitLab projects the user has access to.

**Parameters:** None

## Usage with MCP Clients

This server can be used with any MCP-compatible client. Here's an example configuration for Claude Desktop:

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "/path/to/mcp-gitlab/build/index.js",
      "env": {
        "GITLAB_URL": "https://gitlab.com",
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Example Interactions

Once connected, you can ask the AI assistant things like:

- "Show me my open merge requests"
- "What merge requests do I need to review?"
- "Get details for merge request !123 in project 456"
- "Approve the merge request !789 in project 101"
- "List all my GitLab projects"

## Development

To make changes to the server:

1. Edit the TypeScript files in `src/`
2. Build with `npm run build`
3. Test your changes

## License

ISC