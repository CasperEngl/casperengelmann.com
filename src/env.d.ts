interface ImportMetaEnv {
  readonly DENO_DEPLOY_TOKEN: string
  readonly GITHUB_API_KEY: string
  readonly UPSTASH_REDIS_REST_TOKEN: string
  readonly UPSTASH_REDIS_REST_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
