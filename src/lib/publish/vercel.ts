export interface DeployFile {
  file: string;
  data: string;
  encoding?: "base64";
}

interface VercelDeploymentResponse {
  id: string;
  url: string;
  readyState: string;
}

function getConfig() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error("VERCEL_TOKEN is not set. Add it to .env.local (see .env.local.example).");
  }
  return { token, teamId: process.env.VERCEL_TEAM_ID };
}

function withTeam(url: string, teamId?: string) {
  return teamId ? `${url}${url.includes("?") ? "&" : "?"}teamId=${teamId}` : url;
}

export async function deployToVercel(projectName: string, files: DeployFile[]): Promise<string> {
  const { token, teamId } = getConfig();

  const createRes = await fetch(withTeam("https://api.vercel.com/v13/deployments", teamId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      files,
      target: "production",
    }),
  });

  const created = (await createRes.json()) as VercelDeploymentResponse & { error?: { message: string } };
  if (!createRes.ok) {
    throw new Error(`Vercel deployment creation failed: ${created.error?.message ?? createRes.statusText}`);
  }

  const deploymentId = created.id;
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusRes = await fetch(
      withTeam(`https://api.vercel.com/v13/deployments/${deploymentId}`, teamId),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const status = (await statusRes.json()) as VercelDeploymentResponse;

    if (status.readyState === "READY") {
      return `https://${status.url}`;
    }
    if (status.readyState === "ERROR" || status.readyState === "CANCELED") {
      throw new Error(`Vercel deployment failed with state: ${status.readyState}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Vercel deployment timed out waiting for READY state.");
}
