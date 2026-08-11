/**
 * Fetches credentials from ngrok vault.
 * Falls back to process.env if vault is not configured.
 */

let cachedCredentials: { username: string; password: string } | null = null;

interface NgrokSecret {
  name: string;
  value?: string;
}

interface NgrokVaultResponse {
  secrets: NgrokSecret[];
}

export async function getAdminCredentials(): Promise<{
  username: string;
  password: string;
}> {
  // Return cached if available
  if (cachedCredentials) return cachedCredentials;

  const apiKey = process.env.NGROK_API_KEY;
  const vaultId = process.env.NGROK_VAULT_ID;

  // Fallback to env vars if vault not configured
  if (!apiKey || !vaultId) {
    return {
      username: process.env.ADMIN_USERNAME || "sanctuary",
      password: process.env.ADMIN_PASSWORD || "change-this-password",
    };
  }

  try {
    const res = await fetch(
      `https://api.ngrok.com/vaults/${vaultId}/secrets`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Ngrok-Version": "2",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error(`ngrok vault API returned ${res.status}`);

    const data: NgrokVaultResponse = await res.json();
    const secrets = data.secrets || [];

    const findSecret = (name: string): string =>
      secrets.find((s) => s.name === name)?.value || "";

    const username = findSecret("sanctuary-admin-username") || "sanctuary";
    const password = findSecret("sanctuary-admin-password") || "";

    if (!password) {
      throw new Error("sanctuary-admin-password not found in ngrok vault");
    }

    // Cache for the lifetime of the server process
    cachedCredentials = { username, password };
    return cachedCredentials;
  } catch (err) {
    console.error("Vault fetch failed, falling back to env:", err);
    return {
      username: process.env.ADMIN_USERNAME || "sanctuary",
      password: process.env.ADMIN_PASSWORD || "change-this-password",
    };
  }
}

// Allow clearing the cache (e.g., on hot reload in dev)
export function clearVaultCache(): void {
  cachedCredentials = null;
}