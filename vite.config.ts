import { defineConfig, loadEnv, type Plugin, type PreviewServer, type ViteDevServer } from "vite";
import tailwindcss from "@tailwindcss/vite";

const ASSET_LINKS_PATH = "/.well-known/assetlinks.json";
const FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

/**
 * Digital Asset Links: proves to Android that the Google Play app (a Trusted Web Activity) and this
 * site belong together, so the app opens the site full screen, without the browser bar. Only added
 * when the package and its signing certificates are configured; see docs/android.md.
 */
function assetLinks(packageName: string | undefined, fingerprints: string | undefined): Plugin | null {
	const certificates = (fingerprints ?? "").split(",").map((fingerprint) => fingerprint.trim().toUpperCase()).filter(Boolean);
	if (!packageName || !certificates.length) return null;
	const invalid = certificates.find((fingerprint) => !FINGERPRINT.test(fingerprint));
	if (invalid) throw new Error(`ANDROID_SHA256_CERT_FINGERPRINTS: "${invalid}" is not a SHA-256 fingerprint (32 hex pairs separated by colons)`);

	const json = JSON.stringify(
		[{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: packageName, sha256_cert_fingerprints: certificates } }],
		null,
		2,
	);
	const serve = (server: ViteDevServer | PreviewServer) => {
		server.middlewares.use(ASSET_LINKS_PATH, (_request, response) => {
			response.setHeader("Content-Type", "application/json");
			response.end(json);
		});
	};

	return {
		name: "lexflow-asset-links",
		configureServer: serve,
		// `vite preview` does not serve dot folders from dist/.
		configurePreviewServer: serve,
		generateBundle() {
			this.emitFile({ type: "asset", fileName: ASSET_LINKS_PATH.slice(1), source: json });
		},
	};
}

export default defineConfig(({ mode }) => {
	// Without the VITE_ prefix, so they reach this file but never the browser bundle.
	const env = loadEnv(mode, ".", "ANDROID_");
	return {
		plugins: [tailwindcss(), assetLinks(env.ANDROID_PACKAGE_ID, env.ANDROID_SHA256_CERT_FINGERPRINTS)],
	};
});
