import type { NextRequest } from "next/server"

export type RouteParams = Record<string, string>

export type RouteContext<TParams extends RouteParams = RouteParams> = {
  params: TParams
}

export type RouteHandler<
  TParams extends RouteParams = RouteParams,
  TResult extends Response | void = Response
> = (
  request: NextRequest,
  context: RouteContext<TParams>
) => TResult | Promise<TResult>

type NextCompatibleRouteHandler<TParams extends RouteParams, TResult> = (
  request: NextRequest,
  context: { params: TParams | Promise<TParams> }
) => TResult | Promise<TResult>

export const defineRoute = <
  TParams extends RouteParams = RouteParams,
  TResult extends Response | void = Response
>(
  handler: RouteHandler<TParams, TResult>
): NextCompatibleRouteHandler<TParams, TResult> => {
  return async (request, context) => {
    const params = await Promise.resolve(context.params)
    return handler(request, { params })
  }
}

export type { RouteContext as AppRouteContext, RouteHandler as AppRouteHandler }
