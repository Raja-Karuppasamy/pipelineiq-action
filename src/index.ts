import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const apiKey = core.getInput('api-key', { required: true });
    const apiUrl = core.getInput('api-url');
    const context = github.context;

    // Get job status from environment
    const jobStatus = core.getInput('job-status') || 'success';

    // Build payload
    const payload = {
      repo_full_name: context.repo.owner + '/' + context.repo.repo,
      branch: context.ref.replace('refs/heads/', ''),
      commit_sha: context.sha,
      commit_message: context.payload.head_commit?.message || '',
      workflow_name: context.workflow,
      status: jobStatus.toLowerCase(),
      duration_seconds: 0,
      started_at: new Date().toISOString(),
      github_run_id: context.runId.toString(),
      html_url: `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`,
      triggered_by: context.actor,
      runner_os: process.env.RUNNER_OS || '',
      error_logs: jobStatus.toLowerCase() === 'failure'
        ? (process.env.RUNNER_DEBUG === '1' ? 'Debug logs enabled' : 'Pipeline failed - check GitHub Actions logs for details')
        : null,
    };

    core.info(`📊 Sending pipeline data to PipelineIQ...`);
    core.info(`   Repo: ${payload.repo_full_name}`);
    core.info(`   Branch: ${payload.branch}`);
    core.info(`   Status: ${payload.status}`);

    const response = await fetch(`${apiUrl}/api/v1/pipelines/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PipelineIQ-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      core.warning(`PipelineIQ API error: ${response.status} - ${error}`);
      return;
    }

    const data = await response.json();
    core.info(`✅ PipelineIQ: Pipeline run recorded successfully`);

    if (payload.status === 'failure') {
      core.info(`🧠 PipelineIQ: AI diagnosis in progress — check your Slack or dashboard at pipelineiq.dev/dashboard`);
    }

    core.setOutput('run-id', (data as any).data?.id || '');

  } catch (error) {
    // Never fail the pipeline because of PipelineIQ
    core.warning(`PipelineIQ action failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

run();