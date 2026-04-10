import { transformAsync } from "@babel/core";
import { getConfig } from "@lingui/conf";
import { defineConfig } from "tsdown";
import { fileURLToPath } from "node:url";

const JS_TS_RE = /\.[jt]sx?$/;
const linguiConfig = getConfig({
	configPath: fileURLToPath(new URL("./lingui.config.ts", import.meta.url)),
});

function linguiMacroPlugin() {
	return {
		name: "lingui-macro",
		transform: {
			filter: { id: JS_TS_RE },
			async handler(code: string, id: string) {
				if (!code.includes("@lingui")) return;
				const result = await transformAsync(code, {
					filename: id,
					plugins: [["@lingui/babel-plugin-lingui-macro", { linguiConfig }]],
					parserOpts: { plugins: ["jsx", "typescript"] },
				});
				if (!result?.code) return;
				return { code: result.code, map: result.map ?? undefined };
			},
		},
	};
}

export default defineConfig({
	entry: ["src/index.ts", "src/locales/index.ts"],
	format: ["esm"],
	dts: true,
	clean: true,
	platform: "browser",
	plugins: [linguiMacroPlugin()],
	// @tiptap/suggestion is intentionally bundled (devDependency)
	inlineOnly: false,
	external: [
		"react",
		"react-dom",
		"react/jsx-runtime",
		"react/jsx-dev-runtime",
		// Keep TanStack external - Vite in consumer project will need to resolve these
		"@tanstack/react-router",
		"@tanstack/react-query",
	],
});
