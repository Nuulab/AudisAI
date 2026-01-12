import { J as useRouter, K as i18n_exports, b as buttonVariants, M as useOnChange } from "./router-D0kxAyaB.js";
import { twMerge } from "tailwind-merge";
import { jsx, jsxs, Fragment as Fragment$1 } from "react/jsx-runtime";
import { Search, ChevronRight, Hash } from "lucide-react";
import { useEffectEvent, createContext, useMemo, useRef, useState, useEffect, Fragment, use, useCallback } from "react";
import { cva } from "class-variance-authority";
import scrollIntoView from "scroll-into-view-if-needed";
import { Dialog, DialogOverlay, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import "@tanstack/react-router";
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
import "./source-FYbSgCnA.js";
import "node:path";
import "fumadocs-mdx/runtime/server";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-scroll-area";
import "@radix-ui/react-presence";
import "@radix-ui/react-tabs";
import "@orama/orama";
const Context = createContext(null);
const ListContext = createContext(null);
const TagsListContext = createContext(null);
function SearchDialog({ open, onOpenChange, search, onSearchChange, isLoading = false, onSelect: onSelectProp, children }) {
  const router = useRouter();
  const onSelect = useEffectEvent((item) => {
    if (item.type === "action") item.onSelect();
    else if (item.external) window.open(item.url, "_blank")?.focus();
    else router.push(item.url);
    onOpenChange(false);
    onSelectProp?.(item);
  });
  return /* @__PURE__ */ jsx(Dialog, {
    open,
    onOpenChange,
    children: /* @__PURE__ */ jsx(Context.Provider, {
      value: useMemo(() => ({
        open,
        onOpenChange,
        search,
        onSearchChange,
        onSelect,
        isLoading
      }), [
        isLoading,
        onOpenChange,
        onSearchChange,
        open,
        search
      ]),
      children
    })
  });
}
function SearchDialogHeader(props) {
  return /* @__PURE__ */ jsx("div", {
    ...props,
    className: twMerge("flex flex-row items-center gap-2 p-3", props.className)
  });
}
function SearchDialogInput(props) {
  const { text } = (0, i18n_exports.useI18n)();
  const { search, onSearchChange } = useSearch();
  return /* @__PURE__ */ jsx("input", {
    ...props,
    value: search,
    onChange: (e) => onSearchChange(e.target.value),
    placeholder: text.search,
    className: "w-0 flex-1 bg-transparent text-lg placeholder:text-fd-muted-foreground focus-visible:outline-none"
  });
}
function SearchDialogClose({ children = "ESC", className, ...props }) {
  const { onOpenChange } = useSearch();
  return /* @__PURE__ */ jsx("button", {
    type: "button",
    onClick: () => onOpenChange(false),
    className: twMerge(buttonVariants({
      color: "outline",
      size: "sm",
      className: "font-mono text-fd-muted-foreground"
    }), className),
    ...props,
    children
  });
}
function SearchDialogFooter(props) {
  return /* @__PURE__ */ jsx("div", {
    ...props,
    className: twMerge("bg-fd-secondary/50 p-3 empty:hidden", props.className)
  });
}
function SearchDialogOverlay(props) {
  return /* @__PURE__ */ jsx(DialogOverlay, {
    ...props,
    className: twMerge("fixed inset-0 z-50 backdrop-blur-xs bg-fd-overlay data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out", props.className)
  });
}
function SearchDialogContent({ children, ...props }) {
  const { text } = (0, i18n_exports.useI18n)();
  return /* @__PURE__ */ jsxs(DialogContent, {
    "aria-describedby": void 0,
    ...props,
    className: twMerge("fixed left-1/2 top-4 md:top-[calc(50%-250px)] z-50 w-[calc(100%-1rem)] max-w-screen-sm -translate-x-1/2 rounded-xl border bg-fd-popover text-fd-popover-foreground shadow-2xl shadow-black/50 overflow-hidden data-[state=closed]:animate-fd-dialog-out data-[state=open]:animate-fd-dialog-in", "*:border-b *:has-[+:last-child[data-empty=true]]:border-b-0 *:data-[empty=true]:border-b-0 *:last:border-b-0", props.className),
    children: [/* @__PURE__ */ jsx(DialogTitle, {
      className: "hidden",
      children: text.search
    }), children]
  });
}
function SearchDialogList({ items = null, Empty = () => /* @__PURE__ */ jsx("div", {
  className: "py-12 text-center text-sm text-fd-muted-foreground",
  children: /* @__PURE__ */ jsx(i18n_exports.I18nLabel, { label: "searchNoResult" })
}), Item = (props$1) => /* @__PURE__ */ jsx(SearchDialogListItem, { ...props$1 }), ...props }) {
  const ref = useRef(null);
  const { onSelect } = useSearch();
  const [active, setActive] = useState(() => items && items.length > 0 ? items[0].id : null);
  const onKey = useEffectEvent((e) => {
    if (!items || e.isComposing) return;
    if (e.key === "ArrowDown" || e.key == "ArrowUp") {
      let idx = items.findIndex((item) => item.id === active);
      if (idx === -1) idx = 0;
      else if (e.key === "ArrowDown") idx++;
      else idx--;
      setActive(items.at(idx % items.length)?.id ?? null);
      e.preventDefault();
    }
    if (e.key === "Enter") {
      const selected = items.find((item) => item.id === active);
      if (selected) onSelect(selected);
      e.preventDefault();
    }
  });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const viewport$1 = element.firstElementChild;
      element.style.setProperty("--fd-animated-height", `${viewport$1.clientHeight}px`);
    });
    const viewport = element.firstElementChild;
    if (viewport) observer.observe(viewport);
    window.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useOnChange(items, () => {
    if (items && items.length > 0) setActive(items[0].id);
  });
  return /* @__PURE__ */ jsx("div", {
    ...props,
    ref,
    "data-empty": items === null,
    className: twMerge("overflow-hidden h-(--fd-animated-height) transition-[height]", props.className),
    children: /* @__PURE__ */ jsx("div", {
      className: twMerge("w-full flex flex-col overflow-y-auto max-h-[460px] p-1", !items && "hidden"),
      children: /* @__PURE__ */ jsxs(ListContext.Provider, {
        value: useMemo(() => ({
          active,
          setActive
        }), [active]),
        children: [items?.length === 0 && Empty(), items?.map((item) => /* @__PURE__ */ jsx(Fragment, { children: Item({
          item,
          onClick: () => onSelect(item)
        }) }, item.id))]
      })
    })
  });
}
function SearchDialogListItem({ item, className, children, renderHighlights: render = renderHighlights, ...props }) {
  const { active: activeId, setActive } = useSearchList();
  const active = item.id === activeId;
  if (item.type === "action") children ??= item.node;
  else children ??= /* @__PURE__ */ jsxs(Fragment$1, { children: [
    /* @__PURE__ */ jsx("div", {
      className: "inline-flex items-center text-fd-muted-foreground text-xs empty:hidden",
      children: item.breadcrumbs?.map((item$1, i) => /* @__PURE__ */ jsxs(Fragment, { children: [i > 0 && /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 rtl:rotate-180" }), item$1] }, i))
    }),
    item.type !== "page" && /* @__PURE__ */ jsx("div", {
      role: "none",
      className: "absolute start-3 inset-y-0 w-px bg-fd-border"
    }),
    /* @__PURE__ */ jsxs("p", {
      className: twMerge("min-w-0 truncate", item.type !== "page" && "ps-4", item.type === "page" || item.type === "heading" ? "font-medium" : "text-fd-popover-foreground/80"),
      children: [item.type === "heading" && /* @__PURE__ */ jsx(Hash, { className: "inline me-1 size-4 text-fd-muted-foreground" }), item.contentWithHighlights ? render(item.contentWithHighlights) : item.content]
    })
  ] });
  return /* @__PURE__ */ jsx("button", {
    type: "button",
    ref: useCallback((element) => {
      if (active && element) scrollIntoView(element, {
        scrollMode: "if-needed",
        block: "nearest",
        boundary: element.parentElement
      });
    }, [active]),
    "aria-selected": active,
    className: twMerge("relative select-none px-2.5 py-2 text-start text-sm rounded-lg", active && "bg-fd-accent text-fd-accent-foreground", className),
    onPointerMove: () => setActive(item.id),
    ...props,
    children
  });
}
function SearchDialogIcon(props) {
  const { isLoading } = useSearch();
  return /* @__PURE__ */ jsx(Search, {
    ...props,
    className: twMerge("size-5 text-fd-muted-foreground", isLoading && "animate-pulse duration-400", props.className)
  });
}
const itemVariants = cva("rounded-md border px-2 py-0.5 text-xs font-medium text-fd-muted-foreground transition-colors", { variants: { active: { true: "bg-fd-accent text-fd-accent-foreground" } } });
function TagsList({ tag, onTagChange, allowClear = false, ...props }) {
  return /* @__PURE__ */ jsx("div", {
    ...props,
    className: twMerge("flex items-center gap-1 flex-wrap", props.className),
    children: /* @__PURE__ */ jsx(TagsListContext.Provider, {
      value: useMemo(() => ({
        value: tag,
        onValueChange: onTagChange,
        allowClear
      }), [
        allowClear,
        onTagChange,
        tag
      ]),
      children: props.children
    })
  });
}
function TagsListItem({ value, className, ...props }) {
  const { onValueChange, value: selectedValue, allowClear } = useTagsList();
  const selected = value === selectedValue;
  return /* @__PURE__ */ jsx("button", {
    type: "button",
    "data-active": selected,
    className: twMerge(itemVariants({
      active: selected,
      className
    })),
    onClick: () => {
      onValueChange(selected && allowClear ? void 0 : value);
    },
    tabIndex: -1,
    ...props,
    children: props.children
  });
}
function renderHighlights(highlights) {
  return highlights.map((node, i) => {
    if (node.styles?.highlight) return /* @__PURE__ */ jsx("span", {
      className: "text-fd-primary underline",
      children: node.content
    }, i);
    return /* @__PURE__ */ jsx(Fragment, { children: node.content }, i);
  });
}
function useSearch() {
  const ctx = use(Context);
  if (!ctx) throw new Error("Missing <SearchDialog />");
  return ctx;
}
function useTagsList() {
  const ctx = use(TagsListContext);
  if (!ctx) throw new Error("Missing <TagsList />");
  return ctx;
}
function useSearchList() {
  const ctx = use(ListContext);
  if (!ctx) throw new Error("Missing <SearchDialogList />");
  return ctx;
}
function useDebounce(value, delayMs = 1e3) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    if (delayMs === 0) return;
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => clearTimeout(handler);
  }, [delayMs, value]);
  if (delayMs === 0) return value;
  return debouncedValue;
}
function isDeepEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return b.length === a.length && a.every((v, i) => isDeepEqual(v, b[i]));
  if (typeof a === "object" && a && typeof b === "object" && b) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every((key) => Object.hasOwn(b, key) && isDeepEqual(a[key], b[key]));
  }
  return false;
}
function useDocsSearch(clientOptions, deps) {
  const { delayMs = 100, allowEmpty = false, ...client } = clientOptions;
  const [search, setSearch] = useState("");
  const [results, setResults] = useState("empty");
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const debouncedValue = useDebounce(search, delayMs);
  const onStart = useRef(void 0);
  useOnChange([clientOptions, debouncedValue], () => {
    if (onStart.current) {
      onStart.current();
      onStart.current = void 0;
    }
    setIsLoading(true);
    let interrupt = false;
    onStart.current = () => {
      interrupt = true;
    };
    async function run() {
      if (debouncedValue.length === 0 && !allowEmpty) return "empty";
      switch (client.type) {
        case "fetch": {
          const { fetchDocs } = await import("./fetch-CiphcAUR-CII4epom.js");
          return fetchDocs(debouncedValue, client);
        }
        case "algolia": {
          const { searchDocs } = await import("./algolia-Dbt0kj8j-DQxOIR1m.js");
          return searchDocs(debouncedValue, client);
        }
        case "orama-cloud": {
          const { searchDocs } = await import("./orama-cloud-yicpgD0c-COaztK5s.js");
          return searchDocs(debouncedValue, client);
        }
        case "orama-cloud-legacy": {
          const { searchDocs } = await import("./orama-cloud-legacy-NJTbB19B-4ePrMy87.js");
          return searchDocs(debouncedValue, client);
        }
        case "mixedbread": {
          const { search: search$1 } = await import("./mixedbread-B0TvOHtt-DE-WD3D3.js");
          return search$1(debouncedValue, client);
        }
        case "static": {
          const { search: search$1 } = await import("./static-C_WBOzek-CSq6McLu.js");
          return search$1(debouncedValue, client);
        }
        default:
          throw new Error("unknown search client");
      }
    }
    run().then((res) => {
      if (interrupt) return;
      setError(void 0);
      setResults(res);
    }).catch((err) => {
      setError(err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, (a, b) => !isDeepEqual(a, b));
  return {
    search,
    setSearch,
    query: {
      isLoading,
      data: results,
      error
    }
  };
}
function DefaultSearchDialog({ defaultTag, tags = [], api, delayMs, type = "fetch", allowClear = false, links = [], footer, ...props }) {
  const { locale } = (0, i18n_exports.useI18n)();
  const [tag, setTag] = useState(defaultTag);
  const { search, setSearch, query } = useDocsSearch(type === "fetch" ? {
    type: "fetch",
    api,
    locale,
    tag,
    delayMs
  } : {
    type: "static",
    from: api,
    locale,
    tag,
    delayMs
  });
  const defaultItems = useMemo(() => {
    if (links.length === 0) return null;
    return links.map(([name, link]) => ({
      type: "page",
      id: name,
      content: name,
      url: link
    }));
  }, [links]);
  useOnChange(defaultTag, (v) => {
    setTag(v);
  });
  return /* @__PURE__ */ jsxs(SearchDialog, {
    search,
    onSearchChange: setSearch,
    isLoading: query.isLoading,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SearchDialogOverlay, {}),
      /* @__PURE__ */ jsxs(SearchDialogContent, { children: [/* @__PURE__ */ jsxs(SearchDialogHeader, { children: [
        /* @__PURE__ */ jsx(SearchDialogIcon, {}),
        /* @__PURE__ */ jsx(SearchDialogInput, {}),
        /* @__PURE__ */ jsx(SearchDialogClose, {})
      ] }), /* @__PURE__ */ jsx(SearchDialogList, { items: query.data !== "empty" ? query.data : defaultItems })] }),
      /* @__PURE__ */ jsxs(SearchDialogFooter, { children: [tags.length > 0 && /* @__PURE__ */ jsx(TagsList, {
        tag,
        onTagChange: setTag,
        allowClear,
        children: tags.map((tag$1) => /* @__PURE__ */ jsx(TagsListItem, {
          value: tag$1.value,
          children: tag$1.name
        }, tag$1.value))
      }), footer] })
    ]
  });
}
export {
  DefaultSearchDialog as default
};
