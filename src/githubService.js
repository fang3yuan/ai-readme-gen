import fetch from 'node-fetch';

export async function getRepoMetadata(repoUrl) {
  const cleanUrl = repoUrl.trim().replace(/\/$/, '');
  const parts = cleanUrl.split('/');
  if (parts.length < 2) {
    throw new Error('Invalid GitHub repository URL format.');
  }
  const owner = parts[parts.length - 2];
  const repo = parts[parts.length - 1];

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'AI-README-Architect-CLI' }
  });

  if (!repoRes.ok) {
    throw new Error(`GitHub Repository search failed (${repoRes.status}): ${repoRes.statusText}`);
  }

  const data = await repoRes.json();
  return {
    owner,
    repo,
    defaultBranch: data.default_branch || 'main',
    description: data.description || '',
    topics: data.topics || []
  };
}

export async function fetchFullProjectTree(owner, repo, branch) {
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  
  const response = await fetch(treeUrl, {
    headers: { 'User-Agent': 'AI-README-Architect-CLI' }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub Trees API: ${response.statusText}`);
  }

  const data = await response.json();

  return data.tree
    .filter(item => item.type === 'blob')
    .map(file => ({
      path: file.path,
      size: file.size,
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`
    }));
}

export async function fetchFileRawText(rawUrl) {
  try {
    const res = await fetch(rawUrl);
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    return null;
  }
}
