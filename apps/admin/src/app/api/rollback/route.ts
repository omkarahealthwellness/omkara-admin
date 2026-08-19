import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { KVNamespace } from "@cloudflare/workers-types";

interface CloudflareEnv {
  MANIFEST_KV: KVNamespace;
}

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = process.env.PUBLISH_API_KEY;
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json({ error: "Unauthorized Rollback Attempt" }, { status: 401 });
    }

    const body = await req.json() as { versionId: string };
    const { versionId } = body;
    
    if (!versionId) {
      return NextResponse.json({ error: "Missing versionId" }, { status: 400 });
    }

    // 2. Access KV
    try {
      let kvSuccess = false;
      const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
      if (env && env.MANIFEST_KV) {
        // 2. Fetch the target version
        const targetManifest = await env.MANIFEST_KV.get(`manifest_${versionId}.json`);
        
        if (!targetManifest) {
          return NextResponse.json({ error: "Target version not found" }, { status: 404 });
        }
        
        // 3. Flip LATEST pointer
        await env.MANIFEST_KV.put(`manifest_LATEST.json`, targetManifest);
        
        // 4. Audit trail
        const logEntry = JSON.stringify({ timestamp: new Date().toISOString(), version: versionId, action: "rollback", user: "admin" });
        await env.MANIFEST_KV.put(`audit_log_rollback_${Date.now()}`, logEntry);
        
        kvSuccess = true;
      }

      if (!kvSuccess) {
        return NextResponse.json({ error: "KV access failed" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully rolled back to ${versionId}`
      });

    } catch (e: any) {
      return NextResponse.json({ error: "KV access failed", details: e.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Rollback error:", error);
    return NextResponse.json({ 
      error: "Failed to rollback", 
      details: error.message 
    }, { status: 500 });
  }
}
