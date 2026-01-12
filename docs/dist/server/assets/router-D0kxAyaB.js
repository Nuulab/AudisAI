import { jsx, jsxs, Fragment as Fragment$1 } from "react/jsx-runtime";
import { Link as Link$2, useParams, useRouter as useRouter$1, useRouterState, createRootRoute, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { cva } from "class-variance-authority";
import * as React from "react";
import { use, createContext, useMemo, useRef, useContext, useState, useEffectEvent, useEffect, forwardRef, Fragment, lazy, useLayoutEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { Search, Sun, Moon, Airplay, Languages, ChevronDown, ExternalLink, ChevronsUpDown, Check, ChevronRight, ChevronLeft, Text, Lightbulb, CircleCheck, CircleX, TriangleAlert, Info, Link as Link$3, Clipboard } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useTheme, ThemeProvider } from "next-themes";
import * as Primitive from "@radix-ui/react-navigation-menu";
import { DirectionProvider } from "@radix-ui/react-direction";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { browser } from "fumadocs-mdx/runtime/browser";
import scrollIntoView from "scroll-into-view-if-needed";
import { n as normalizeUrl, f as findPath, b as basename, e as extname, s as source } from "./source-FYbSgCnA.js";
import * as Primitive$1 from "@radix-ui/react-collapsible";
import * as Primitive$2 from "@radix-ui/react-scroll-area";
import { Presence } from "@radix-ui/react-presence";
import * as Primitive$3 from "@radix-ui/react-tabs";
import { search, getByID, save, create as create$1, insertMultiple } from "@orama/orama";
const variants = {
  primary: "bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/80",
  outline: "border hover:bg-fd-accent hover:text-fd-accent-foreground",
  ghost: "hover:bg-fd-accent hover:text-fd-accent-foreground",
  secondary: "border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
};
const buttonVariants = cva("inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring", { variants: {
  variant: variants,
  color: variants,
  size: {
    sm: "gap-1 px-2 py-1.5 text-xs",
    icon: "p-1.5 [&_svg]:size-5",
    "icon-sm": "p-1.5 [&_svg]:size-4.5",
    "icon-xs": "p-1 [&_svg]:size-4"
  }
} });
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
      key = keys[i];
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget);
const notImplemented = () => {
  throw new Error("You need to wrap your application inside `FrameworkProvider`.");
};
const FrameworkContext = createContext({
  useParams: notImplemented,
  useRouter: notImplemented,
  usePathname: notImplemented
});
function FrameworkProvider({ Link: Link$12, useRouter: useRouter$12, useParams: useParams$1, usePathname: usePathname$1, Image: Image$12, children }) {
  return /* @__PURE__ */ jsx(FrameworkContext, {
    value: useMemo(() => ({
      usePathname: usePathname$1,
      useRouter: useRouter$12,
      Link: Link$12,
      Image: Image$12,
      useParams: useParams$1
    }), [
      Link$12,
      usePathname$1,
      useRouter$12,
      useParams$1,
      Image$12
    ]),
    children
  });
}
function usePathname() {
  return use(FrameworkContext).usePathname();
}
function useRouter() {
  return use(FrameworkContext).useRouter();
}
function Image(props) {
  const { Image: Image$12 } = use(FrameworkContext);
  if (!Image$12) {
    const { src, alt, priority, ...rest } = props;
    return /* @__PURE__ */ jsx("img", {
      alt,
      src,
      fetchPriority: priority ? "high" : "auto",
      ...rest
    });
  }
  return /* @__PURE__ */ jsx(Image$12, { ...props });
}
function Link$1(props) {
  const { Link: Link$12 } = use(FrameworkContext);
  if (!Link$12) {
    const { href, prefetch: _, ...rest } = props;
    return /* @__PURE__ */ jsx("a", {
      href,
      ...rest
    });
  }
  return /* @__PURE__ */ jsx(Link$12, { ...props });
}
const defaultTranslations = {
  search: "Search",
  searchNoResult: "No results found",
  toc: "On this page",
  tocNoHeadings: "No Headings",
  lastUpdate: "Last updated on",
  chooseLanguage: "Choose a language",
  nextPage: "Next Page",
  previousPage: "Previous Page",
  chooseTheme: "Theme",
  editOnGithub: "Edit on GitHub"
};
const I18nContext = createContext({ text: defaultTranslations });
function I18nLabel(props) {
  const { text } = useI18n();
  return text[props.label];
}
function useI18n() {
  return useContext(I18nContext);
}
function I18nProvider({ locales = [], locale, onLocaleChange, children, translations }) {
  const router2 = useRouter();
  const pathname = usePathname();
  const onChange = (value) => {
    if (onLocaleChange) return onLocaleChange(value);
    const segments = pathname.split("/").filter((v) => v.length > 0);
    if (segments[0] !== locale) segments.unshift(value);
    else segments[0] = value;
    router2.push(`/${segments.join("/")}`);
  };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  return /* @__PURE__ */ jsx(I18nContext, {
    value: useMemo(() => ({
      locale,
      locales,
      text: {
        ...defaultTranslations,
        ...translations
      },
      onChange: (v) => onChangeRef.current(v)
    }), [
      locale,
      locales,
      translations
    ]),
    children
  });
}
const import__fumadocs_ui_contexts_i18n = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  I18nLabel,
  I18nProvider,
  defaultTranslations,
  useI18n
}, Symbol.toStringTag, { value: "Module" }));
var i18n_exports = {};
__reExport(i18n_exports, import__fumadocs_ui_contexts_i18n);
const SearchContext = createContext({
  enabled: false,
  hotKey: [],
  setOpenSearch: () => void 0
});
function useSearchContext() {
  return use(SearchContext);
}
function MetaOrControl() {
  const [key, setKey] = useState("⌘");
  useEffect(() => {
    if (window.navigator.userAgent.includes("Windows")) setKey("Ctrl");
  }, []);
  return key;
}
function SearchProvider({ SearchDialog, children, preload = true, options, hotKey = [{
  key: (e) => e.metaKey || e.ctrlKey,
  display: /* @__PURE__ */ jsx(MetaOrControl, {})
}, {
  key: "k",
  display: "K"
}], links }) {
  const [isOpen, setIsOpen] = useState(preload ? false : void 0);
  const onKeyDown = useEffectEvent((e) => {
    if (hotKey.every((v) => typeof v.key === "string" ? e.key === v.key : v.key(e))) {
      setIsOpen((open) => !open);
      e.preventDefault();
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hotKey]);
  return /* @__PURE__ */ jsxs(SearchContext, {
    value: useMemo(() => ({
      enabled: true,
      hotKey,
      setOpenSearch: setIsOpen
    }), [hotKey]),
    children: [isOpen !== void 0 && /* @__PURE__ */ jsx(SearchDialog, {
      open: isOpen,
      onOpenChange: setIsOpen,
      links,
      ...options
    }), children]
  });
}
function SearchOnly({ children }) {
  if (useSearchContext().enabled) return children;
}
const import__fumadocs_ui_contexts_search = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SearchOnly,
  SearchProvider,
  useSearchContext
}, Symbol.toStringTag, { value: "Module" }));
var search_exports = {};
__reExport(search_exports, import__fumadocs_ui_contexts_search);
function SearchToggle({ hideIfDisabled, size = "icon-sm", color = "ghost", ...props }) {
  const { setOpenSearch, enabled } = (0, search_exports.useSearchContext)();
  if (hideIfDisabled && !enabled) return null;
  return /* @__PURE__ */ jsx("button", {
    type: "button",
    className: twMerge(buttonVariants({
      size,
      color
    }), props.className),
    "data-search": "",
    "aria-label": "Open Search",
    onClick: () => {
      setOpenSearch(true);
    },
    children: /* @__PURE__ */ jsx(Search, {})
  });
}
function LargeSearchToggle({ hideIfDisabled, ...props }) {
  const { enabled, hotKey, setOpenSearch } = (0, search_exports.useSearchContext)();
  const { text } = (0, i18n_exports.useI18n)();
  if (hideIfDisabled && !enabled) return null;
  return /* @__PURE__ */ jsxs("button", {
    type: "button",
    "data-search-full": "",
    ...props,
    className: twMerge("inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground", props.className),
    onClick: () => {
      setOpenSearch(true);
    },
    children: [
      /* @__PURE__ */ jsx(Search, { className: "size-4" }),
      text.search,
      /* @__PURE__ */ jsx("div", {
        className: "ms-auto inline-flex gap-0.5",
        children: hotKey.map((k, i) => /* @__PURE__ */ jsx("kbd", {
          className: "rounded-md border bg-fd-background px-1.5",
          children: k.display
        }, i))
      })
    ]
  });
}
const Link = forwardRef(({ href = "#", external = href.match(/^\w+:/) || href.startsWith("//"), prefetch, children, ...props }, ref) => {
  if (external) return /* @__PURE__ */ jsx("a", {
    ref,
    href,
    rel: "noreferrer noopener",
    target: "_blank",
    ...props,
    children
  });
  return /* @__PURE__ */ jsx(Link$1, {
    ref,
    href,
    prefetch,
    ...props,
    children
  });
});
Link.displayName = "Link";
function resolveLinkItems({ links = [], githubUrl }) {
  const result = [...links];
  if (githubUrl) result.push({
    type: "icon",
    url: githubUrl,
    text: "Github",
    label: "GitHub",
    icon: /* @__PURE__ */ jsx("svg", {
      role: "img",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      children: /* @__PURE__ */ jsx("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" })
    }),
    external: true
  });
  return result;
}
function renderTitleNav({ title, url = "/" }, props) {
  if (typeof title === "function") return title({
    href: url,
    ...props
  });
  return /* @__PURE__ */ jsx(Link, {
    href: url,
    ...props,
    children: title
  });
}
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(PopoverPrimitive.Content, {
  ref,
  align,
  sideOffset,
  side: "bottom",
  className: twMerge("z-50 origin-(--radix-popover-content-transform-origin) overflow-y-auto max-h-(--radix-popover-content-available-height) min-w-[240px] max-w-[98vw] rounded-xl border bg-fd-popover/60 backdrop-blur-lg p-2 text-sm text-fd-popover-foreground shadow-lg focus-visible:outline-none data-[state=closed]:animate-fd-popover-out data-[state=open]:animate-fd-popover-in", className),
  ...props
}) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
function LanguageToggle(props) {
  const context = (0, i18n_exports.useI18n)();
  if (!context.locales) throw new Error("Missing `<I18nProvider />`");
  return /* @__PURE__ */ jsxs(Popover, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
    "aria-label": context.text.chooseLanguage,
    ...props,
    className: twMerge(buttonVariants({
      color: "ghost",
      className: "gap-1.5 p-1.5"
    }), props.className),
    children: props.children
  }), /* @__PURE__ */ jsxs(PopoverContent, {
    className: "flex flex-col overflow-x-hidden p-0",
    children: [/* @__PURE__ */ jsx("p", {
      className: "mb-1 p-2 text-xs font-medium text-fd-muted-foreground",
      children: context.text.chooseLanguage
    }), context.locales.map((item) => /* @__PURE__ */ jsx("button", {
      type: "button",
      className: twMerge("p-2 text-start text-sm", item.locale === context.locale ? "bg-fd-primary/10 font-medium text-fd-primary" : "hover:bg-fd-accent hover:text-fd-accent-foreground"),
      onClick: () => {
        context.onChange?.(item.locale);
      },
      children: item.name
    }, item.locale))]
  })] });
}
function LanguageToggleText(props) {
  const context = (0, i18n_exports.useI18n)();
  const text = context.locales?.find((item) => item.locale === context.locale)?.name;
  return /* @__PURE__ */ jsx("span", {
    ...props,
    children: text
  });
}
const itemVariants = cva("size-6.5 rounded-full p-1.5 text-fd-muted-foreground", { variants: { active: {
  true: "bg-fd-accent text-fd-accent-foreground",
  false: "text-fd-muted-foreground"
} } });
const full = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Airplay]
];
function ThemeToggle({ className, mode = "light-dark", ...props }) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const container = twMerge("inline-flex items-center rounded-full border p-1", className);
  if (mode === "light-dark") {
    const value$1 = mounted ? resolvedTheme : null;
    return /* @__PURE__ */ jsx("button", {
      className: container,
      "aria-label": `Toggle Theme`,
      onClick: () => setTheme(value$1 === "light" ? "dark" : "light"),
      "data-theme-toggle": "",
      children: full.map(([key, Icon]) => {
        if (key === "system") return;
        return /* @__PURE__ */ jsx(Icon, {
          fill: "currentColor",
          className: twMerge(itemVariants({ active: value$1 === key }))
        }, key);
      })
    });
  }
  const value = mounted ? theme : null;
  return /* @__PURE__ */ jsx("div", {
    className: container,
    "data-theme-toggle": "",
    ...props,
    children: full.map(([key, Icon]) => /* @__PURE__ */ jsx("button", {
      "aria-label": key,
      className: twMerge(itemVariants({ active: value === key })),
      onClick: () => setTheme(key),
      children: /* @__PURE__ */ jsx(Icon, {
        className: "size-full",
        fill: "currentColor"
      })
    }, key))
  });
}
const NavigationMenu = Primitive.Root;
const NavigationMenuList = Primitive.List;
const NavigationMenuItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(Primitive.NavigationMenuItem, {
  ref,
  className: twMerge("list-none", className),
  ...props,
  children
}));
NavigationMenuItem.displayName = Primitive.NavigationMenuItem.displayName;
const NavigationMenuTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(Primitive.Trigger, {
  ref,
  className: twMerge("data-[state=open]:bg-fd-accent/50", className),
  ...props,
  children
}));
NavigationMenuTrigger.displayName = Primitive.Trigger.displayName;
const NavigationMenuContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(Primitive.Content, {
  ref,
  className: twMerge("absolute inset-x-0 top-0 overflow-auto fd-scroll-container max-h-[80svh] data-[motion=from-end]:animate-fd-enterFromRight data-[motion=from-start]:animate-fd-enterFromLeft data-[motion=to-end]:animate-fd-exitToRight data-[motion=to-start]:animate-fd-exitToLeft", className),
  ...props
}));
NavigationMenuContent.displayName = Primitive.Content.displayName;
const NavigationMenuLink = Primitive.Link;
const NavigationMenuViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
  ref,
  className: "flex w-full justify-center",
  children: /* @__PURE__ */ jsx(Primitive.Viewport, {
    ...props,
    className: twMerge("relative h-(--radix-navigation-menu-viewport-height) w-full origin-[top_center] overflow-hidden transition-[width,height] duration-300 data-[state=closed]:animate-fd-nav-menu-out data-[state=open]:animate-fd-nav-menu-in", className)
  })
}));
NavigationMenuViewport.displayName = Primitive.Viewport.displayName;
function useIsScrollTop({ enabled = true }) {
  const [isTop, setIsTop] = useState();
  useEffect(() => {
    if (!enabled) return;
    const listener = () => {
      setIsTop(window.scrollY < 10);
    };
    listener();
    window.addEventListener("scroll", listener);
    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, [enabled]);
  return isTop;
}
function normalize(urlOrPath) {
  if (urlOrPath.length > 1 && urlOrPath.endsWith("/")) return urlOrPath.slice(0, -1);
  return urlOrPath;
}
function isActive(href, pathname, nested = true) {
  href = normalize(href);
  pathname = normalize(pathname);
  return href === pathname || nested && pathname.startsWith(`${href}/`);
}
function LinkItem({ ref, item, ...props }) {
  const pathname = usePathname();
  const activeType = item.active ?? "url";
  const active = activeType !== "none" && isActive(item.url, pathname, activeType === "nested-url");
  return /* @__PURE__ */ jsx(Link, {
    ref,
    href: item.url,
    external: item.external,
    ...props,
    "data-active": active,
    children: props.children
  });
}
const navItemVariants = cva("[&_svg]:size-4", {
  variants: { variant: {
    main: "inline-flex items-center gap-1 p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary",
    button: buttonVariants({
      color: "secondary",
      className: "gap-1.5"
    }),
    icon: buttonVariants({
      color: "ghost",
      size: "icon"
    })
  } },
  defaultVariants: { variant: "main" }
});
function Header({ nav = {}, i18n = false, links, githubUrl, themeSwitch = {}, searchToggle = {} }) {
  const { navItems, menuItems } = useMemo(() => {
    const navItems$1 = [];
    const menuItems$1 = [];
    for (const item of resolveLinkItems({
      links,
      githubUrl
    })) switch (item.on ?? "all") {
      case "menu":
        menuItems$1.push(item);
        break;
      case "nav":
        navItems$1.push(item);
        break;
      default:
        navItems$1.push(item);
        menuItems$1.push(item);
    }
    return {
      navItems: navItems$1,
      menuItems: menuItems$1
    };
  }, [links, githubUrl]);
  return /* @__PURE__ */ jsxs(HeaderNavigationMenu, {
    transparentMode: nav.transparentMode,
    children: [
      renderTitleNav(nav, { className: "inline-flex items-center gap-2.5 font-semibold" }),
      nav.children,
      /* @__PURE__ */ jsx("ul", {
        className: "flex flex-row items-center gap-2 px-6 max-sm:hidden",
        children: navItems.filter((item) => !isSecondary(item)).map((item, i) => /* @__PURE__ */ jsx(NavigationMenuLinkItem, {
          item,
          className: "text-sm"
        }, i))
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex flex-row items-center justify-end gap-1.5 flex-1 max-lg:hidden",
        children: [
          searchToggle.enabled !== false && (searchToggle.components?.lg ?? /* @__PURE__ */ jsx(LargeSearchToggle, {
            className: "w-full rounded-full ps-2.5 max-w-[240px]",
            hideIfDisabled: true
          })),
          themeSwitch.enabled !== false && (themeSwitch.component ?? /* @__PURE__ */ jsx(ThemeToggle, { mode: themeSwitch?.mode })),
          i18n && /* @__PURE__ */ jsx(LanguageToggle, { children: /* @__PURE__ */ jsx(Languages, { className: "size-5" }) }),
          /* @__PURE__ */ jsx("ul", {
            className: "flex flex-row gap-2 items-center empty:hidden",
            children: navItems.filter(isSecondary).map((item, i) => /* @__PURE__ */ jsx(NavigationMenuLinkItem, {
              className: twMerge(item.type === "icon" && "-mx-1 first:ms-0 last:me-0"),
              item
            }, i))
          })
        ]
      }),
      /* @__PURE__ */ jsxs("ul", {
        className: "flex flex-row items-center ms-auto -me-1.5 lg:hidden",
        children: [searchToggle.enabled !== false && (searchToggle.components?.sm ?? /* @__PURE__ */ jsx(SearchToggle, {
          className: "p-2",
          hideIfDisabled: true
        })), /* @__PURE__ */ jsxs(NavigationMenuItem, { children: [/* @__PURE__ */ jsx(NavigationMenuTrigger, {
          "aria-label": "Toggle Menu",
          className: twMerge(buttonVariants({
            size: "icon",
            color: "ghost",
            className: "group [&_svg]:size-5.5"
          })),
          onPointerMove: nav.enableHoverToOpen ? void 0 : (e) => e.preventDefault(),
          children: /* @__PURE__ */ jsx(ChevronDown, { className: "transition-transform duration-300 group-data-[state=open]:rotate-180" })
        }), /* @__PURE__ */ jsxs(NavigationMenuContent, {
          className: "flex flex-col p-4 sm:flex-row sm:items-center sm:justify-end",
          children: [menuItems.filter((item) => !isSecondary(item)).map((item, i) => /* @__PURE__ */ jsx(MobileNavigationMenuLinkItem, {
            item,
            className: "sm:hidden"
          }, i)), /* @__PURE__ */ jsxs("div", {
            className: "-ms-1.5 flex flex-row items-center gap-2 max-sm:mt-2",
            children: [
              menuItems.filter(isSecondary).map((item, i) => /* @__PURE__ */ jsx(MobileNavigationMenuLinkItem, {
                item,
                className: twMerge(item.type === "icon" && "-mx-1 first:ms-0")
              }, i)),
              /* @__PURE__ */ jsx("div", {
                role: "separator",
                className: "flex-1"
              }),
              i18n && /* @__PURE__ */ jsxs(LanguageToggle, { children: [
                /* @__PURE__ */ jsx(Languages, { className: "size-5" }),
                /* @__PURE__ */ jsx(LanguageToggleText, {}),
                /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 text-fd-muted-foreground" })
              ] }),
              themeSwitch.enabled !== false && (themeSwitch.component ?? /* @__PURE__ */ jsx(ThemeToggle, { mode: themeSwitch?.mode }))
            ]
          })]
        })] })]
      })
    ]
  });
}
function isSecondary(item) {
  if ("secondary" in item && item.secondary != null) return item.secondary;
  return item.type === "icon";
}
function HeaderNavigationMenu({ transparentMode = "none", ...props }) {
  const [value, setValue] = useState("");
  const isTop = useIsScrollTop({ enabled: transparentMode === "top" }) ?? true;
  const isTransparent = transparentMode === "top" ? isTop : transparentMode === "always";
  return /* @__PURE__ */ jsx(NavigationMenu, {
    value,
    onValueChange: setValue,
    asChild: true,
    children: /* @__PURE__ */ jsx("header", {
      id: "nd-nav",
      ...props,
      className: twMerge("sticky h-14 top-0 z-40", props.className),
      children: /* @__PURE__ */ jsxs("div", {
        className: twMerge("backdrop-blur-lg border-b transition-colors *:mx-auto *:max-w-(--fd-layout-width)", value.length > 0 && "max-lg:shadow-lg max-lg:rounded-b-2xl", (!isTransparent || value.length > 0) && "bg-fd-background/80"),
        children: [/* @__PURE__ */ jsx(NavigationMenuList, {
          className: "flex h-14 w-full items-center px-4",
          asChild: true,
          children: /* @__PURE__ */ jsx("nav", { children: props.children })
        }), /* @__PURE__ */ jsx(NavigationMenuViewport, {})]
      })
    })
  });
}
function NavigationMenuLinkItem({ item, ...props }) {
  if (item.type === "custom") return /* @__PURE__ */ jsx("div", {
    ...props,
    children: item.children
  });
  if (item.type === "menu") {
    const children = item.items.map((child, j) => {
      if (child.type === "custom") return /* @__PURE__ */ jsx(Fragment, { children: child.children }, j);
      const { banner = child.icon ? /* @__PURE__ */ jsx("div", {
        className: "w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4",
        children: child.icon
      }) : null, ...rest } = child.menu ?? {};
      return /* @__PURE__ */ jsx(NavigationMenuLink, {
        asChild: true,
        children: /* @__PURE__ */ jsx(Link, {
          href: child.url,
          external: child.external,
          ...rest,
          className: twMerge("flex flex-col gap-2 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground", rest.className),
          children: rest.children ?? /* @__PURE__ */ jsxs(Fragment$1, { children: [
            banner,
            /* @__PURE__ */ jsx("p", {
              className: "text-base font-medium",
              children: child.text
            }),
            /* @__PURE__ */ jsx("p", {
              className: "text-sm text-fd-muted-foreground empty:hidden",
              children: child.description
            })
          ] })
        })
      }, `${j}-${child.url}`);
    });
    return /* @__PURE__ */ jsxs(NavigationMenuItem, {
      ...props,
      children: [/* @__PURE__ */ jsx(NavigationMenuTrigger, {
        className: twMerge(navItemVariants(), "rounded-md"),
        children: item.url ? /* @__PURE__ */ jsx(Link, {
          href: item.url,
          external: item.external,
          children: item.text
        }) : item.text
      }), /* @__PURE__ */ jsx(NavigationMenuContent, {
        className: "grid grid-cols-1 gap-2 p-4 md:grid-cols-2 lg:grid-cols-3",
        children
      })]
    });
  }
  return /* @__PURE__ */ jsx(NavigationMenuItem, {
    ...props,
    children: /* @__PURE__ */ jsx(NavigationMenuLink, {
      asChild: true,
      children: /* @__PURE__ */ jsx(LinkItem, {
        item,
        "aria-label": item.type === "icon" ? item.label : void 0,
        className: twMerge(navItemVariants({ variant: item.type })),
        children: item.type === "icon" ? item.icon : item.text
      })
    })
  });
}
function MobileNavigationMenuLinkItem({ item, ...props }) {
  if (item.type === "custom") return /* @__PURE__ */ jsx("div", {
    className: twMerge("grid", props.className),
    children: item.children
  });
  if (item.type === "menu") {
    const header = /* @__PURE__ */ jsxs(Fragment$1, { children: [item.icon, item.text] });
    return /* @__PURE__ */ jsxs("div", {
      className: twMerge("mb-4 flex flex-col", props.className),
      children: [/* @__PURE__ */ jsx("p", {
        className: "mb-1 text-sm text-fd-muted-foreground",
        children: item.url ? /* @__PURE__ */ jsx(NavigationMenuLink, {
          asChild: true,
          children: /* @__PURE__ */ jsx(Link, {
            href: item.url,
            external: item.external,
            children: header
          })
        }) : header
      }), item.items.map((child, i) => /* @__PURE__ */ jsx(MobileNavigationMenuLinkItem, { item: child }, i))]
    });
  }
  return /* @__PURE__ */ jsx(NavigationMenuLink, {
    asChild: true,
    children: /* @__PURE__ */ jsxs(LinkItem, {
      item,
      className: twMerge({
        main: "inline-flex items-center gap-2 py-1.5 transition-colors hover:text-fd-popover-foreground/50 data-[active=true]:font-medium data-[active=true]:text-fd-primary [&_svg]:size-4",
        icon: buttonVariants({
          size: "icon",
          color: "ghost"
        }),
        button: buttonVariants({
          color: "secondary",
          className: "gap-1.5 [&_svg]:size-4"
        })
      }[item.type ?? "main"], props.className),
      "aria-label": item.type === "icon" ? item.label : void 0,
      children: [item.icon, item.type === "icon" ? void 0 : item.text]
    })
  });
}
function HomeLayout(props) {
  const { nav = {}, links, githubUrl, i18n, themeSwitch = {}, searchToggle, ...rest } = props;
  return /* @__PURE__ */ jsxs("main", {
    id: "nd-home-layout",
    ...rest,
    className: twMerge("flex flex-1 flex-col [--fd-layout-width:1400px]", rest.className),
    children: [nav.enabled !== false && (nav.component ?? /* @__PURE__ */ jsx(Header, {
      links,
      nav,
      themeSwitch,
      searchToggle,
      i18n,
      githubUrl
    })), props.children]
  });
}
function NotFound() {
  return /* @__PURE__ */ jsx(
    HomeLayout,
    {
      nav: {
        title: "Tanstack Start"
      },
      className: "text-center py-32 justify-center",
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-6xl font-bold text-fd-muted-foreground", children: "404" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold", children: "Page Not Found" }),
        /* @__PURE__ */ jsx("p", { className: "text-fd-muted-foreground max-w-md", children: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable." }),
        /* @__PURE__ */ jsx(
          Link$2,
          {
            to: "/",
            className: "mt-4 px-4 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity",
            children: "Back to Home"
          }
        )
      ] })
    }
  );
}
const appCss = "/assets/app-DlMA3TTi.css";
const DefaultSearchDialog = lazy(() => import("./search-default-B056SeKa.js"));
function RootProvider$1({ children, dir = "ltr", theme = {}, search: search2, i18n }) {
  let body = children;
  if (search2?.enabled !== false) body = /* @__PURE__ */ jsx(SearchProvider, {
    SearchDialog: DefaultSearchDialog,
    ...search2,
    children: body
  });
  if (theme?.enabled !== false) body = /* @__PURE__ */ jsx(ThemeProvider, {
    attribute: "class",
    defaultTheme: "system",
    enableSystem: true,
    disableTransitionOnChange: true,
    ...theme,
    children: body
  });
  if (i18n) body = /* @__PURE__ */ jsx(I18nProvider, {
    ...i18n,
    children: body
  });
  return /* @__PURE__ */ jsx(DirectionProvider, {
    dir,
    children: body
  });
}
const framework = {
  Link({ href, prefetch = true, ...props }) {
    return /* @__PURE__ */ jsx(Link$2, {
      to: href,
      preload: prefetch ? "intent" : false,
      ...props,
      children: props.children
    });
  },
  usePathname() {
    const { isLoading, pathname } = useRouterState({ select: (state) => ({
      isLoading: state.isLoading,
      pathname: state.location.pathname
    }) });
    const activePathname = useRef(pathname);
    return useMemo(() => {
      if (isLoading) return activePathname.current;
      activePathname.current = pathname;
      return pathname;
    }, [isLoading, pathname]);
  },
  useRouter() {
    const router2 = useRouter$1();
    return useMemo(() => ({
      push(url) {
        router2.navigate({ href: url });
      },
      refresh() {
        router2.invalidate();
      }
    }), [router2]);
  },
  useParams() {
    return useParams({ strict: false });
  }
};
function TanstackProvider({ children, Link: CustomLink, Image: CustomImage }) {
  return /* @__PURE__ */ jsx(FrameworkProvider, {
    ...framework,
    Link: CustomLink ?? framework.Link,
    Image: CustomImage ?? framework.Image,
    children
  });
}
function RootProvider({ components, ...props }) {
  return /* @__PURE__ */ jsx(TanstackProvider, {
    Link: components?.Link,
    Image: components?.Image,
    children: /* @__PURE__ */ jsx(RootProvider$1, {
      ...props,
      children: props.children
    })
  });
}
const Route$3 = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "AudisAI Documentation"
      }
    ],
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "flex flex-col min-h-screen", children: [
      /* @__PURE__ */ jsx(RootProvider, { children }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$1 = () => import("./index-D59oxovE.js");
const Route$2 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const create = browser();
const browserCollections = {
  docs: create.doc("docs", /* @__PURE__ */ Object.assign({
    "./guide/configuration.mdx": () => import("./source-FYbSgCnA.js").then((n) => n._),
    "./guide/installation.mdx": () => import("./source-FYbSgCnA.js").then((n) => n.a),
    "./guide/introduction.mdx": () => import("./source-FYbSgCnA.js").then((n) => n.c),
    "./guide/quick-start.mdx": () => import("./source-FYbSgCnA.js").then((n) => n.d),
    "./policies/overview.mdx": () => import("./source-FYbSgCnA.js").then((n) => n.g),
    "./policies/supported-frameworks.mdx": () => import("./source-FYbSgCnA.js").then((n) => n.h),
    "./reference/cli.mdx": () => import("./source-FYbSgCnA.js").then((n) => n.i)
  }))
};
function mergeRefs$1(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(value);
      else if (ref) ref.current = value;
    });
  };
}
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(value);
      else if (ref != null) ref.current = value;
    });
  };
}
const ActiveAnchorContext = createContext([]);
const ScrollContext = createContext({ current: null });
function useActiveAnchor() {
  return useContext(ActiveAnchorContext)[0];
}
function useActiveAnchors() {
  return useContext(ActiveAnchorContext);
}
function ScrollProvider({ containerRef, children }) {
  return /* @__PURE__ */ jsx(ScrollContext.Provider, {
    value: containerRef,
    children
  });
}
function AnchorProvider({ toc, single = false, children }) {
  const headings = useMemo(() => {
    return toc.map((item) => item.url.split("#")[1]);
  }, [toc]);
  return /* @__PURE__ */ jsx(ActiveAnchorContext.Provider, {
    value: useAnchorObserver(headings, single),
    children
  });
}
function TOCItem$2({ ref, onActiveChange = () => null, ...props }) {
  const containerRef = useContext(ScrollContext);
  const anchorRef = useRef(null);
  const activeOrder = useActiveAnchors().indexOf(props.href.slice(1));
  const isActive2 = activeOrder !== -1;
  const shouldScroll = activeOrder === 0;
  const onActiveChangeEvent = useEffectEvent(onActiveChange);
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const container = containerRef.current;
    if (container && anchor && shouldScroll) scrollIntoView(anchor, {
      behavior: "smooth",
      block: "center",
      inline: "center",
      scrollMode: "always",
      boundary: container
    });
  }, [containerRef, shouldScroll]);
  useEffect(() => {
    return () => onActiveChangeEvent(isActive2);
  }, [isActive2]);
  return /* @__PURE__ */ jsx("a", {
    ref: mergeRefs(anchorRef, ref),
    "data-active": isActive2,
    ...props,
    children: props.children
  });
}
function useAnchorObserver(watch, single) {
  const observerRef = useRef(null);
  const [activeAnchor, setActiveAnchor] = useState(() => []);
  const stateRef = useRef(null);
  const onChange = useEffectEvent((entries) => {
    stateRef.current ??= { visible: /* @__PURE__ */ new Set() };
    const state = stateRef.current;
    for (const entry of entries) if (entry.isIntersecting) state.visible.add(entry.target.id);
    else state.visible.delete(entry.target.id);
    if (state.visible.size === 0) {
      const viewTop = entries.length > 0 ? entries[0]?.rootBounds?.top ?? 0 : 0;
      let fallback;
      let min = -1;
      for (const id of watch) {
        const element = document.getElementById(id);
        if (!element) continue;
        const d = Math.abs(viewTop - element.getBoundingClientRect().top);
        if (min === -1 || d < min) {
          fallback = element;
          min = d;
        }
      }
      setActiveAnchor(fallback ? [fallback.id] : []);
    } else {
      const items = watch.filter((item) => state.visible.has(item));
      setActiveAnchor(single ? items.slice(0, 1) : items);
    }
  });
  useEffect(() => {
    if (observerRef.current) return;
    observerRef.current = new IntersectionObserver(onChange, {
      rootMargin: "0px",
      threshold: 0.98
    });
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;
    const elements = watch.flatMap((heading) => document.getElementById(heading) ?? []);
    for (const element of elements) observer.observe(element);
    return () => {
      for (const element of elements) observer.unobserve(element);
    };
  }, [watch]);
  return activeAnchor;
}
function isDifferent(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return b.length !== a.length || a.some((v, i) => isDifferent(v, b[i]));
  return a !== b;
}
function useOnChange(value, onChange, isUpdated = isDifferent) {
  const [prev, setPrev] = useState(value);
  if (isUpdated(prev, value)) {
    onChange(value, prev);
    setPrev(value);
  }
}
const TOCContext = createContext([]);
function useTOCItems() {
  return use(TOCContext);
}
function TOCProvider({ toc, children, ...props }) {
  return /* @__PURE__ */ jsx(TOCContext, {
    value: toc,
    children: /* @__PURE__ */ jsx(AnchorProvider, {
      toc,
      ...props,
      children
    })
  });
}
function TOCScrollArea({ ref, className, ...props }) {
  const viewRef = useRef(null);
  return /* @__PURE__ */ jsx("div", {
    ref: mergeRefs$1(viewRef, ref),
    className: twMerge("relative min-h-0 text-sm ms-px overflow-auto [scrollbar-width:none] mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-3", className),
    ...props,
    children: /* @__PURE__ */ jsx(ScrollProvider, {
      containerRef: viewRef,
      children: props.children
    })
  });
}
function TocThumb({ containerRef, ...props }) {
  const thumbRef = useRef(null);
  const active = useActiveAnchors();
  function update(info) {
    const element = thumbRef.current;
    if (!element) return;
    element.style.setProperty("--fd-top", `${info[0]}px`);
    element.style.setProperty("--fd-height", `${info[1]}px`);
  }
  const onPrint = useEffectEvent(() => {
    if (containerRef.current) update(calc(containerRef.current, active));
  });
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const observer = new ResizeObserver(onPrint);
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [containerRef]);
  useOnChange(active, () => {
    if (containerRef.current) update(calc(containerRef.current, active));
  });
  return /* @__PURE__ */ jsx("div", {
    ref: thumbRef,
    "data-hidden": active.length === 0,
    ...props
  });
}
function calc(container, active) {
  if (active.length === 0 || container.clientHeight === 0) return [0, 0];
  let upper = Number.MAX_VALUE, lower = 0;
  for (const item of active) {
    const element = container.querySelector(`a[href="#${item}"]`);
    if (!element) continue;
    const styles = getComputedStyle(element);
    upper = Math.min(upper, element.offsetTop + parseFloat(styles.paddingTop));
    lower = Math.max(lower, element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom));
  }
  return [upper, lower - upper];
}
const import__fumadocs_ui_components_toc_index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TOCProvider,
  TOCScrollArea,
  TocThumb,
  useTOCItems
}, Symbol.toStringTag, { value: "Module" }));
var toc_exports = {};
__reExport(toc_exports, import__fumadocs_ui_components_toc_index);
function getBreadcrumbItemsFromPath(tree, path, options) {
  const { includePage = false, includeSeparator = false, includeRoot = false } = options;
  let items = [];
  for (let i = 0; i < path.length; i++) {
    const item = path[i];
    switch (item.type) {
      case "page":
        if (includePage) items.push({
          name: item.name,
          url: item.url
        });
        break;
      case "folder":
        if (item.root && !includeRoot) {
          items = [];
          break;
        }
        if (i === path.length - 1 || item.index !== path[i + 1]) items.push({
          name: item.name,
          url: item.index?.url
        });
        break;
      case "separator":
        if (item.name && includeSeparator) items.push({ name: item.name });
        break;
    }
  }
  if (includeRoot) items.unshift({
    name: tree.name,
    url: typeof includeRoot === "object" ? includeRoot.url : void 0
  });
  return items;
}
function searchPath(nodes, url) {
  const normalizedUrl = normalizeUrl(url);
  return findPath(nodes, (node) => node.type === "page" && node.url === normalizedUrl);
}
const TreeContext = createContext(null);
const PathContext = createContext([]);
function TreeContextProvider({ tree: rawTree, children }) {
  const nextIdRef = useRef(0);
  const pathname = usePathname();
  const tree = useMemo(() => rawTree, [rawTree.$id ?? rawTree]);
  const path = useMemo(() => {
    return searchPath(tree.children, pathname) ?? (tree.fallback ? searchPath(tree.fallback.children, pathname) : null) ?? [];
  }, [tree, pathname]);
  const root = path.findLast((item) => item.type === "folder" && item.root) ?? tree;
  root.$id ??= String(nextIdRef.current++);
  return /* @__PURE__ */ jsx(TreeContext, {
    value: useMemo(() => ({
      root,
      full: tree
    }), [root, tree]),
    children: /* @__PURE__ */ jsx(PathContext, {
      value: path,
      children
    })
  });
}
function useTreePath() {
  return use(PathContext);
}
function useTreeContext() {
  const ctx = use(TreeContext);
  if (!ctx) throw new Error("You must wrap this component under <DocsLayout />");
  return ctx;
}
const import__fumadocs_ui_contexts_tree = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TreeContextProvider,
  useTreeContext,
  useTreePath
}, Symbol.toStringTag, { value: "Module" }));
var tree_exports = {};
__reExport(tree_exports, import__fumadocs_ui_contexts_tree);
const Collapsible = Primitive$1.Root;
const CollapsibleTrigger = Primitive$1.CollapsibleTrigger;
const CollapsibleContent = forwardRef(({ children, ...props }, ref) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return /* @__PURE__ */ jsx(Primitive$1.CollapsibleContent, {
    ref,
    ...props,
    className: twMerge("overflow-hidden", mounted && "data-[state=closed]:animate-fd-collapsible-up data-[state=open]:animate-fd-collapsible-down", props.className),
    children
  });
});
CollapsibleContent.displayName = Primitive$1.CollapsibleContent.displayName;
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(Primitive$2.Root, {
  ref,
  type: "scroll",
  className: twMerge("overflow-hidden", className),
  ...props,
  children: [
    children,
    /* @__PURE__ */ jsx(Primitive$2.Corner, {}),
    /* @__PURE__ */ jsx(ScrollBar, { orientation: "vertical" })
  ]
}));
ScrollArea.displayName = Primitive$2.Root.displayName;
const ScrollViewport = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(Primitive$2.Viewport, {
  ref,
  className: twMerge("size-full rounded-[inherit]", className),
  ...props,
  children
}));
ScrollViewport.displayName = Primitive$2.Viewport.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx(Primitive$2.Scrollbar, {
  ref,
  orientation,
  className: twMerge("flex select-none data-[state=hidden]:animate-fd-fade-out", orientation === "vertical" && "h-full w-1.5", orientation === "horizontal" && "h-1.5 flex-col", className),
  ...props,
  children: /* @__PURE__ */ jsx(Primitive$2.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-fd-border" })
}));
ScrollBar.displayName = Primitive$2.Scrollbar.displayName;
function useMediaQuery(query, disabled = false) {
  const [isMatch, setMatch] = useState(null);
  useEffect(() => {
    if (disabled) return;
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => {
      setMatch(mediaQueryList.matches);
    };
    handleChange();
    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [disabled, query]);
  return isMatch;
}
const SidebarContext = createContext(null);
const FolderContext = createContext(null);
function SidebarProvider({ defaultOpenLevel = 0, prefetch, children }) {
  const closeOnRedirect = useRef(true);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const mode = useMediaQuery("(width < 768px)") ? "drawer" : "full";
  useOnChange(pathname, () => {
    if (closeOnRedirect.current) setOpen(false);
    closeOnRedirect.current = true;
  });
  return /* @__PURE__ */ jsx(SidebarContext, {
    value: useMemo(() => ({
      open,
      setOpen,
      collapsed,
      setCollapsed,
      closeOnRedirect,
      defaultOpenLevel,
      prefetch,
      mode
    }), [
      open,
      collapsed,
      defaultOpenLevel,
      prefetch,
      mode
    ]),
    children
  });
}
function useSidebar() {
  const ctx = use(SidebarContext);
  if (!ctx) throw new Error("Missing SidebarContext, make sure you have wrapped the component in <DocsLayout /> and the context is available.");
  return ctx;
}
function useFolder() {
  return use(FolderContext);
}
function useFolderDepth() {
  return use(FolderContext)?.depth ?? 0;
}
function SidebarContent({ children }) {
  const { collapsed, mode } = useSidebar();
  const [hover, setHover] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(0);
  useOnChange(collapsed, () => {
    if (collapsed) setHover(false);
  });
  if (mode !== "full") return;
  function shouldIgnoreHover(e) {
    const element = ref.current;
    if (!element) return true;
    return !collapsed || e.pointerType === "touch" || element.getAnimations().length > 0;
  }
  return children({
    ref,
    collapsed,
    hovered: hover,
    onPointerEnter(e) {
      if (shouldIgnoreHover(e)) return;
      window.clearTimeout(timerRef.current);
      setHover(true);
    },
    onPointerLeave(e) {
      if (shouldIgnoreHover(e)) return;
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setHover(false), Math.min(e.clientX, document.body.clientWidth - e.clientX) > 100 ? 0 : 500);
    }
  });
}
function SidebarDrawerOverlay(props) {
  const { open, setOpen, mode } = useSidebar();
  if (mode !== "drawer") return;
  return /* @__PURE__ */ jsx(Presence, {
    present: open,
    children: /* @__PURE__ */ jsx("div", {
      "data-state": open ? "open" : "closed",
      onClick: () => setOpen(false),
      ...props
    })
  });
}
function SidebarDrawerContent({ className, children, ...props }) {
  const { open, mode } = useSidebar();
  const state = open ? "open" : "closed";
  if (mode !== "drawer") return;
  return /* @__PURE__ */ jsx(Presence, {
    present: open,
    children: ({ present }) => /* @__PURE__ */ jsx("aside", {
      id: "nd-sidebar-mobile",
      "data-state": state,
      className: twMerge(!present && "invisible", className),
      ...props,
      children
    })
  });
}
function SidebarViewport(props) {
  return /* @__PURE__ */ jsx(ScrollArea, {
    ...props,
    className: twMerge("min-h-0 flex-1", props.className),
    children: /* @__PURE__ */ jsx(ScrollViewport, {
      className: "p-4 overscroll-contain",
      style: { maskImage: "linear-gradient(to bottom, transparent, white 12px, white calc(100% - 12px), transparent)" },
      children: props.children
    })
  });
}
function SidebarSeparator(props) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsx("p", {
    ...props,
    className: twMerge("inline-flex items-center gap-2 mb-1.5 px-2 mt-6 empty:mb-0", depth === 0 && "first:mt-0", props.className),
    children: props.children
  });
}
function SidebarItem({ icon, children, ...props }) {
  const pathname = usePathname();
  const ref = useRef(null);
  const { prefetch } = useSidebar();
  const active = props.href !== void 0 && isActive(props.href, pathname, false);
  useAutoScroll(active, ref);
  return /* @__PURE__ */ jsxs(Link, {
    ref,
    "data-active": active,
    prefetch,
    ...props,
    children: [icon ?? (props.external ? /* @__PURE__ */ jsx(ExternalLink, {}) : null), children]
  });
}
function SidebarFolder({ defaultOpen: defaultOpenProp, collapsible = true, active = false, children, ...props }) {
  const { defaultOpenLevel } = useSidebar();
  const depth = useFolderDepth() + 1;
  const defaultOpen = collapsible === false || active || (defaultOpenProp ?? defaultOpenLevel >= depth);
  const [open, setOpen] = useState(defaultOpen);
  useOnChange(defaultOpen, (v) => {
    if (v) setOpen(v);
  });
  return /* @__PURE__ */ jsx(Collapsible, {
    open,
    onOpenChange: setOpen,
    disabled: !collapsible,
    ...props,
    children: /* @__PURE__ */ jsx(FolderContext, {
      value: useMemo(() => ({
        open,
        setOpen,
        depth,
        collapsible
      }), [
        collapsible,
        depth,
        open
      ]),
      children
    })
  });
}
function SidebarFolderTrigger({ children, ...props }) {
  const { open, collapsible } = use(FolderContext);
  if (collapsible) return /* @__PURE__ */ jsxs(CollapsibleTrigger, {
    ...props,
    children: [children, /* @__PURE__ */ jsx(ChevronDown, {
      "data-icon": true,
      className: twMerge("ms-auto transition-transform", !open && "-rotate-90")
    })]
  });
  return /* @__PURE__ */ jsx("div", {
    ...props,
    children
  });
}
function SidebarFolderLink({ children, ...props }) {
  const ref = useRef(null);
  const { open, setOpen, collapsible } = use(FolderContext);
  const { prefetch } = useSidebar();
  const pathname = usePathname();
  const active = props.href !== void 0 && isActive(props.href, pathname, false);
  useAutoScroll(active, ref);
  return /* @__PURE__ */ jsxs(Link, {
    ref,
    "data-active": active,
    onClick: (e) => {
      if (!collapsible) return;
      if (e.target instanceof Element && e.target.matches("[data-icon], [data-icon] *")) {
        setOpen(!open);
        e.preventDefault();
      } else setOpen(active ? !open : true);
    },
    prefetch,
    ...props,
    children: [children, collapsible && /* @__PURE__ */ jsx(ChevronDown, {
      "data-icon": true,
      className: twMerge("ms-auto transition-transform", !open && "-rotate-90")
    })]
  });
}
function SidebarFolderContent(props) {
  return /* @__PURE__ */ jsx(CollapsibleContent, {
    ...props,
    children: props.children
  });
}
function SidebarTrigger({ children, ...props }) {
  const { setOpen } = useSidebar();
  return /* @__PURE__ */ jsx("button", {
    "aria-label": "Open Sidebar",
    onClick: () => setOpen((prev) => !prev),
    ...props,
    children
  });
}
function SidebarCollapseTrigger(props) {
  const { collapsed, setCollapsed } = useSidebar();
  return /* @__PURE__ */ jsx("button", {
    type: "button",
    "aria-label": "Collapse Sidebar",
    "data-collapsed": collapsed,
    onClick: () => {
      setCollapsed((prev) => !prev);
    },
    ...props,
    children: props.children
  });
}
function useAutoScroll(active, ref) {
  const { mode } = useSidebar();
  useEffect(() => {
    if (active && ref.current) scrollIntoView(ref.current, {
      boundary: document.getElementById(mode === "drawer" ? "nd-sidebar-mobile" : "nd-sidebar"),
      scrollMode: "if-needed"
    });
  }, [
    active,
    mode,
    ref
  ]);
}
function SidebarTabsDropdown({ options, placeholder, ...props }) {
  const [open, setOpen] = useState(false);
  const { closeOnRedirect } = useSidebar();
  const pathname = usePathname();
  const selected = useMemo(() => {
    return options.findLast((item$1) => isTabActive(item$1, pathname));
  }, [options, pathname]);
  const onClick = () => {
    closeOnRedirect.current = false;
    setOpen(false);
  };
  const item = selected ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
    className: "size-9 shrink-0 empty:hidden md:size-5",
    children: selected.icon
  }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
    className: "text-sm font-medium",
    children: selected.title
  }), /* @__PURE__ */ jsx("p", {
    className: "text-sm text-fd-muted-foreground empty:hidden md:hidden",
    children: selected.description
  })] })] }) : placeholder;
  return /* @__PURE__ */ jsxs(Popover, {
    open,
    onOpenChange: setOpen,
    children: [item && /* @__PURE__ */ jsxs(PopoverTrigger, {
      ...props,
      className: twMerge("flex items-center gap-2 rounded-lg p-2 border bg-fd-secondary/50 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground", props.className),
      children: [item, /* @__PURE__ */ jsx(ChevronsUpDown, { className: "shrink-0 ms-auto size-4 text-fd-muted-foreground" })]
    }), /* @__PURE__ */ jsx(PopoverContent, {
      className: "flex flex-col gap-1 w-(--radix-popover-trigger-width) p-1 fd-scroll-container",
      children: options.map((item$1) => {
        const isActive$1 = selected && item$1.url === selected.url;
        if (!isActive$1 && item$1.unlisted) return;
        return /* @__PURE__ */ jsxs(Link, {
          href: item$1.url,
          onClick,
          ...item$1.props,
          className: twMerge("flex items-center gap-2 rounded-lg p-1.5 hover:bg-fd-accent hover:text-fd-accent-foreground", item$1.props?.className),
          children: [
            /* @__PURE__ */ jsx("div", {
              className: "shrink-0 size-9 md:mb-auto md:size-5 empty:hidden",
              children: item$1.icon
            }),
            /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
              className: "text-sm font-medium leading-none",
              children: item$1.title
            }), /* @__PURE__ */ jsx("p", {
              className: "text-[0.8125rem] text-fd-muted-foreground mt-1 empty:hidden",
              children: item$1.description
            })] }),
            /* @__PURE__ */ jsx(Check, { className: twMerge("shrink-0 ms-auto size-3.5 text-fd-primary", !isActive$1 && "invisible") })
          ]
        }, item$1.url);
      })
    })]
  });
}
function isTabActive(tab, pathname) {
  if (tab.urls) return tab.urls.has(normalize(pathname));
  return isActive(tab.url, pathname, true);
}
const LayoutContext = createContext(null);
function LayoutContextProvider({ navTransparentMode = "none", children }) {
  const isTop = useIsScrollTop({ enabled: navTransparentMode === "top" }) ?? true;
  const isNavTransparent = navTransparentMode === "top" ? isTop : navTransparentMode === "always";
  return /* @__PURE__ */ jsx(LayoutContext, {
    value: useMemo(() => ({ isNavTransparent }), [isNavTransparent]),
    children
  });
}
function LayoutHeader(props) {
  const { isNavTransparent } = use(LayoutContext);
  return /* @__PURE__ */ jsx("header", {
    "data-transparent": isNavTransparent,
    ...props,
    children: props.children
  });
}
function LayoutBody({ className, style, children, ...props }) {
  const { collapsed } = useSidebar();
  return /* @__PURE__ */ jsx("div", {
    id: "nd-docs-layout",
    className: twMerge("grid transition-[grid-template-columns] overflow-x-clip min-h-(--fd-docs-height) auto-cols-auto auto-rows-auto [--fd-docs-height:100dvh] [--fd-header-height:0px] [--fd-toc-popover-height:0px] [--fd-sidebar-width:0px] [--fd-toc-width:0px]", className),
    "data-sidebar-collapsed": collapsed,
    style: {
      gridTemplate: `"sidebar header toc"
        "sidebar toc-popover toc"
        "sidebar main toc" 1fr / minmax(var(--fd-sidebar-col), 1fr) minmax(0, calc(var(--fd-layout-width,97rem) - var(--fd-sidebar-width) - var(--fd-toc-width))) minmax(min-content, 1fr)`,
      "--fd-docs-row-1": "var(--fd-banner-height, 0px)",
      "--fd-docs-row-2": "calc(var(--fd-docs-row-1) + var(--fd-header-height))",
      "--fd-docs-row-3": "calc(var(--fd-docs-row-2) + var(--fd-toc-popover-height))",
      "--fd-sidebar-col": collapsed ? "0px" : "var(--fd-sidebar-width)",
      ...style
    },
    ...props,
    children
  });
}
function LayoutTabs({ options, ...props }) {
  const pathname = usePathname();
  const selected = useMemo(() => {
    return options.findLast((option) => isTabActive(option, pathname));
  }, [options, pathname]);
  return /* @__PURE__ */ jsx("div", {
    ...props,
    className: twMerge("flex flex-row items-end gap-6 overflow-auto [grid-area:main]", props.className),
    children: options.map((option, i) => /* @__PURE__ */ jsx(Link, {
      href: option.url,
      className: twMerge("inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground", option.unlisted && selected !== option && "hidden", selected === option && "border-fd-primary text-fd-primary"),
      children: option.title
    }, i))
  });
}
const footerCache = /* @__PURE__ */ new Map();
function useFooterItems() {
  const { root } = useTreeContext();
  const cached = footerCache.get(root.$id);
  if (cached) return cached;
  const list = [];
  function onNode(node) {
    if (node.type === "folder") {
      if (node.index) onNode(node.index);
      for (const child of node.children) onNode(child);
    } else if (node.type === "page" && !node.external) list.push(node);
  }
  for (const child of root.children) onNode(child);
  footerCache.set(root.$id, list);
  return list;
}
const TocPopoverContext = createContext(null);
function PageTOCPopover({ className, children, ...rest }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const { isNavTransparent } = use(LayoutContext);
  const onClick = useEffectEvent((e) => {
    if (!open) return;
    if (ref.current && !ref.current.contains(e.target)) setOpen(false);
  });
  useEffect(() => {
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, []);
  return /* @__PURE__ */ jsx(TocPopoverContext, {
    value: useMemo(() => ({
      open,
      setOpen
    }), [setOpen, open]),
    children: /* @__PURE__ */ jsx(Collapsible, {
      open,
      onOpenChange: setOpen,
      "data-toc-popover": "",
      className: twMerge("sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]", className),
      ...rest,
      children: /* @__PURE__ */ jsx("header", {
        ref,
        className: twMerge("border-b backdrop-blur-sm transition-colors", (!isNavTransparent || open) && "bg-fd-background/80", open && "shadow-lg"),
        children
      })
    })
  });
}
function PageTOCPopoverTrigger({ className, ...props }) {
  const { text } = (0, i18n_exports.useI18n)();
  const { open } = use(TocPopoverContext);
  const items = (0, toc_exports.useTOCItems)();
  const active = useActiveAnchor();
  const selected = useMemo(() => items.findIndex((item) => active === item.url.slice(1)), [items, active]);
  const path = (0, tree_exports.useTreePath)().at(-1);
  const showItem = selected !== -1 && !open;
  return /* @__PURE__ */ jsxs(CollapsibleTrigger, {
    className: twMerge("flex w-full h-10 items-center text-sm text-fd-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6", className),
    "data-toc-popover-trigger": "",
    ...props,
    children: [
      /* @__PURE__ */ jsx(ProgressCircle, {
        value: (selected + 1) / Math.max(1, items.length),
        max: 1,
        className: twMerge("shrink-0", open && "text-fd-primary")
      }),
      /* @__PURE__ */ jsxs("span", {
        className: "grid flex-1 *:my-auto *:row-start-1 *:col-start-1",
        children: [/* @__PURE__ */ jsx("span", {
          className: twMerge("truncate transition-[opacity,translate,color]", open && "text-fd-foreground", showItem && "opacity-0 -translate-y-full pointer-events-none"),
          children: path?.name ?? text.toc
        }), /* @__PURE__ */ jsx("span", {
          className: twMerge("truncate transition-[opacity,translate]", !showItem && "opacity-0 translate-y-full pointer-events-none"),
          children: items[selected]?.title
        })]
      }),
      /* @__PURE__ */ jsx(ChevronDown, { className: twMerge("shrink-0 transition-transform mx-0.5", open && "rotate-180") })
    ]
  });
}
function clamp(input, min, max) {
  if (input < min) return min;
  if (input > max) return max;
  return input;
}
function ProgressCircle({ value, strokeWidth = 2, size = 24, min = 0, max = 100, ...restSvgProps }) {
  const normalizedValue = clamp(value, min, max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = normalizedValue / max * circumference;
  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth
  };
  return /* @__PURE__ */ jsxs("svg", {
    role: "progressbar",
    viewBox: `0 0 ${size} ${size}`,
    "aria-valuenow": normalizedValue,
    "aria-valuemin": min,
    "aria-valuemax": max,
    ...restSvgProps,
    children: [/* @__PURE__ */ jsx("circle", {
      ...circleProps,
      className: "stroke-current/25"
    }), /* @__PURE__ */ jsx("circle", {
      ...circleProps,
      stroke: "currentColor",
      strokeDasharray: circumference,
      strokeDashoffset: circumference - progress,
      strokeLinecap: "round",
      transform: `rotate(-90 ${size / 2} ${size / 2})`,
      className: "transition-all"
    })]
  });
}
function PageTOCPopoverContent(props) {
  return /* @__PURE__ */ jsx(CollapsibleContent, {
    "data-toc-popover-content": "",
    ...props,
    className: twMerge("flex flex-col px-4 max-h-[50vh] md:px-6", props.className),
    children: props.children
  });
}
function PageFooter({ items, children, className, ...props }) {
  const footerList = useFooterItems();
  const pathname = usePathname();
  const { previous, next } = useMemo(() => {
    if (items) return items;
    const idx = footerList.findIndex((item) => isActive(item.url, pathname, false));
    if (idx === -1) return {};
    return {
      previous: footerList[idx - 1],
      next: footerList[idx + 1]
    };
  }, [
    footerList,
    items,
    pathname
  ]);
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
    className: twMerge("@container grid gap-4", previous && next ? "grid-cols-2" : "grid-cols-1", className),
    ...props,
    children: [previous && /* @__PURE__ */ jsx(FooterItem, {
      item: previous,
      index: 0
    }), next && /* @__PURE__ */ jsx(FooterItem, {
      item: next,
      index: 1
    })]
  }), children] });
}
function FooterItem({ item, index }) {
  const { text } = (0, i18n_exports.useI18n)();
  const Icon = index === 0 ? ChevronLeft : ChevronRight;
  return /* @__PURE__ */ jsxs(Link, {
    href: item.url,
    className: twMerge("flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full", index === 1 && "text-end"),
    children: [/* @__PURE__ */ jsxs("div", {
      className: twMerge("inline-flex items-center gap-1.5 font-medium", index === 1 && "flex-row-reverse"),
      children: [/* @__PURE__ */ jsx(Icon, { className: "-mx-1 size-4 shrink-0 rtl:rotate-180" }), /* @__PURE__ */ jsx("p", { children: item.name })]
    }), /* @__PURE__ */ jsx("p", {
      className: "text-fd-muted-foreground truncate",
      children: item.description ?? (index === 0 ? text.previousPage : text.nextPage)
    })]
  });
}
function PageBreadcrumb({ includeRoot, includeSeparator, includePage, ...props }) {
  const path = (0, tree_exports.useTreePath)();
  const { root } = (0, tree_exports.useTreeContext)();
  const items = useMemo(() => {
    return getBreadcrumbItemsFromPath(root, path, {
      includePage,
      includeSeparator,
      includeRoot
    });
  }, [
    includePage,
    includeRoot,
    includeSeparator,
    path,
    root
  ]);
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsx("div", {
    ...props,
    className: twMerge("flex items-center gap-1.5 text-sm text-fd-muted-foreground", props.className),
    children: items.map((item, i) => {
      const className = twMerge("truncate", i === items.length - 1 && "text-fd-primary font-medium");
      return /* @__PURE__ */ jsxs(Fragment, { children: [i !== 0 && /* @__PURE__ */ jsx(ChevronRight, { className: "size-3.5 shrink-0" }), item.url ? /* @__PURE__ */ jsx(Link, {
        href: item.url,
        className: twMerge(className, "transition-opacity hover:opacity-80"),
        children: item.name
      }) : /* @__PURE__ */ jsx("span", {
        className,
        children: item.name
      })] }, i);
    })
  });
}
function TOCItems$1({ ref, className, ...props }) {
  const containerRef = useRef(null);
  const items = useTOCItems();
  const { text } = useI18n();
  if (items.length === 0) return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground",
    children: text.tocNoHeadings
  });
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(TocThumb, {
    containerRef,
    className: "absolute top-(--fd-top) h-(--fd-height) w-0.5 rounded-e-sm bg-fd-primary transition-[top,height] ease-linear"
  }), /* @__PURE__ */ jsx("div", {
    ref: mergeRefs$1(ref, containerRef),
    className: twMerge("flex flex-col border-s border-fd-foreground/10", className),
    ...props,
    children: items.map((item) => /* @__PURE__ */ jsx(TOCItem$1, { item }, item.url))
  })] });
}
function TOCItem$1({ item }) {
  return /* @__PURE__ */ jsx(TOCItem$2, {
    href: item.url,
    className: twMerge("prose py-1.5 text-sm text-fd-muted-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary", item.depth <= 2 && "ps-3", item.depth === 3 && "ps-6", item.depth >= 4 && "ps-8"),
    children: item.title
  });
}
const import__fumadocs_ui_components_toc_default = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TOCItems: TOCItems$1
}, Symbol.toStringTag, { value: "Module" }));
var default_exports = {};
__reExport(default_exports, import__fumadocs_ui_components_toc_default);
function TOCItems({ ref, className, ...props }) {
  const containerRef = useRef(null);
  const items = useTOCItems();
  const { text } = useI18n();
  const [svg, setSvg] = useState();
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    function onResize() {
      if (container.clientHeight === 0) return;
      let w = 0, h = 0;
      const d = [];
      for (let i = 0; i < items.length; i++) {
        const element = container.querySelector(`a[href="#${items[i].url.slice(1)}"]`);
        if (!element) continue;
        const styles = getComputedStyle(element);
        const offset = getLineOffset(items[i].depth) + 1, top = element.offsetTop + parseFloat(styles.paddingTop), bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);
        w = Math.max(offset, w);
        h = Math.max(h, bottom);
        d.push(`${i === 0 ? "M" : "L"}${offset} ${top}`);
        d.push(`L${offset} ${bottom}`);
      }
      setSvg({
        path: d.join(" "),
        width: w + 1,
        height: h
      });
    }
    const observer = new ResizeObserver(onResize);
    onResize();
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [items]);
  if (items.length === 0) return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground",
    children: text.tocNoHeadings
  });
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [svg && /* @__PURE__ */ jsx("div", {
    className: "absolute start-0 top-0 rtl:-scale-x-100",
    style: {
      width: svg.width,
      height: svg.height,
      maskImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`)}")`
    },
    children: /* @__PURE__ */ jsx(TocThumb, {
      containerRef,
      className: "absolute w-full top-(--fd-top) h-(--fd-height) bg-fd-primary transition-[top,height]"
    })
  }), /* @__PURE__ */ jsx("div", {
    ref: mergeRefs$1(containerRef, ref),
    className: twMerge("flex flex-col", className),
    ...props,
    children: items.map((item, i) => /* @__PURE__ */ jsx(TOCItem, {
      item,
      upper: items[i - 1]?.depth,
      lower: items[i + 1]?.depth
    }, item.url))
  })] });
}
function getItemOffset(depth) {
  if (depth <= 2) return 14;
  if (depth === 3) return 26;
  return 36;
}
function getLineOffset(depth) {
  return depth >= 3 ? 10 : 0;
}
function TOCItem({ item, upper = item.depth, lower = item.depth }) {
  const offset = getLineOffset(item.depth), upperOffset = getLineOffset(upper), lowerOffset = getLineOffset(lower);
  return /* @__PURE__ */ jsxs(TOCItem$2, {
    href: item.url,
    style: { paddingInlineStart: getItemOffset(item.depth) },
    className: "prose relative py-1.5 text-sm text-fd-muted-foreground hover:text-fd-accent-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary",
    children: [
      offset !== upperOffset && /* @__PURE__ */ jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 16 16",
        className: "absolute -top-1.5 start-0 size-4 rtl:-scale-x-100",
        children: /* @__PURE__ */ jsx("line", {
          x1: upperOffset,
          y1: "0",
          x2: offset,
          y2: "12",
          className: "stroke-fd-foreground/10",
          strokeWidth: "1"
        })
      }),
      /* @__PURE__ */ jsx("div", {
        className: twMerge("absolute inset-y-0 w-px bg-fd-foreground/10", offset !== upperOffset && "top-1.5", offset !== lowerOffset && "bottom-1.5"),
        style: { insetInlineStart: offset }
      }),
      item.title
    ]
  });
}
const import__fumadocs_ui_components_toc_clerk = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TOCItems
}, Symbol.toStringTag, { value: "Module" }));
var clerk_exports = {};
__reExport(clerk_exports, import__fumadocs_ui_components_toc_clerk);
function DocsPage({ breadcrumb: { enabled: breadcrumbEnabled = true, component: breadcrumb, ...breadcrumbProps } = {}, footer: { enabled: footerEnabled, component: footerReplace, ...footerProps } = {}, full: full2 = false, tableOfContentPopover: { enabled: tocPopoverEnabled, component: tocPopover, ...tocPopoverOptions } = {}, tableOfContent: { enabled: tocEnabled, component: tocReplace, ...tocOptions } = {}, toc = [], children, className }) {
  tocEnabled ??= !full2 && (toc.length > 0 || tocOptions.footer !== void 0 || tocOptions.header !== void 0);
  tocPopoverEnabled ??= toc.length > 0 || tocPopoverOptions.header !== void 0 || tocPopoverOptions.footer !== void 0;
  let wrapper = (children$1) => children$1;
  if (tocEnabled || tocPopoverEnabled) wrapper = (children$1) => /* @__PURE__ */ jsx(toc_exports.TOCProvider, {
    single: tocOptions.single,
    toc,
    children: children$1
  });
  return wrapper(/* @__PURE__ */ jsxs(Fragment$1, { children: [
    tocPopoverEnabled && (tocPopover ?? /* @__PURE__ */ jsxs(PageTOCPopover, { children: [/* @__PURE__ */ jsx(PageTOCPopoverTrigger, {}), /* @__PURE__ */ jsxs(PageTOCPopoverContent, { children: [
      tocPopoverOptions.header,
      /* @__PURE__ */ jsx(toc_exports.TOCScrollArea, { children: tocPopoverOptions.style === "clerk" ? /* @__PURE__ */ jsx(clerk_exports.TOCItems, {}) : /* @__PURE__ */ jsx(default_exports.TOCItems, {}) }),
      tocPopoverOptions.footer
    ] })] })),
    /* @__PURE__ */ jsxs("article", {
      id: "nd-page",
      "data-full": full2,
      className: twMerge("flex flex-col w-full max-w-[900px] mx-auto [grid-area:main] px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14", full2 ? "max-w-[1200px]" : "xl:layout:[--fd-toc-width:268px]", className),
      children: [
        breadcrumbEnabled && (breadcrumb ?? /* @__PURE__ */ jsx(PageBreadcrumb, { ...breadcrumbProps })),
        children,
        footerEnabled !== false && (footerReplace ?? /* @__PURE__ */ jsx(PageFooter, { ...footerProps }))
      ]
    }),
    tocEnabled && (tocReplace ?? /* @__PURE__ */ jsxs("div", {
      id: "nd-toc",
      className: "sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 max-xl:hidden",
      children: [
        tocOptions.header,
        /* @__PURE__ */ jsxs("h3", {
          id: "toc-title",
          className: "inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground",
          children: [/* @__PURE__ */ jsx(Text, { className: "size-4" }), /* @__PURE__ */ jsx(i18n_exports.I18nLabel, { label: "toc" })]
        }),
        /* @__PURE__ */ jsx(toc_exports.TOCScrollArea, { children: tocOptions.style === "clerk" ? /* @__PURE__ */ jsx(clerk_exports.TOCItems, {}) : /* @__PURE__ */ jsx(default_exports.TOCItems, {}) }),
        tocOptions.footer
      ]
    }))
  ] }));
}
function DocsBody({ children, className, ...props }) {
  return /* @__PURE__ */ jsx("div", {
    ...props,
    className: twMerge("prose flex-1", className),
    children
  });
}
function DocsDescription({ children, className, ...props }) {
  if (children === void 0) return null;
  return /* @__PURE__ */ jsx("p", {
    ...props,
    className: twMerge("mb-8 text-lg text-fd-muted-foreground", className),
    children
  });
}
function DocsTitle({ children, className, ...props }) {
  return /* @__PURE__ */ jsx("h1", {
    ...props,
    className: twMerge("text-[1.75em] font-semibold", className),
    children
  });
}
function Cards(props) {
  return /* @__PURE__ */ jsx("div", {
    ...props,
    className: twMerge("grid grid-cols-2 gap-3 @container", props.className),
    children: props.children
  });
}
function Card({ icon, title, description, ...props }) {
  return /* @__PURE__ */ jsxs(props.href ? Link : "div", {
    ...props,
    "data-card": true,
    className: twMerge("block rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors @max-lg:col-span-full", props.href && "hover:bg-fd-accent/80", props.className),
    children: [
      icon ? /* @__PURE__ */ jsx("div", {
        className: "not-prose mb-2 w-fit shadow-md rounded-lg border bg-fd-muted p-1.5 text-fd-muted-foreground [&_svg]:size-4",
        children: icon
      }) : null,
      /* @__PURE__ */ jsx("h3", {
        className: "not-prose mb-1 text-sm font-medium",
        children: title
      }),
      description ? /* @__PURE__ */ jsx("p", {
        className: "my-0! text-sm text-fd-muted-foreground",
        children: description
      }) : null,
      /* @__PURE__ */ jsx("div", {
        className: "text-sm text-fd-muted-foreground prose-no-margin empty:hidden",
        children: props.children
      })
    ]
  });
}
const iconClass = "size-5 -me-0.5 fill-(--callout-color) text-fd-card";
function Callout({ children, title, ...props }) {
  return /* @__PURE__ */ jsxs(CalloutContainer, {
    ...props,
    children: [title && /* @__PURE__ */ jsx(CalloutTitle, { children: title }), /* @__PURE__ */ jsx(CalloutDescription, { children })]
  });
}
function resolveAlias(type) {
  if (type === "warn") return "warning";
  if (type === "tip") return "info";
  return type;
}
function CalloutContainer({ type: inputType = "info", icon, children, className, style, ...props }) {
  const type = resolveAlias(inputType);
  return /* @__PURE__ */ jsxs("div", {
    className: twMerge("flex gap-2 my-4 rounded-xl border bg-fd-card p-3 ps-1 text-sm text-fd-card-foreground shadow-md", className),
    style: {
      "--callout-color": `var(--color-fd-${type}, var(--color-fd-muted))`,
      ...style
    },
    ...props,
    children: [
      /* @__PURE__ */ jsx("div", {
        role: "none",
        className: "w-0.5 bg-(--callout-color)/50 rounded-sm"
      }),
      icon ?? {
        info: /* @__PURE__ */ jsx(Info, { className: iconClass }),
        warning: /* @__PURE__ */ jsx(TriangleAlert, { className: iconClass }),
        error: /* @__PURE__ */ jsx(CircleX, { className: iconClass }),
        success: /* @__PURE__ */ jsx(CircleCheck, { className: iconClass }),
        idea: /* @__PURE__ */ jsx(Lightbulb, { className: "size-5 -me-0.5 fill-(--callout-color) text-(--callout-color)" })
      }[type],
      /* @__PURE__ */ jsx("div", {
        className: "flex flex-col gap-2 min-w-0 flex-1",
        children
      })
    ]
  });
}
function CalloutTitle({ children, className, ...props }) {
  return /* @__PURE__ */ jsx("p", {
    className: twMerge("font-medium my-0!", className),
    ...props,
    children
  });
}
function CalloutDescription({ children, className, ...props }) {
  return /* @__PURE__ */ jsx("div", {
    className: twMerge("text-fd-muted-foreground prose-no-margin empty:hidden", className),
    ...props,
    children
  });
}
function Heading({ as, className, ...props }) {
  const As = as ?? "h1";
  if (!props.id) return /* @__PURE__ */ jsx(As, {
    className,
    ...props
  });
  return /* @__PURE__ */ jsxs(As, {
    className: twMerge("flex scroll-m-28 flex-row items-center gap-2", className),
    ...props,
    children: [/* @__PURE__ */ jsx("a", {
      "data-card": "",
      href: `#${props.id}`,
      className: "peer",
      children: props.children
    }), /* @__PURE__ */ jsx(Link$3, {
      "aria-hidden": true,
      className: "size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100"
    })]
  });
}
const listeners = /* @__PURE__ */ new Map();
const TabsContext$1 = createContext(null);
function useTabContext() {
  const ctx = use(TabsContext$1);
  if (!ctx) throw new Error("You must wrap your component in <Tabs>");
  return ctx;
}
const TabsList = Primitive$3.TabsList;
const TabsTrigger = Primitive$3.TabsTrigger;
function Tabs({ ref, groupId, persist = false, updateAnchor = false, defaultValue, value: _value, onValueChange: _onValueChange, ...props }) {
  const tabsRef = useRef(null);
  const valueToIdMap = useMemo(() => /* @__PURE__ */ new Map(), []);
  const [value, setValue] = _value === void 0 ? useState(defaultValue) : [_value, useEffectEvent((v) => _onValueChange?.(v))];
  useLayoutEffect(() => {
    if (!groupId) return;
    let previous = sessionStorage.getItem(groupId);
    if (persist) previous ??= localStorage.getItem(groupId);
    if (previous) setValue(previous);
    const groupListeners = listeners.get(groupId) ?? /* @__PURE__ */ new Set();
    groupListeners.add(setValue);
    listeners.set(groupId, groupListeners);
    return () => {
      groupListeners.delete(setValue);
    };
  }, [
    groupId,
    persist,
    setValue
  ]);
  useLayoutEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    for (const [value$1, id] of valueToIdMap.entries()) if (id === hash) {
      setValue(value$1);
      tabsRef.current?.scrollIntoView();
      break;
    }
  }, [setValue, valueToIdMap]);
  return /* @__PURE__ */ jsx(Primitive$3.Tabs, {
    ref: mergeRefs$1(ref, tabsRef),
    value,
    onValueChange: (v) => {
      if (updateAnchor) {
        const id = valueToIdMap.get(v);
        if (id) window.history.replaceState(null, "", `#${id}`);
      }
      if (groupId) {
        const groupListeners = listeners.get(groupId);
        if (groupListeners) for (const listener of groupListeners) listener(v);
        sessionStorage.setItem(groupId, v);
        if (persist) localStorage.setItem(groupId, v);
      } else setValue(v);
    },
    ...props,
    children: /* @__PURE__ */ jsx(TabsContext$1, {
      value: useMemo(() => ({ valueToIdMap }), [valueToIdMap]),
      children: props.children
    })
  });
}
function TabsContent({ value, ...props }) {
  const { valueToIdMap } = useTabContext();
  if (props.id) valueToIdMap.set(value, props.id);
  return /* @__PURE__ */ jsx(Primitive$3.TabsContent, {
    value,
    ...props,
    children: props.children
  });
}
function useCopyButton(onCopy) {
  const [checked, setChecked] = useState(false);
  const callbackRef = useRef(onCopy);
  const timeoutRef = useRef(null);
  callbackRef.current = onCopy;
  const onClick = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    Promise.resolve(callbackRef.current()).then(() => {
      setChecked(true);
      timeoutRef.current = window.setTimeout(() => {
        setChecked(false);
      }, 1500);
    });
  }, []);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);
  return [checked, onClick];
}
const TabsContext = createContext(null);
function Pre(props) {
  return /* @__PURE__ */ jsx("pre", {
    ...props,
    className: twMerge("min-w-full w-max *:flex *:flex-col", props.className),
    children: props.children
  });
}
function CodeBlock({ ref, title, allowCopy = true, keepBackground = false, icon, viewportProps = {}, children, Actions = (props$1) => /* @__PURE__ */ jsx("div", {
  ...props$1,
  className: twMerge("empty:hidden", props$1.className)
}), ...props }) {
  const inTab = use(TabsContext) !== null;
  const areaRef = useRef(null);
  return /* @__PURE__ */ jsxs("figure", {
    ref,
    dir: "ltr",
    ...props,
    tabIndex: -1,
    className: twMerge(inTab ? "bg-fd-secondary -mx-px -mb-px last:rounded-b-xl" : "my-4 bg-fd-card rounded-xl", keepBackground && "bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)", "shiki relative border shadow-sm not-prose overflow-hidden text-sm", props.className),
    children: [title ? /* @__PURE__ */ jsxs("div", {
      className: "flex text-fd-muted-foreground items-center gap-2 h-9.5 border-b px-4",
      children: [
        typeof icon === "string" ? /* @__PURE__ */ jsx("div", {
          className: "[&_svg]:size-3.5",
          dangerouslySetInnerHTML: { __html: icon }
        }) : icon,
        /* @__PURE__ */ jsx("figcaption", {
          className: "flex-1 truncate",
          children: title
        }),
        Actions({
          className: "-me-2",
          children: allowCopy && /* @__PURE__ */ jsx(CopyButton, { containerRef: areaRef })
        })
      ]
    }) : Actions({
      className: "absolute top-3 right-2 z-2 backdrop-blur-lg rounded-lg text-fd-muted-foreground",
      children: allowCopy && /* @__PURE__ */ jsx(CopyButton, { containerRef: areaRef })
    }), /* @__PURE__ */ jsx("div", {
      ref: areaRef,
      ...viewportProps,
      role: "region",
      tabIndex: 0,
      className: twMerge("text-[0.8125rem] py-3.5 overflow-auto max-h-[600px] fd-scroll-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring", viewportProps.className),
      style: {
        "--padding-right": !title ? "calc(var(--spacing) * 8)" : void 0,
        counterSet: props["data-line-numbers"] ? `line ${Number(props["data-line-numbers-start"] ?? 1) - 1}` : void 0,
        ...viewportProps.style
      },
      children
    })]
  });
}
function CopyButton({ className, containerRef, ...props }) {
  const [checked, onClick] = useCopyButton(() => {
    const pre = containerRef.current?.getElementsByTagName("pre").item(0);
    if (!pre) return;
    const clone = pre.cloneNode(true);
    clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
      node.replaceWith("\n");
    });
    navigator.clipboard.writeText(clone.textContent ?? "");
  });
  return /* @__PURE__ */ jsx("button", {
    type: "button",
    "data-checked": checked || void 0,
    className: twMerge(buttonVariants({
      className: "hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground",
      size: "icon-xs"
    }), className),
    "aria-label": checked ? "Copied Text" : "Copy Text",
    onClick,
    ...props,
    children: checked ? /* @__PURE__ */ jsx(Check, {}) : /* @__PURE__ */ jsx(Clipboard, {})
  });
}
function CodeBlockTabs({ ref, ...props }) {
  const containerRef = useRef(null);
  const nested = use(TabsContext) !== null;
  return /* @__PURE__ */ jsx(Tabs, {
    ref: mergeRefs$1(containerRef, ref),
    ...props,
    className: twMerge("bg-fd-card rounded-xl border", !nested && "my-4", props.className),
    children: /* @__PURE__ */ jsx(TabsContext, {
      value: useMemo(() => ({
        containerRef,
        nested
      }), [nested]),
      children: props.children
    })
  });
}
function CodeBlockTabsList(props) {
  return /* @__PURE__ */ jsx(TabsList, {
    ...props,
    className: twMerge("flex flex-row px-2 overflow-x-auto text-fd-muted-foreground", props.className),
    children: props.children
  });
}
function CodeBlockTabsTrigger({ children, ...props }) {
  return /* @__PURE__ */ jsxs(TabsTrigger, {
    ...props,
    className: twMerge("relative group inline-flex text-sm font-medium text-nowrap items-center transition-colors gap-2 px-2 py-1.5 hover:text-fd-accent-foreground data-[state=active]:text-fd-primary [&_svg]:size-3.5", props.className),
    children: [/* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 bottom-0 h-px group-data-[state=active]:bg-fd-primary" }), children]
  });
}
function CodeBlockTab(props) {
  return /* @__PURE__ */ jsx(TabsContent, { ...props });
}
function Image$1(props) {
  return /* @__PURE__ */ jsx(Image, {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px",
    ...props,
    src: props.src,
    className: twMerge("rounded-lg", props.className)
  });
}
function Table(props) {
  return /* @__PURE__ */ jsx("div", {
    className: "relative overflow-auto prose-no-margin my-6",
    children: /* @__PURE__ */ jsx("table", { ...props })
  });
}
const defaultMdxComponents = {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  pre: (props) => /* @__PURE__ */ jsx(CodeBlock, {
    ...props,
    children: /* @__PURE__ */ jsx(Pre, { children: props.children })
  }),
  Card,
  Cards,
  a: Link,
  img: Image$1,
  h1: (props) => /* @__PURE__ */ jsx(Heading, {
    as: "h1",
    ...props
  }),
  h2: (props) => /* @__PURE__ */ jsx(Heading, {
    as: "h2",
    ...props
  }),
  h3: (props) => /* @__PURE__ */ jsx(Heading, {
    as: "h3",
    ...props
  }),
  h4: (props) => /* @__PURE__ */ jsx(Heading, {
    as: "h4",
    ...props
  }),
  h5: (props) => /* @__PURE__ */ jsx(Heading, {
    as: "h5",
    ...props
  }),
  h6: (props) => /* @__PURE__ */ jsx(Heading, {
    as: "h6",
    ...props
  }),
  table: Table,
  Callout,
  CalloutContainer,
  CalloutTitle,
  CalloutDescription
};
const $$splitComponentImporter = () => import("./_-DXVFCnnm.js");
const Route$1 = createFileRoute("/docs/$")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  loader: async ({
    params
  }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await serverLoader({
      data: slugs
    });
    await clientLoader.preload(data.path);
    return data;
  }
});
const serverLoader = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).handler(createSsrRpc("3754d170b07e5384cb393a7ce01e3317e54e102cb5b75ed0780e1a678ae2d91a"));
const clientLoader = browserCollections.docs.createClientLoader({
  component({
    toc,
    frontmatter,
    default: MDX
  }) {
    return /* @__PURE__ */ jsxs(DocsPage, { toc, children: [
      /* @__PURE__ */ jsx(DocsTitle, { children: frontmatter.title }),
      /* @__PURE__ */ jsx(DocsDescription, { children: frontmatter.description }),
      /* @__PURE__ */ jsx(DocsBody, { children: /* @__PURE__ */ jsx(MDX, { components: {
        ...defaultMdxComponents
      } }) })
    ] });
  }
});
function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildRegexFromQuery(q) {
  const trimmed = q.trim();
  if (trimmed.length === 0) return null;
  const terms = Array.from(new Set(trimmed.split(/\s+/).map((t) => t.trim()).filter(Boolean)));
  if (terms.length === 0) return null;
  const escaped = terms.map(escapeRegExp).join("|");
  return new RegExp(`(${escaped})`, "gi");
}
function createContentHighlighter(query) {
  const regex = typeof query === "string" ? buildRegexFromQuery(query) : query;
  return { highlight(content) {
    if (!regex) return [{
      type: "text",
      content
    }];
    const out = [];
    let i = 0;
    for (const match of content.matchAll(regex)) {
      if (i < match.index) out.push({
        type: "text",
        content: content.substring(i, match.index)
      });
      out.push({
        type: "text",
        content: match[0],
        styles: { highlight: true }
      });
      i = match.index + match[0].length;
    }
    if (i < content.length) out.push({
      type: "text",
      content: content.substring(i)
    });
    return out;
  } };
}
function removeUndefined(value, deep = false) {
  const obj = value;
  for (const key in obj) {
    if (obj[key] === void 0) delete obj[key];
    if (!deep) continue;
    const entry = obj[key];
    if (typeof entry === "object" && entry !== null) {
      removeUndefined(entry, deep);
      continue;
    }
    if (Array.isArray(entry)) for (const item of entry) removeUndefined(item, deep);
  }
  return value;
}
async function searchSimple(db, query, params = {}) {
  const highlighter = createContentHighlighter(query);
  return (await search(db, {
    term: query,
    tolerance: 1,
    ...params,
    boost: {
      title: 2,
      ..."boost" in params ? params.boost : void 0
    }
  })).hits.map((hit) => ({
    type: "page",
    content: hit.document.title,
    breadcrumbs: hit.document.breadcrumbs,
    contentWithHighlights: highlighter.highlight(hit.document.title),
    id: hit.document.url,
    url: hit.document.url
  }));
}
async function searchAdvanced(db, query, tag = [], { mode = "fulltext", ...override } = {}) {
  if (typeof tag === "string") tag = [tag];
  let params = {
    ...override,
    mode,
    where: removeUndefined({
      tags: tag.length > 0 ? { containsAll: tag } : void 0,
      ...override.where
    }),
    groupBy: {
      properties: ["page_id"],
      maxResult: 8,
      ...override.groupBy
    }
  };
  if (query.length > 0) params = {
    ...params,
    term: query,
    properties: mode === "fulltext" ? ["content"] : ["content", "embeddings"]
  };
  const highlighter = createContentHighlighter(query);
  const result = await search(db, params);
  const list = [];
  for (const item of result.groups ?? []) {
    const pageId = item.values[0];
    const page = getByID(db, pageId);
    if (!page) continue;
    list.push({
      id: pageId,
      type: "page",
      content: page.content,
      breadcrumbs: page.breadcrumbs,
      contentWithHighlights: highlighter.highlight(page.content),
      url: page.url
    });
    for (const hit of item.result) {
      if (hit.document.type === "page") continue;
      list.push({
        id: hit.document.id.toString(),
        content: hit.document.content,
        breadcrumbs: hit.document.breadcrumbs,
        contentWithHighlights: highlighter.highlight(hit.document.content),
        type: hit.document.type,
        url: hit.document.url
      });
    }
  }
  return list;
}
function createEndpoint(server2) {
  const { search: search$1 } = server2;
  return {
    ...server2,
    async staticGET() {
      return Response.json(await server2.export());
    },
    async GET(request) {
      const url = new URL(request.url);
      const query = url.searchParams.get("query");
      if (!query) return Response.json([]);
      return Response.json(await search$1(query, {
        tag: url.searchParams.get("tag")?.split(",") ?? void 0,
        locale: url.searchParams.get("locale") ?? void 0,
        mode: url.searchParams.get("mode") === "vector" ? "vector" : "full"
      }));
    }
  };
}
const advancedSchema = {
  content: "string",
  page_id: "string",
  type: "string",
  breadcrumbs: "string[]",
  tags: "enum[]",
  url: "string",
  embeddings: "vector[512]"
};
async function createDB({ indexes, tokenizer, search: _, ...rest }) {
  const items = typeof indexes === "function" ? await indexes() : indexes;
  const db = create$1({
    schema: advancedSchema,
    ...rest,
    components: {
      ...rest.components,
      tokenizer: tokenizer ?? rest.components?.tokenizer
    }
  });
  const mapTo = [];
  items.forEach((page) => {
    const pageTag = page.tag ?? [];
    const tags = Array.isArray(pageTag) ? pageTag : [pageTag];
    const data = page.structuredData;
    let id = 0;
    mapTo.push({
      id: page.id,
      page_id: page.id,
      type: "page",
      content: page.title,
      breadcrumbs: page.breadcrumbs,
      tags,
      url: page.url
    });
    const nextId = () => `${page.id}-${id++}`;
    if (page.description) mapTo.push({
      id: nextId(),
      page_id: page.id,
      tags,
      type: "text",
      url: page.url,
      content: page.description
    });
    for (const heading of data.headings) mapTo.push({
      id: nextId(),
      page_id: page.id,
      type: "heading",
      tags,
      url: `${page.url}#${heading.id}`,
      content: heading.content
    });
    for (const content of data.contents) mapTo.push({
      id: nextId(),
      page_id: page.id,
      tags,
      type: "text",
      url: content.heading ? `${page.url}#${content.heading}` : page.url,
      content: content.content
    });
  });
  await insertMultiple(db, mapTo);
  return db;
}
function defaultBuildIndex(source2) {
  function isBreadcrumbItem(item) {
    return typeof item === "string" && item.length > 0;
  }
  return async (page) => {
    let breadcrumbs;
    let structuredData;
    if ("structuredData" in page.data) structuredData = page.data.structuredData;
    else if ("load" in page.data && typeof page.data.load === "function") structuredData = (await page.data.load()).structuredData;
    if (!structuredData) throw new Error("Cannot find structured data from page, please define the page to index function.");
    const pageTree = source2.getPageTree(page.locale);
    const path = findPath(pageTree.children, (node) => node.type === "page" && node.url === page.url);
    if (path) {
      breadcrumbs = [];
      path.pop();
      if (isBreadcrumbItem(pageTree.name)) breadcrumbs.push(pageTree.name);
      for (const segment of path) {
        if (!isBreadcrumbItem(segment.name)) continue;
        breadcrumbs.push(segment.name);
      }
    }
    return {
      title: page.data.title ?? basename(page.path, extname(page.path)),
      breadcrumbs,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData
    };
  };
}
function createFromSource(source2, options = {}) {
  const { buildIndex = defaultBuildIndex(source2) } = options;
  if (source2._i18n) return createI18nSearchAPI("advanced", {
    ...options,
    i18n: source2._i18n,
    indexes: async () => {
      const indexes = source2.getLanguages().flatMap((entry) => {
        return entry.pages.map(async (page) => ({
          ...await buildIndex(page),
          locale: entry.language
        }));
      });
      return Promise.all(indexes);
    }
  });
  return createSearchAPI("advanced", {
    ...options,
    indexes: async () => {
      const indexes = source2.getPages().map((page) => buildIndex(page));
      return Promise.all(indexes);
    }
  });
}
const STEMMERS = {
  arabic: "ar",
  armenian: "am",
  bulgarian: "bg",
  czech: "cz",
  danish: "dk",
  dutch: "nl",
  english: "en",
  finnish: "fi",
  french: "fr",
  german: "de",
  greek: "gr",
  hungarian: "hu",
  indian: "in",
  indonesian: "id",
  irish: "ie",
  italian: "it",
  lithuanian: "lt",
  nepali: "np",
  norwegian: "no",
  portuguese: "pt",
  romanian: "ro",
  russian: "ru",
  serbian: "rs",
  slovenian: "ru",
  spanish: "es",
  swedish: "se",
  tamil: "ta",
  turkish: "tr",
  ukrainian: "uk",
  sanskrit: "sk"
};
async function getTokenizer(locale) {
  return { language: Object.keys(STEMMERS).find((lang) => STEMMERS[lang] === locale) ?? locale };
}
async function initAdvanced(options) {
  const map = /* @__PURE__ */ new Map();
  if (options.i18n.languages.length === 0) return map;
  const indexes = typeof options.indexes === "function" ? await options.indexes() : options.indexes;
  for (const locale of options.i18n.languages) {
    const localeIndexes = indexes.filter((index) => index.locale === locale);
    const mapped = options.localeMap?.[locale] ?? await getTokenizer(locale);
    map.set(locale, typeof mapped === "object" ? initAdvancedSearch({
      ...options,
      indexes: localeIndexes,
      ...mapped
    }) : initAdvancedSearch({
      ...options,
      language: mapped,
      indexes: localeIndexes
    }));
  }
  return map;
}
function createI18nSearchAPI(type, options) {
  const get = initAdvanced(options);
  return createEndpoint({
    async export() {
      const map = await get;
      const entries = Array.from(map.entries()).map(async ([k, v]) => [k, await v.export()]);
      return {
        type: "i18n",
        data: Object.fromEntries(await Promise.all(entries))
      };
    },
    async search(query, searchOptions) {
      const map = await get;
      const locale = searchOptions?.locale ?? options.i18n.defaultLanguage;
      const handler = map.get(locale);
      if (handler) return handler.search(query, searchOptions);
      return [];
    }
  });
}
function createSearchAPI(type, options) {
  return createEndpoint(initAdvancedSearch(options));
}
function initAdvancedSearch(options) {
  const get = createDB(options);
  return {
    async export() {
      return {
        type: "advanced",
        ...save(await get)
      };
    },
    async search(query, searchOptions) {
      const db = await get;
      const mode = searchOptions?.mode;
      return searchAdvanced(db, query, searchOptions?.tag, {
        ...options.search,
        mode: mode === "vector" ? "vector" : "fulltext"
      }).catch((err) => {
        if (mode === "vector") throw new Error("failed to search, make sure you have installed `@orama/plugin-embeddings` according to their docs.", { cause: err });
        throw err;
      });
    }
  };
}
const server = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: "english"
});
const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => server.GET(request)
    }
  }
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const DocsSplatRoute = Route$1.update({
  id: "/docs/$",
  path: "/docs/$",
  getParentRoute: () => Route$3
});
const ApiSearchRoute = Route.update({
  id: "/api/search",
  path: "/api/search",
  getParentRoute: () => Route$3
});
const rootRouteChildren = {
  IndexRoute,
  ApiSearchRoute,
  DocsSplatRoute
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
    trailingSlash: "always"
  });
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  LinkItem as A,
  LanguageToggleText as B,
  browserCollections as C,
  DocsPage as D,
  DocsTitle as E,
  DocsDescription as F,
  DocsBody as G,
  HomeLayout as H,
  defaultMdxComponents as I,
  useRouter as J,
  i18n_exports as K,
  LayoutContextProvider as L,
  useOnChange as M,
  createContentHighlighter as N,
  removeUndefined as O,
  searchSimple as P,
  searchAdvanced as Q,
  Route$1 as R,
  SidebarContent as S,
  ThemeToggle as T,
  router as U,
  SidebarCollapseTrigger as a,
  buttonVariants as b,
  SearchToggle as c,
  SidebarDrawerOverlay as d,
  SidebarDrawerContent as e,
  SidebarFolder as f,
  SidebarFolderContent as g,
  SidebarFolderLink as h,
  useFolder as i,
  SidebarFolderTrigger as j,
  SidebarSeparator as k,
  SidebarItem as l,
  mergeRefs$1 as m,
  SidebarProvider as n,
  LayoutBody as o,
  LayoutHeader as p,
  renderTitleNav as q,
  resolveLinkItems as r,
  SidebarTrigger as s,
  tree_exports as t,
  useFolderDepth as u,
  LayoutTabs as v,
  SidebarViewport as w,
  LargeSearchToggle as x,
  SidebarTabsDropdown as y,
  LanguageToggle as z
};
