import type { RouteContext, RouteHandler, RouteParams } from "./route"

declare global {
  type ApiRouteParams<TParams extends RouteParams = RouteParams> = TParams
  type ApiRouteContext<TParams extends RouteParams = RouteParams> = RouteContext<TParams>
  type ApiRouteHandler<
    TParams extends RouteParams = RouteParams,
    TResult = Response | void
  > = RouteHandler<TParams, TResult>
}

export type { RouteParams, RouteContext, RouteHandler }

export {}

