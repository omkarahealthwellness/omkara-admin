"use server";

import { getManifest, getManifestHash } from "./kv-manifest";

export async function fetchManifestAction() {
  return await getManifest();
}

export async function fetchManifestHashAction() {
  return await getManifestHash();
}
