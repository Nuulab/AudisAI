import { a as createServerRpc, c as createServerFn } from "../server.js";
import { notFound } from "@tanstack/react-router";
import { s as source } from "./source-FYbSgCnA.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "node:path";
import "fumadocs-mdx/runtime/server";
import "react";
import "lucide-react";
const serverLoader_createServerFn_handler = createServerRpc("3754d170b07e5384cb393a7ce01e3317e54e102cb5b75ed0780e1a678ae2d91a", (opts, signal) => serverLoader.__executeServer(opts, signal));
const serverLoader = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).handler(serverLoader_createServerFn_handler, async ({
  data: slugs
}) => {
  const page = source.getPage(slugs);
  if (!page) throw notFound();
  return {
    path: page.path,
    pageTree: await source.serializePageTree(source.getPageTree())
  };
});
export {
  serverLoader_createServerFn_handler
};
