const config = {
	sourceLocale: "en",
	locales: ["en"],
	catalogs: [
		{
			path: "<rootDir>/src/locales/{locale}/messages",
			include: ["<rootDir>/src/**/*.{ts,tsx}"],
		},
	],
	format: "po",
};

export default config;
