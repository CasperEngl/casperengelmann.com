import { Config, Context, Effect, Layer, Schema } from 'effect'
import { HttpClient, HttpClientResponse } from 'effect/http'

export class GitHubRepo extends Schema.Class<GitHubRepo>('GitHubRepo')({
  html_url: Schema.String,
  full_name: Schema.String,
  private: Schema.optional(Schema.Boolean),
}) {}

const GitHubRepos = Schema.Array(GitHubRepo)

export class GitHub extends Context.Service<GitHub>()('app/GitHub', {
  make: Effect.gen(function* () {
    const apiKey = yield* Config.String('GITHUB_API_KEY')
    const client = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk,
    )

    const getStarredRepos = Effect.fn('GitHub.getStarredRepos')(function* () {
      const response = yield* client.get(
        'https://api.github.com/users/casperengl/starred?per_page=10',
        {
          headers: {
            Authorization: `token ${apiKey}`,
            'User-Agent': 'Casper-Engeln',
          },
        },
      )
      const repos = yield* response.pipe(
        HttpClientResponse.schemaBodyJson(GitHubRepos),
      )

      return repos.filter((repo) => !repo.private)
    })

    return { getStarredRepos } as const
  }),
}) {
  static readonly layer = Layer.effect(this)(this.make)
}
