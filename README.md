# PipelineIQ Action

Automatically send pipeline data to PipelineIQ for AI-powered failure diagnosis.

## Usage

Add this step to any GitHub Actions workflow:
```yaml
- name: PipelineIQ
  if: always()
  uses: Raja-Karuppasamy/pipelineiq-action@v1
  with:
    api-key: ${{ secrets.PIPELINEIQ_API_KEY }}
```

## What it does

- Automatically captures pipeline status, repo, branch, commit, and workflow info
- Sends data to PipelineIQ on every run
- Triggers AI diagnosis when a failure is detected
- Sends fix recommendations to your Slack channel

## Setup

1. Get your API key from [pipelineiq.dev](https://pipelineiq.dev)
2. Add `PIPELINEIQ_API_KEY` to your GitHub repository secrets
3. Add the action step to your workflow

That's it. No configuration needed.
