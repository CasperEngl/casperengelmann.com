/// <reference path="../.astro/types.d.ts" />
/// <reference path="../.astro/env.d.ts" />
/// <reference types="astro/client" />

type KVNamespace = import('@cloudflare/workers-types').KVNamespace
type ENV = {
  MY_KV: KVNamespace
}

// use a default runtime configuration (advanced mode).
type Runtime = import('@astrojs/cloudflare').Runtime<ENV>
declare namespace App {
  interface Locals extends Runtime {}
}
