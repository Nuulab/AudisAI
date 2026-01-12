import { jsx, jsxs } from "react/jsx-runtime";
import { b as baseOptions } from "./layout.shared-CHsHlrDs.js";
import { Link } from "@tanstack/react-router";
import { H as HomeLayout } from "./router-D0kxAyaB.js";
import "class-variance-authority";
import "react";
import "tailwind-merge";
import "lucide-react";
import "@radix-ui/react-popover";
import "next-themes";
import "@radix-ui/react-navigation-menu";
import "@radix-ui/react-direction";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "fumadocs-mdx/runtime/browser";
import "scroll-into-view-if-needed";
import "./source-FYbSgCnA.js";
import "node:path";
import "fumadocs-mdx/runtime/server";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-scroll-area";
import "@radix-ui/react-presence";
import "@radix-ui/react-tabs";
import "@orama/orama";
function Home() {
  return /* @__PURE__ */ jsx(HomeLayout, { ...baseOptions(), children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 items-center justify-center px-4 py-16 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-6", children: "AudisAI" }),
    /* @__PURE__ */ jsx("p", { className: "max-w-[640px] text-lg text-muted-foreground sm:text-xl mb-8", children: "Automated AI Compliance & Static Analysis. Scan codebases for violations of EU AI Act, NIST, ISO 27001, and US State Laws." }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mb-16", children: [
      /* @__PURE__ */ jsx(Link, { to: "/docs/$", params: {
        _splat: "guide/introduction"
      }, className: "px-6 py-3 rounded-lg bg-fd-primary text-fd-primary-foreground font-semibold text-sm transition-colors hover:bg-fd-primary/90", children: "Get Started" }),
      /* @__PURE__ */ jsx("a", { href: "https://github.com/Nuulab/AudisAI", target: "_blank", rel: "noreferrer", className: "px-6 py-3 rounded-lg border border-fd-border bg-fd-background hover:bg-fd-accent hover:text-fd-accent-foreground font-semibold text-sm transition-colors", children: "GitHub" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl w-full text-left", children: [
      /* @__PURE__ */ jsx(FeatureCard, { title: "Privacy First", description: "Zero-AI pattern matching. No LLMs required. Your code never leaves your machine." }),
      /* @__PURE__ */ jsx(FeatureCard, { title: "Multi-Framework", description: "Support for 12+ policies including EU AI Act, NIST AI RMF, ISO 27001, and more." }),
      /* @__PURE__ */ jsx(FeatureCard, { title: "CI/CD Ready", description: "Integrate seamlessly into GitHub Actions or GitLab CI with native SARIF output." })
    ] })
  ] }) });
}
function FeatureCard({
  title,
  description
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-fd-border bg-fd-card p-6 shadow-sm", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2 text-fd-card-foreground", children: title }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: description })
  ] });
}
export {
  Home as component
};
