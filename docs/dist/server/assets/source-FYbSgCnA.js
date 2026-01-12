import path from "node:path";
import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { server } from "fumadocs-mdx/runtime/server";
import { createElement } from "react";
import { icons } from "lucide-react";
function normalizeUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!url.startsWith("/")) url = "/" + url;
  if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
  return url;
}
function findPath(nodes, matcher, options = {}) {
  const { includeSeparator = true } = options;
  function run(nodes$1) {
    let separator2;
    for (const node of nodes$1) {
      if (matcher(node)) {
        const items = [];
        if (separator2) items.push(separator2);
        items.push(node);
        return items;
      }
      if (node.type === "separator" && includeSeparator) {
        separator2 = node;
        continue;
      }
      if (node.type === "folder") {
        const items = node.index && matcher(node.index) ? [node.index] : run(node.children);
        if (items) {
          items.unshift(node);
          if (separator2) items.unshift(separator2);
          return items;
        }
      }
    }
  }
  return run(nodes) ?? null;
}
const VisitBreak = /* @__PURE__ */ Symbol("VisitBreak");
function visit(root, visitor) {
  function onNode(node, parent) {
    const result = visitor(node, parent);
    switch (result) {
      case "skip":
        return node;
      case "break":
        throw VisitBreak;
      default:
        if (result) node = result;
    }
    if ("index" in node && node.index) node.index = onNode(node.index, node);
    if ("fallback" in node && node.fallback) node.fallback = onNode(node.fallback, node);
    if ("children" in node) for (let i = 0; i < node.children.length; i++) node.children[i] = onNode(node.children[i], node);
    return node;
  }
  try {
    return onNode(root);
  } catch (e) {
    if (e === VisitBreak) return root;
    throw e;
  }
}
function basename(path2, ext) {
  const idx = path2.lastIndexOf("/");
  return path2.substring(idx === -1 ? 0 : idx + 1, ext ? path2.length - ext.length : path2.length);
}
function extname(path2) {
  const dotIdx = path2.lastIndexOf(".");
  if (dotIdx !== -1) return path2.substring(dotIdx);
  return "";
}
function dirname(path2) {
  return path2.split("/").slice(0, -1).join("/");
}
function splitPath(path2) {
  return path2.split("/").filter((p) => p.length > 0);
}
function joinPath(...paths) {
  const out = [];
  const parsed = paths.flatMap(splitPath);
  for (const seg of parsed) switch (seg) {
    case "..":
      out.pop();
      break;
    case ".":
      break;
    default:
      out.push(seg);
  }
  return out.join("/");
}
function slash(path2) {
  if (path2.startsWith("\\\\?\\")) return path2;
  return path2.replaceAll("\\", "/");
}
function slugsPlugin(slugFn) {
  function isIndex(file) {
    return basename(file, extname(file)) === "index";
  }
  return {
    name: "fumadocs:slugs",
    transformStorage({ storage }) {
      const indexFiles = [];
      const taken = /* @__PURE__ */ new Set();
      for (const path2 of storage.getFiles()) {
        const file = storage.read(path2);
        if (!file || file.format !== "page" || file.slugs) continue;
        const customSlugs = slugFn?.(file);
        if (customSlugs === void 0 && isIndex(path2)) {
          indexFiles.push(path2);
          continue;
        }
        file.slugs = customSlugs ?? getSlugs(path2);
        const key = file.slugs.join("/");
        if (taken.has(key)) throw new Error(`Duplicated slugs: ${key}`);
        taken.add(key);
      }
      for (const path2 of indexFiles) {
        const file = storage.read(path2);
        if (file?.format !== "page") continue;
        file.slugs = getSlugs(path2);
        if (taken.has(file.slugs.join("/"))) file.slugs.push("index");
      }
    }
  };
}
const GroupRegex = /^\(.+\)$/;
function getSlugs(file) {
  const dir = dirname(file);
  const name = basename(file, extname(file));
  const slugs = [];
  for (const seg of dir.split("/")) if (seg.length > 0 && !GroupRegex.test(seg)) slugs.push(encodeURI(seg));
  if (GroupRegex.test(name)) throw new Error(`Cannot use folder group in file names: ${file}`);
  if (name !== "index") slugs.push(encodeURI(name));
  return slugs;
}
function iconPlugin(resolveIcon) {
  function replaceIcon(node) {
    if (node.icon === void 0 || typeof node.icon === "string") node.icon = resolveIcon(node.icon);
    return node;
  }
  return {
    name: "fumadocs:icon",
    transformPageTree: {
      file: replaceIcon,
      folder: replaceIcon,
      separator: replaceIcon
    }
  };
}
var FileSystem = class {
  constructor(inherit) {
    this.files = /* @__PURE__ */ new Map();
    this.folders = /* @__PURE__ */ new Map();
    if (inherit) {
      for (const [k, v] of inherit.folders) this.folders.set(k, v);
      for (const [k, v] of inherit.files) this.files.set(k, v);
    } else this.folders.set("", []);
  }
  read(path$1) {
    return this.files.get(path$1);
  }
  /**
  * get the direct children of folder (in virtual file path)
  */
  readDir(path$1) {
    return this.folders.get(path$1);
  }
  write(path$1, file) {
    if (!this.files.has(path$1)) {
      const dir = dirname(path$1);
      this.makeDir(dir);
      this.readDir(dir)?.push(path$1);
    }
    this.files.set(path$1, file);
  }
  /**
  * Delete files at specified path.
  *
  * @param path - the target path.
  * @param [recursive=false] - if set to `true`, it will also delete directories.
  */
  delete(path$1, recursive = false) {
    if (this.files.delete(path$1)) return true;
    if (recursive) {
      const folder = this.folders.get(path$1);
      if (!folder) return false;
      this.folders.delete(path$1);
      for (const child of folder) this.delete(child);
      return true;
    }
    return false;
  }
  getFiles() {
    return Array.from(this.files.keys());
  }
  makeDir(path$1) {
    const segments = splitPath(path$1);
    for (let i = 0; i < segments.length; i++) {
      const segment = segments.slice(0, i + 1).join("/");
      if (this.folders.has(segment)) continue;
      this.folders.set(segment, []);
      this.folders.get(dirname(segment)).push(segment);
    }
  }
};
function isLocaleValid(locale) {
  return locale.length > 0 && !/\d+/.test(locale);
}
const parsers = {
  dir(path$1) {
    const [locale, ...segs] = path$1.split("/");
    if (locale && segs.length > 0 && isLocaleValid(locale)) return [segs.join("/"), locale];
    return [path$1];
  },
  dot(path$1) {
    const dir = dirname(path$1);
    const parts = basename(path$1).split(".");
    if (parts.length < 3) return [path$1];
    const [locale] = parts.splice(parts.length - 2, 1);
    if (!isLocaleValid(locale)) return [path$1];
    return [joinPath(dir, parts.join(".")), locale];
  },
  none(path$1) {
    return [path$1];
  }
};
function buildContentStorage(loaderConfig, defaultLanguage) {
  const { source: source$1, plugins = [], i18n = {
    defaultLanguage,
    parser: "none",
    languages: [defaultLanguage]
  } } = loaderConfig;
  const parser = parsers[i18n.parser ?? "dot"];
  const storages = {};
  const normalized = /* @__PURE__ */ new Map();
  for (const inputFile of source$1.files) {
    let file;
    if (inputFile.type === "page") file = {
      format: "page",
      path: normalizePath(inputFile.path),
      slugs: inputFile.slugs,
      data: inputFile.data,
      absolutePath: inputFile.absolutePath
    };
    else file = {
      format: "meta",
      path: normalizePath(inputFile.path),
      absolutePath: inputFile.absolutePath,
      data: inputFile.data
    };
    const [pathWithoutLocale, locale = i18n.defaultLanguage] = parser(file.path);
    const list = normalized.get(locale) ?? [];
    list.push({
      pathWithoutLocale,
      file
    });
    normalized.set(locale, list);
  }
  const fallbackLang = i18n.fallbackLanguage !== null ? i18n.fallbackLanguage ?? i18n.defaultLanguage : null;
  function scan(lang) {
    if (storages[lang]) return;
    let storage;
    if (fallbackLang && fallbackLang !== lang) {
      scan(fallbackLang);
      storage = new FileSystem(storages[fallbackLang]);
    } else storage = new FileSystem();
    for (const { pathWithoutLocale, file } of normalized.get(lang) ?? []) storage.write(pathWithoutLocale, file);
    const context = { storage };
    for (const plugin of plugins) plugin.transformStorage?.(context);
    storages[lang] = storage;
  }
  for (const lang of i18n.languages) scan(lang);
  return storages;
}
function normalizePath(path$1) {
  const segments = splitPath(slash(path$1));
  if (segments[0] === "." || segments[0] === "..") throw new Error("It must not start with './' or '../'");
  return segments.join("/");
}
function transformerFallback() {
  const addedFiles = /* @__PURE__ */ new Set();
  return {
    root(root) {
      const isolatedStorage = new FileSystem();
      for (const file of this.storage.getFiles()) {
        if (addedFiles.has(file)) continue;
        const content = this.storage.read(file);
        if (content) isolatedStorage.write(file, content);
      }
      if (isolatedStorage.getFiles().length === 0) return root;
      root.fallback = this.builder.build(isolatedStorage, {
        ...this.options,
        id: `fallback-${root.$id ?? ""}`,
        generateFallback: false
      });
      addedFiles.clear();
      return root;
    },
    file(node, file) {
      if (file) addedFiles.add(file);
      return node;
    },
    folder(node, _dir, metaPath) {
      if (metaPath) addedFiles.add(metaPath);
      return node;
    }
  };
}
const group = /^\((?<name>.+)\)$/;
const link = /^(?<external>external:)?(?:\[(?<icon>[^\]]+)])?\[(?<name>[^\]]+)]\((?<url>[^)]+)\)$/;
const separator = /^---(?:\[(?<icon>[^\]]+)])?(?<name>.+)---|^---$/;
const rest = "...";
const restReversed = "z...a";
const extractPrefix = "...";
const excludePrefix = "!";
function createPageTreeBuilder(loaderConfig) {
  const { plugins = [], url, pageTree: defaultOptions = {} } = loaderConfig;
  return {
    build(storage, options = defaultOptions) {
      const key = "";
      return this.buildI18n({ [key]: storage }, options)[key];
    },
    buildI18n(storages, options = defaultOptions) {
      let nextId = 0;
      const out = {};
      const transformers = [];
      if (options.transformers) transformers.push(...options.transformers);
      for (const plugin of plugins) if (plugin.transformPageTree) transformers.push(plugin.transformPageTree);
      if (options.generateFallback ?? true) transformers.push(transformerFallback());
      for (const [locale, storage] of Object.entries(storages)) {
        let rootId = locale.length === 0 ? "root" : locale;
        if (options.id) rootId = `${options.id}-${rootId}`;
        out[locale] = createPageTreeBuilderUtils({
          rootId,
          transformers,
          builder: this,
          options,
          getUrl: url,
          locale,
          storage,
          storages,
          generateNodeId() {
            return "_" + nextId++;
          }
        }).root();
      }
      return out;
    }
  };
}
function createFlattenPathResolver(storage) {
  const map = /* @__PURE__ */ new Map();
  const files = storage.getFiles();
  for (const file of files) {
    const content = storage.read(file);
    const flattenPath = file.substring(0, file.length - extname(file).length);
    map.set(flattenPath + "." + content.format, file);
  }
  return (name, format) => {
    return map.get(name + "." + format) ?? name;
  };
}
function createPageTreeBuilderUtils(ctx) {
  const resolveFlattenPath = createFlattenPathResolver(ctx.storage);
  const visitedPaths = /* @__PURE__ */ new Set();
  function nextNodeId(localId = ctx.generateNodeId()) {
    return `${ctx.rootId}:${localId}`;
  }
  return {
    buildPaths(paths, reversed = false) {
      const items = [];
      const folders = [];
      const sortedPaths = paths.sort((a, b) => a.localeCompare(b) * (reversed ? -1 : 1));
      for (const path$1 of sortedPaths) {
        const fileNode = this.file(path$1);
        if (fileNode) {
          if (basename(path$1, extname(path$1)) === "index") items.unshift(fileNode);
          else items.push(fileNode);
          continue;
        }
        const dirNode = this.folder(path$1, false);
        if (dirNode) folders.push(dirNode);
      }
      items.push(...folders);
      return items;
    },
    resolveFolderItem(folderPath, item) {
      if (item === rest || item === restReversed) return item;
      let match = separator.exec(item);
      if (match?.groups) {
        let node = {
          $id: nextNodeId(),
          type: "separator",
          icon: match.groups.icon,
          name: match.groups.name
        };
        for (const transformer of ctx.transformers) {
          if (!transformer.separator) continue;
          node = transformer.separator.call(ctx, node);
        }
        return [node];
      }
      match = link.exec(item);
      if (match?.groups) {
        const { icon, url, name, external } = match.groups;
        let node = {
          $id: nextNodeId(),
          type: "page",
          icon,
          name,
          url,
          external: external ? true : void 0
        };
        for (const transformer of ctx.transformers) {
          if (!transformer.file) continue;
          node = transformer.file.call(ctx, node);
        }
        return [node];
      }
      const isExcept = item.startsWith(excludePrefix);
      const isExtract = !isExcept && item.startsWith(extractPrefix);
      let filename = item;
      if (isExcept) filename = item.slice(1);
      else if (isExtract) filename = item.slice(3);
      const path$1 = resolveFlattenPath(joinPath(folderPath, filename), "page");
      if (isExcept) {
        visitedPaths.add(path$1);
        return [];
      }
      const dirNode = this.folder(path$1, false);
      if (dirNode) return isExtract ? dirNode.children : [dirNode];
      const fileNode = this.file(path$1);
      return fileNode ? [fileNode] : [];
    },
    folder(folderPath, isGlobalRoot) {
      const { storage, options, transformers } = ctx;
      const files = storage.readDir(folderPath);
      if (!files) return;
      const metaPath = resolveFlattenPath(joinPath(folderPath, "meta"), "meta");
      const indexPath = resolveFlattenPath(joinPath(folderPath, "index"), "page");
      let meta = storage.read(metaPath);
      if (meta && meta.format !== "meta") meta = void 0;
      const metadata = meta?.data ?? {};
      const { root = isGlobalRoot, pages } = metadata;
      let index;
      let children;
      if (pages) {
        const resolved = pages.flatMap((item) => this.resolveFolderItem(folderPath, item));
        if (!root && !visitedPaths.has(indexPath)) index = this.file(indexPath);
        for (let i = 0; i < resolved.length; i++) {
          const item = resolved[i];
          if (item !== rest && item !== restReversed) continue;
          const items = this.buildPaths(files.filter((file) => !visitedPaths.has(file)), item === restReversed);
          resolved.splice(i, 1, ...items);
          break;
        }
        children = resolved;
      } else {
        if (!root && !visitedPaths.has(indexPath)) index = this.file(indexPath);
        children = this.buildPaths(files.filter((file) => !visitedPaths.has(file)));
      }
      let node = {
        type: "folder",
        name: metadata.title ?? index?.name ?? (() => {
          const folderName = basename(folderPath);
          return pathToName(group.exec(folderName)?.[1] ?? folderName);
        })(),
        icon: metadata.icon ?? index?.icon,
        root: metadata.root,
        defaultOpen: metadata.defaultOpen,
        description: metadata.description,
        collapsible: metadata.collapsible,
        index,
        children,
        $id: nextNodeId(folderPath),
        $ref: !options.noRef && meta ? { metaFile: metaPath } : void 0
      };
      visitedPaths.add(folderPath);
      for (const transformer of transformers) {
        if (!transformer.folder) continue;
        node = transformer.folder.call(ctx, node, folderPath, metaPath);
      }
      return node;
    },
    file(path$1) {
      const { options, getUrl, storage, locale, transformers } = ctx;
      const page = storage.read(path$1);
      if (page?.format !== "page") return;
      const { title, description, icon } = page.data;
      let item = {
        $id: nextNodeId(path$1),
        type: "page",
        name: title ?? pathToName(basename(path$1, extname(path$1))),
        description,
        icon,
        url: getUrl(page.slugs, locale),
        $ref: !options.noRef ? { file: path$1 } : void 0
      };
      visitedPaths.add(path$1);
      for (const transformer of transformers) {
        if (!transformer.file) continue;
        item = transformer.file.call(ctx, item, path$1);
      }
      return item;
    },
    root() {
      const folder = this.folder("", true);
      let root = {
        $id: ctx.rootId,
        name: folder.name || "Docs",
        children: folder.children
      };
      for (const transformer of ctx.transformers) {
        if (!transformer.root) continue;
        root = transformer.root.call(ctx, root);
      }
      return root;
    }
  };
}
function pathToName(name) {
  const result = [];
  for (const c of name) if (result.length === 0) result.push(c.toLocaleUpperCase());
  else if (c === "-") result.push(" ");
  else result.push(c);
  return result.join("");
}
function indexPages(storages, { url }) {
  const result = {
    pages: /* @__PURE__ */ new Map(),
    pathToMeta: /* @__PURE__ */ new Map(),
    pathToPage: /* @__PURE__ */ new Map()
  };
  for (const [lang, storage] of Object.entries(storages)) for (const filePath of storage.getFiles()) {
    const item = storage.read(filePath);
    const path$1 = `${lang}.${filePath}`;
    if (item.format === "meta") {
      result.pathToMeta.set(path$1, {
        path: item.path,
        absolutePath: item.absolutePath,
        data: item.data
      });
      continue;
    }
    const page = {
      absolutePath: item.absolutePath,
      path: item.path,
      url: url(item.slugs, lang),
      slugs: item.slugs,
      data: item.data,
      locale: lang
    };
    result.pathToPage.set(path$1, page);
    result.pages.set(`${lang}.${page.slugs.join("/")}`, page);
  }
  return result;
}
function createGetUrl(baseUrl, i18n) {
  const baseSlugs = baseUrl.split("/");
  return (slugs, locale) => {
    const hideLocale = i18n?.hideLocale ?? "never";
    let urlLocale;
    if (hideLocale === "never") urlLocale = locale;
    else if (hideLocale === "default-locale" && locale !== i18n?.defaultLanguage) urlLocale = locale;
    const paths = [...baseSlugs, ...slugs];
    if (urlLocale) paths.unshift(urlLocale);
    return `/${paths.filter((v) => v.length > 0).join("/")}`;
  };
}
function loader(...args) {
  const loaderConfig = args.length === 2 ? resolveConfig(args[0], args[1]) : resolveConfig(args[0].source, args[0]);
  const { i18n } = loaderConfig;
  const defaultLanguage = i18n?.defaultLanguage ?? "";
  const storages = buildContentStorage(loaderConfig, defaultLanguage);
  const walker = indexPages(storages, loaderConfig);
  const builder = createPageTreeBuilder(loaderConfig);
  let pageTrees;
  function getPageTrees() {
    return pageTrees ??= builder.buildI18n(storages);
  }
  return {
    _i18n: i18n,
    get pageTree() {
      const trees = getPageTrees();
      return i18n ? trees : trees[defaultLanguage];
    },
    set pageTree(v) {
      if (i18n) pageTrees = v;
      else {
        pageTrees ??= {};
        pageTrees[defaultLanguage] = v;
      }
    },
    getPageByHref(href, { dir = "", language = defaultLanguage } = {}) {
      const [value, hash] = href.split("#", 2);
      let target;
      if (value.startsWith("./")) {
        const path$1 = joinPath(dir, value);
        target = walker.pathToPage.get(`${language}.${path$1}`);
      } else target = this.getPages(language).find((item) => item.url === value);
      if (target) return {
        page: target,
        hash
      };
    },
    resolveHref(href, parent) {
      if (href.startsWith("./")) {
        const target = this.getPageByHref(href, {
          dir: path.dirname(parent.path),
          language: parent.locale
        });
        if (target) return target.hash ? `${target.page.url}#${target.hash}` : target.page.url;
      }
      return href;
    },
    getPages(language) {
      const pages = [];
      for (const [key, value] of walker.pages.entries()) if (language === void 0 || key.startsWith(`${language}.`)) pages.push(value);
      return pages;
    },
    getLanguages() {
      const list = [];
      if (!i18n) return list;
      for (const language of i18n.languages) list.push({
        language,
        pages: this.getPages(language)
      });
      return list;
    },
    getPage(slugs = [], language = defaultLanguage) {
      let page = walker.pages.get(`${language}.${slugs.join("/")}`);
      if (page) return page;
      page = walker.pages.get(`${language}.${slugs.map(decodeURI).join("/")}`);
      if (page) return page;
    },
    getNodeMeta(node, language = defaultLanguage) {
      const ref = node.$ref?.metaFile;
      if (!ref) return;
      return walker.pathToMeta.get(`${language}.${ref}`);
    },
    getNodePage(node, language = defaultLanguage) {
      const ref = node.$ref?.file;
      if (!ref) return;
      return walker.pathToPage.get(`${language}.${ref}`);
    },
    getPageTree(locale = defaultLanguage) {
      const trees = getPageTrees();
      return trees[locale] ?? trees[defaultLanguage];
    },
    generateParams(slug, lang) {
      if (i18n) return this.getLanguages().flatMap((entry) => entry.pages.map((page) => ({
        [slug ?? "slug"]: page.slugs,
        [lang ?? "lang"]: entry.language
      })));
      return this.getPages().map((page) => ({ [slug ?? "slug"]: page.slugs }));
    },
    async serializePageTree(tree) {
      const { renderToString } = await import("react-dom/server.edge");
      return visit(tree, (node) => {
        node = { ...node };
        if ("icon" in node && node.icon) node.icon = renderToString(node.icon);
        if (node.name) node.name = renderToString(node.name);
        if ("children" in node) node.children = [...node.children];
        return node;
      });
    }
  };
}
function resolveConfig(source$1, { slugs, icon, plugins = [], baseUrl, url, ...base }) {
  let config = {
    ...base,
    url: url ? (...args) => normalizeUrl(url(...args)) : createGetUrl(baseUrl, base.i18n),
    source: source$1,
    plugins: buildPlugins([
      icon && iconPlugin(icon),
      ...typeof plugins === "function" ? plugins({ typedPlugin: (plugin) => plugin }) : plugins,
      slugsPlugin(slugs)
    ])
  };
  for (const plugin of config.plugins ?? []) {
    const result = plugin.config?.(config);
    if (result) config = result;
  }
  return config;
}
const priorityMap = {
  pre: 1,
  default: 0,
  post: -1
};
function buildPlugins(plugins, sort = true) {
  const flatten = [];
  for (const plugin of plugins) if (Array.isArray(plugin)) flatten.push(...buildPlugins(plugin, false));
  else if (plugin) flatten.push(plugin);
  if (sort) return flatten.sort((a, b) => priorityMap[b.enforce ?? "default"] - priorityMap[a.enforce ?? "default"]);
  return flatten;
}
let frontmatter$6 = {
  "title": "Configuration",
  "description": "Configuring AudisAI with config files and ignore rules."
};
let structuredData$6 = {
  "contents": [{
    "heading": "configuration",
    "content": "AudisAI can be configured via command-line arguments, a configuration file (audisai.yaml), or the interactive wizard."
  }, {
    "heading": "audisaiyaml",
    "content": "You can place a audisai.yaml file in the root of your project to persist your configuration."
  }, {
    "heading": "audisaiignore",
    "content": "Similar to .gitignore, you can use .audisaiignore to exclude files or directories from scanning. You can also ignore specific rules for specific files."
  }, {
    "heading": "initialization",
    "content": "You can generate these configuration files automatically:"
  }],
  "headings": [{
    "id": "configuration",
    "content": "Configuration"
  }, {
    "id": "audisaiyaml",
    "content": "audisai.yaml"
  }, {
    "id": "audisaiignore",
    "content": ".audisaiignore"
  }, {
    "id": "initialization",
    "content": "Initialization"
  }]
};
const toc$6 = [{
  depth: 1,
  url: "#configuration",
  title: jsx(Fragment, {
    children: "Configuration"
  })
}, {
  depth: 2,
  url: "#audisaiyaml",
  title: jsx(Fragment, {
    children: "audisai.yaml"
  })
}, {
  depth: 2,
  url: "#audisaiignore",
  title: jsx(Fragment, {
    children: ".audisaiignore"
  })
}, {
  depth: 2,
  url: "#initialization",
  title: jsx(Fragment, {
    children: "Initialization"
  })
}];
function _createMdxContent$6(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    p: "p",
    pre: "pre",
    span: "span",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "configuration",
      children: "Configuration"
    }), "\n", jsxs(_components.p, {
      children: ["AudisAI can be configured via command-line arguments, a configuration file (", jsx(_components.code, {
        children: "audisai.yaml"
      }), "), or the interactive wizard."]
    }), "\n", jsx(_components.h2, {
      id: "audisaiyaml",
      children: "audisai.yaml"
    }), "\n", jsxs(_components.p, {
      children: ["You can place a ", jsx(_components.code, {
        children: "audisai.yaml"
      }), " file in the root of your project to persist your configuration."]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Supported policies to check against (comma-separated codes)"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#22863A",
                "--shiki-dark": "#85E89D"
              },
              children: "states"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "tx,co,nist-ai,eu"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Default output format (markdown, json, sarif, pdf)"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#22863A",
                "--shiki-dark": "#85E89D"
              },
              children: "format"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "markdown"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Minimum severity to report (low, medium, high, critical)"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#22863A",
                "--shiki-dark": "#85E89D"
              },
              children: "min_severity"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "medium"
            })]
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Whether to exit with code 1 on violations"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#22863A",
                "--shiki-dark": "#85E89D"
              },
              children: "fail_on_violation"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "true"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "audisaiignore",
      children: ".audisaiignore"
    }), "\n", jsxs(_components.p, {
      children: ["Similar to ", jsx(_components.code, {
        children: ".gitignore"
      }), ", you can use ", jsx(_components.code, {
        children: ".audisaiignore"
      }), " to exclude files or directories from scanning. You can also ignore specific rules for specific files."]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Ignore directories"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "vendor/"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "node_modules/"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tests/"
            })
          }), "\n", jsx(_components.span, {
            className: "line"
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Ignore specific rule in a specific file"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Format: <Rule-ID>: <File-Path>"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "TX-001:"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " legacy_module.py"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "EU-005:"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " experimental/feature.ts"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "initialization",
      children: "Initialization"
    }), "\n", jsx(_components.p, {
      children: "You can generate these configuration files automatically:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " init"
            })]
          })
        })
      })
    })]
  });
}
function MDXContent$6(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$6, {
      ...props
    })
  }) : _createMdxContent$6(props);
}
const __vite_glob_1_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MDXContent$6,
  frontmatter: frontmatter$6,
  structuredData: structuredData$6,
  toc: toc$6
}, Symbol.toStringTag, { value: "Module" }));
let frontmatter$5 = {
  "title": "Installation",
  "description": "How to install AudisAI on your machine."
};
let structuredData$5 = {
  "contents": [{
    "heading": "installation",
    "content": "AudisAI is written in Go and can be installed as a standalone binary or built from source."
  }, {
    "heading": "pre-compiled-binaries",
    "content": "(Coming Soon) - Official releases will be available for macOS, Linux, and Windows."
  }, {
    "heading": "install-via-go",
    "content": "If you have Go installed (1.21+), you can install AudisAI directly:"
  }, {
    "heading": "install-via-go",
    "content": "Ensure your GOPATH bin directory is in your system PATH."
  }, {
    "heading": "build-from-source",
    "content": "You can clone the repository and build the binary manually:"
  }, {
    "heading": "verify-installation",
    "content": "Check that the installation was successful by checking the version:"
  }],
  "headings": [{
    "id": "installation",
    "content": "Installation"
  }, {
    "id": "pre-compiled-binaries",
    "content": "Pre-compiled Binaries"
  }, {
    "id": "install-via-go",
    "content": "Install via Go"
  }, {
    "id": "build-from-source",
    "content": "Build from Source"
  }, {
    "id": "verify-installation",
    "content": "Verify Installation"
  }]
};
const toc$5 = [{
  depth: 1,
  url: "#installation",
  title: jsx(Fragment, {
    children: "Installation"
  })
}, {
  depth: 2,
  url: "#pre-compiled-binaries",
  title: jsx(Fragment, {
    children: "Pre-compiled Binaries"
  })
}, {
  depth: 2,
  url: "#install-via-go",
  title: jsx(Fragment, {
    children: "Install via Go"
  })
}, {
  depth: 2,
  url: "#build-from-source",
  title: jsx(Fragment, {
    children: "Build from Source"
  })
}, {
  depth: 2,
  url: "#verify-installation",
  title: jsx(Fragment, {
    children: "Verify Installation"
  })
}];
function _createMdxContent$5(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    p: "p",
    pre: "pre",
    span: "span",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "installation",
      children: "Installation"
    }), "\n", jsx(_components.p, {
      children: "AudisAI is written in Go and can be installed as a standalone binary or built from source."
    }), "\n", jsx(_components.h2, {
      id: "pre-compiled-binaries",
      children: "Pre-compiled Binaries"
    }), "\n", jsx(_components.p, {
      children: "(Coming Soon) - Official releases will be available for macOS, Linux, and Windows."
    }), "\n", jsx(_components.h2, {
      id: "install-via-go",
      children: "Install via Go"
    }), "\n", jsx(_components.p, {
      children: "If you have Go installed (1.21+), you can install AudisAI directly:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "go"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " install"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " github.com/nuulab/audisai@latest"
            })]
          })
        })
      })
    }), "\n", jsxs(_components.p, {
      children: ["Ensure your ", jsx(_components.code, {
        children: "GOPATH"
      }), " bin directory is in your system ", jsx(_components.code, {
        children: "PATH"
      }), "."]
    }), "\n", jsx(_components.h2, {
      id: "build-from-source",
      children: "Build from Source"
    }), "\n", jsx(_components.p, {
      children: "You can clone the repository and build the binary manually:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "git"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " clone"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " https://github.com/nuulab/audisai.git"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "cd"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " audisai"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "go"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " build"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -o"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " main.go"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "verify-installation",
      children: "Verify Installation"
    }), "\n", jsx(_components.p, {
      children: "Check that the installation was successful by checking the version:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " version"
            })]
          })
        })
      })
    })]
  });
}
function MDXContent$5(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$5, {
      ...props
    })
  }) : _createMdxContent$5(props);
}
const __vite_glob_1_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MDXContent$5,
  frontmatter: frontmatter$5,
  structuredData: structuredData$5,
  toc: toc$5
}, Symbol.toStringTag, { value: "Module" }));
let frontmatter$4 = {
  "title": "Introduction",
  "description": "What is AudisAI and why was it created?"
};
let structuredData$4 = {
  "contents": [{
    "heading": "introduction",
    "content": "AudisAI is an automated compliance and static analysis tool designed specifically for the AI era. It scans your codebase to identify potential violations of AI-related laws, regulations, and industry frameworks—all without sending your code to the cloud."
  }, {
    "heading": "why-audisai",
    "content": "As AI regulation accelerates globally (EU AI Act, US State Laws, NIST frameworks), developers are facing a new challenge: Code Compliance. Just as we lint for syntax errors or scan for security vulnerabilities, we now need to scan for AI governance violations."
  }, {
    "heading": "why-audisai",
    "content": "However, most compliance tools are:"
  }, {
    "heading": "why-audisai",
    "content": "Cloud-based: Requiring you to upload sensitive IP."
  }, {
    "heading": "why-audisai",
    "content": "Legal-focused: Designed for lawyers, not developers."
  }, {
    "heading": "why-audisai",
    "content": "Manual: Spreadsheets and checklists instead of automated checks."
  }, {
    "heading": "why-audisai",
    "content": "AudisAI solves this by bringing compliance checks locally to your terminal and CI/CD pipeline."
  }, {
    "heading": "core-philosophy",
    "content": "Privacy First: No AI or LLM is used to scan your code. It uses deterministic pattern matching. Your code never leaves your machine."
  }, {
    "heading": "core-philosophy",
    "content": "Developer Centric: Runs as a CLI, integrates with Git, and outputs SARIF for easy IDE integration."
  }, {
    "heading": "core-philosophy",
    "content": "Comprehensive: Out-of-the-box support for major global regulations."
  }, {
    "heading": "what-it-detects",
    "content": "AudisAI looks for patterns in your code, comments, and configuration files that indicate:"
  }, {
    "heading": "what-it-detects",
    "content": "Unbalanced training datasets."
  }, {
    "heading": "what-it-detects",
    "content": "Lack of human oversight in automated decision loops."
  }, {
    "heading": "what-it-detects",
    "content": "Missing transparency disclosures."
  }, {
    "heading": "what-it-detects",
    "content": "Prohibited AI practices (e.g., biometric categorization)."
  }, {
    "heading": "what-it-detects",
    "content": "Usage of high-risk libraries without corresponding safeguards."
  }],
  "headings": [{
    "id": "introduction",
    "content": "Introduction"
  }, {
    "id": "why-audisai",
    "content": "Why AudisAI?"
  }, {
    "id": "core-philosophy",
    "content": "Core Philosophy"
  }, {
    "id": "what-it-detects",
    "content": "What it Detects"
  }]
};
const toc$4 = [{
  depth: 1,
  url: "#introduction",
  title: jsx(Fragment, {
    children: "Introduction"
  })
}, {
  depth: 2,
  url: "#why-audisai",
  title: jsx(Fragment, {
    children: "Why AudisAI?"
  })
}, {
  depth: 2,
  url: "#core-philosophy",
  title: jsx(Fragment, {
    children: "Core Philosophy"
  })
}, {
  depth: 2,
  url: "#what-it-detects",
  title: jsx(Fragment, {
    children: "What it Detects"
  })
}];
function _createMdxContent$4(props) {
  const _components = {
    h1: "h1",
    h2: "h2",
    li: "li",
    ol: "ol",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "introduction",
      children: "Introduction"
    }), "\n", jsx(_components.p, {
      children: "AudisAI is an automated compliance and static analysis tool designed specifically for the AI era. It scans your codebase to identify potential violations of AI-related laws, regulations, and industry frameworks—all without sending your code to the cloud."
    }), "\n", jsx(_components.h2, {
      id: "why-audisai",
      children: "Why AudisAI?"
    }), "\n", jsxs(_components.p, {
      children: ["As AI regulation accelerates globally (EU AI Act, US State Laws, NIST frameworks), developers are facing a new challenge: ", jsx(_components.strong, {
        children: "Code Compliance"
      }), ". Just as we lint for syntax errors or scan for security vulnerabilities, we now need to scan for AI governance violations."]
    }), "\n", jsx(_components.p, {
      children: "However, most compliance tools are:"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Cloud-based"
        }), ": Requiring you to upload sensitive IP."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Legal-focused"
        }), ": Designed for lawyers, not developers."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Manual"
        }), ": Spreadsheets and checklists instead of automated checks."]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["AudisAI solves this by bringing compliance checks ", jsx(_components.strong, {
        children: "locally"
      }), " to your terminal and CI/CD pipeline."]
    }), "\n", jsx(_components.h2, {
      id: "core-philosophy",
      children: "Core Philosophy"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Privacy First"
        }), ": No AI or LLM is used to scan your code. It uses deterministic pattern matching. Your code never leaves your machine."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Developer Centric"
        }), ": Runs as a CLI, integrates with Git, and outputs SARIF for easy IDE integration."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Comprehensive"
        }), ": Out-of-the-box support for major global regulations."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "what-it-detects",
      children: "What it Detects"
    }), "\n", jsx(_components.p, {
      children: "AudisAI looks for patterns in your code, comments, and configuration files that indicate:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "Unbalanced training datasets."
      }), "\n", jsx(_components.li, {
        children: "Lack of human oversight in automated decision loops."
      }), "\n", jsx(_components.li, {
        children: "Missing transparency disclosures."
      }), "\n", jsx(_components.li, {
        children: "Prohibited AI practices (e.g., biometric categorization)."
      }), "\n", jsx(_components.li, {
        children: "Usage of high-risk libraries without corresponding safeguards."
      }), "\n"]
    })]
  });
}
function MDXContent$4(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$4, {
      ...props
    })
  }) : _createMdxContent$4(props);
}
const __vite_glob_1_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MDXContent$4,
  frontmatter: frontmatter$4,
  structuredData: structuredData$4,
  toc: toc$4
}, Symbol.toStringTag, { value: "Module" }));
let frontmatter$3 = {
  "title": "Quick Start",
  "description": "Run your first scan in minutes."
};
let structuredData$3 = {
  "contents": [{
    "heading": "quick-start",
    "content": "Once installed, you can start using AudisAI immediately."
  }, {
    "heading": "the-interactive-wizard",
    "content": "For first-time users, the interactive wizard is the easiest way to get started. It will guide you through selecting policies and configuring the scan."
  }, {
    "heading": "running-a-scan",
    "content": "To run a scan directly from the CLI:"
  }, {
    "heading": "running-a-scan",
    "content": "This will:"
  }, {
    "heading": "running-a-scan",
    "content": "Scan the ./src directory."
  }, {
    "heading": "running-a-scan",
    "content": "Check against all available policies."
  }, {
    "heading": "running-a-scan",
    "content": "Output the results to the terminal."
  }, {
    "heading": "continuous-monitoring",
    "content": 'You can run AudisAI in "watch mode" to automatically rescan files as you modify them:'
  }, {
    "heading": "cicd-integration",
    "content": "To fail a build pipeline if critical violations are found:"
  }],
  "headings": [{
    "id": "quick-start",
    "content": "Quick Start"
  }, {
    "id": "the-interactive-wizard",
    "content": "The Interactive Wizard"
  }, {
    "id": "running-a-scan",
    "content": "Running a Scan"
  }, {
    "id": "continuous-monitoring",
    "content": "Continuous Monitoring"
  }, {
    "id": "cicd-integration",
    "content": "CI/CD Integration"
  }]
};
const toc$3 = [{
  depth: 1,
  url: "#quick-start",
  title: jsx(Fragment, {
    children: "Quick Start"
  })
}, {
  depth: 2,
  url: "#the-interactive-wizard",
  title: jsx(Fragment, {
    children: "The Interactive Wizard"
  })
}, {
  depth: 2,
  url: "#running-a-scan",
  title: jsx(Fragment, {
    children: "Running a Scan"
  })
}, {
  depth: 2,
  url: "#continuous-monitoring",
  title: jsx(Fragment, {
    children: "Continuous Monitoring"
  })
}, {
  depth: 2,
  url: "#cicd-integration",
  title: jsx(Fragment, {
    children: "CI/CD Integration"
  })
}];
function _createMdxContent$3(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "quick-start",
      children: "Quick Start"
    }), "\n", jsx(_components.p, {
      children: "Once installed, you can start using AudisAI immediately."
    }), "\n", jsx(_components.h2, {
      id: "the-interactive-wizard",
      children: "The Interactive Wizard"
    }), "\n", jsx(_components.p, {
      children: "For first-time users, the interactive wizard is the easiest way to get started. It will guide you through selecting policies and configuring the scan."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            })
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "running-a-scan",
      children: "Running a Scan"
    }), "\n", jsx(_components.p, {
      children: "To run a scan directly from the CLI:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " scan"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --path"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ./src"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --state"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " all"
            })]
          })
        })
      })
    }), "\n", jsx(_components.p, {
      children: "This will:"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: ["Scan the ", jsx(_components.code, {
          children: "./src"
        }), " directory."]
      }), "\n", jsxs(_components.li, {
        children: ["Check against ", jsx(_components.strong, {
          children: "all"
        }), " available policies."]
      }), "\n", jsx(_components.li, {
        children: "Output the results to the terminal."
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "continuous-monitoring",
      children: "Continuous Monitoring"
    }), "\n", jsx(_components.p, {
      children: 'You can run AudisAI in "watch mode" to automatically rescan files as you modify them:'
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " watch"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --path"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ."
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "cicd-integration",
      children: "CI/CD Integration"
    }), "\n", jsx(_components.p, {
      children: "To fail a build pipeline if critical violations are found:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " scan"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " \\"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "  --path"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " ."
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " \\"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "  --state"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " eu,nist-ai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " \\"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "  --fail-on-violation"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " \\"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "  --min-severity"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " high"
            })]
          })]
        })
      })
    })]
  });
}
function MDXContent$3(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$3, {
      ...props
    })
  }) : _createMdxContent$3(props);
}
const __vite_glob_1_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MDXContent$3,
  frontmatter: frontmatter$3,
  structuredData: structuredData$3,
  toc: toc$3
}, Symbol.toStringTag, { value: "Module" }));
let frontmatter$2 = {
  "title": "Overview",
  "description": "Understanding how policies work in AudisAI."
};
let structuredData$2 = {
  "contents": [{
    "heading": "policy-policies",
    "content": 'AudisAI uses "Policies" to define the rulesets for compliance checks. A policy typically corresponds to a specific law (e.g., Texas HB 149) or an industry framework (e.g., NIST AI RMF).'
  }, {
    "heading": "how-policies-work",
    "content": "Each policy is defined in a YAML file that contains:"
  }, {
    "heading": "how-policies-work",
    "content": "Metadata: Name, jurisdiction, description."
  }, {
    "heading": "how-policies-work",
    "content": "Rules: Specific patterns to look for in the code."
  }, {
    "heading": "how-policies-work",
    "content": "Remediation: Advice on how to fix the violation."
  }, {
    "heading": "selecting-policies",
    "content": "You can select which policies to apply using the --state (or -s) flag."
  }, {
    "heading": "selecting-policies",
    "content": "--state all: Run all checks."
  }, {
    "heading": "selecting-policies",
    "content": "--state eu: Run only EU AI Act checks."
  }, {
    "heading": "selecting-policies",
    "content": "--state tx,co,ca: Run checks for specific US states."
  }, {
    "heading": "selecting-policies",
    "content": "See Supported Frameworks for a full list of available codes."
  }],
  "headings": [{
    "id": "policy-policies",
    "content": "Policy Policies"
  }, {
    "id": "how-policies-work",
    "content": "How Policies Work"
  }, {
    "id": "selecting-policies",
    "content": "Selecting Policies"
  }]
};
const toc$2 = [{
  depth: 1,
  url: "#policy-policies",
  title: jsx(Fragment, {
    children: "Policy Policies"
  })
}, {
  depth: 2,
  url: "#how-policies-work",
  title: jsx(Fragment, {
    children: "How Policies Work"
  })
}, {
  depth: 2,
  url: "#selecting-policies",
  title: jsx(Fragment, {
    children: "Selecting Policies"
  })
}];
function _createMdxContent$2(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    h2: "h2",
    li: "li",
    ol: "ol",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "policy-policies",
      children: "Policy Policies"
    }), "\n", jsx(_components.p, {
      children: 'AudisAI uses "Policies" to define the rulesets for compliance checks. A policy typically corresponds to a specific law (e.g., Texas HB 149) or an industry framework (e.g., NIST AI RMF).'
    }), "\n", jsx(_components.h2, {
      id: "how-policies-work",
      children: "How Policies Work"
    }), "\n", jsx(_components.p, {
      children: "Each policy is defined in a YAML file that contains:"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Metadata"
        }), ": Name, jurisdiction, description."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Rules"
        }), ": Specific patterns to look for in the code."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Remediation"
        }), ": Advice on how to fix the violation."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "selecting-policies",
      children: "Selecting Policies"
    }), "\n", jsxs(_components.p, {
      children: ["You can select which policies to apply using the ", jsx(_components.code, {
        children: "--state"
      }), " (or ", jsx(_components.code, {
        children: "-s"
      }), ") flag."]
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "--state all"
        }), ": Run all checks."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "--state eu"
        }), ": Run only EU AI Act checks."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.code, {
          children: "--state tx,co,ca"
        }), ": Run checks for specific US states."]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["See ", jsx(_components.a, {
        href: "./supported-frameworks",
        children: "Supported Frameworks"
      }), " for a full list of available codes."]
    })]
  });
}
function MDXContent$2(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$2, {
      ...props
    })
  }) : _createMdxContent$2(props);
}
const __vite_glob_1_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MDXContent$2,
  frontmatter: frontmatter$2,
  structuredData: structuredData$2,
  toc: toc$2
}, Symbol.toStringTag, { value: "Module" }));
let frontmatter$1 = {
  "title": "Supported Frameworks",
  "description": "List of all supported laws and frameworks."
};
let structuredData$1 = {
  "contents": [{
    "heading": "supported-frameworks",
    "content": "AudisAI supports a growing list of regulations and standards."
  }, {
    "heading": "laws--regulations",
    "content": "Code"
  }, {
    "heading": "laws--regulations",
    "content": "Region"
  }, {
    "heading": "laws--regulations",
    "content": "Law / Act"
  }, {
    "heading": "laws--regulations",
    "content": "Description"
  }, {
    "heading": "laws--regulations",
    "content": "eu"
  }, {
    "heading": "laws--regulations",
    "content": "European Union"
  }, {
    "heading": "laws--regulations",
    "content": "EU AI Act"
  }, {
    "heading": "laws--regulations",
    "content": "Comprehensive risk-based regulation for AI systems."
  }, {
    "heading": "laws--regulations",
    "content": "tx"
  }, {
    "heading": "laws--regulations",
    "content": "Texas"
  }, {
    "heading": "laws--regulations",
    "content": "HB 149"
  }, {
    "heading": "laws--regulations",
    "content": "Responsible AI Governance Act."
  }, {
    "heading": "laws--regulations",
    "content": "co"
  }, {
    "heading": "laws--regulations",
    "content": "Colorado"
  }, {
    "heading": "laws--regulations",
    "content": "SB 205"
  }, {
    "heading": "laws--regulations",
    "content": "Consumer protections against AI discrimination."
  }, {
    "heading": "laws--regulations",
    "content": "ut"
  }, {
    "heading": "laws--regulations",
    "content": "Utah"
  }, {
    "heading": "laws--regulations",
    "content": "SB 149"
  }, {
    "heading": "laws--regulations",
    "content": "Artificial Intelligence Policy Act (Disclosure)."
  }, {
    "heading": "laws--regulations",
    "content": "tn"
  }, {
    "heading": "laws--regulations",
    "content": "Tennessee"
  }, {
    "heading": "laws--regulations",
    "content": "ELVIS Act"
  }, {
    "heading": "laws--regulations",
    "content": "Protection against unauthorized voice/likeness usage."
  }, {
    "heading": "laws--regulations",
    "content": "il"
  }, {
    "heading": "laws--regulations",
    "content": "Illinois"
  }, {
    "heading": "laws--regulations",
    "content": "HB 3773"
  }, {
    "heading": "laws--regulations",
    "content": "AI in employment and hiring."
  }, {
    "heading": "laws--regulations",
    "content": "nyc"
  }, {
    "heading": "laws--regulations",
    "content": "New York City"
  }, {
    "heading": "laws--regulations",
    "content": "Local Law 144"
  }, {
    "heading": "laws--regulations",
    "content": "Bias audits for automated employment decision tools."
  }, {
    "heading": "laws--regulations",
    "content": "ca"
  }, {
    "heading": "laws--regulations",
    "content": "California"
  }, {
    "heading": "laws--regulations",
    "content": "SB 243"
  }, {
    "heading": "laws--regulations",
    "content": "Bot transparency and disclosure requirements."
  }, {
    "heading": "industry-standards",
    "content": "Code"
  }, {
    "heading": "industry-standards",
    "content": "Framework"
  }, {
    "heading": "industry-standards",
    "content": "Description"
  }, {
    "heading": "industry-standards",
    "content": "nist-ai"
  }, {
    "heading": "industry-standards",
    "content": "NIST"
  }, {
    "heading": "industry-standards",
    "content": "AI Risk Management Framework (AI RMF 1.0)"
  }, {
    "heading": "industry-standards",
    "content": "Guidelines for managing risks in AI systems."
  }, {
    "heading": "industry-standards",
    "content": "nist-csf"
  }, {
    "heading": "industry-standards",
    "content": "NIST"
  }, {
    "heading": "industry-standards",
    "content": "Cybersecurity Framework 2.0"
  }, {
    "heading": "industry-standards",
    "content": "Standards for cybersecurity related to AI."
  }, {
    "heading": "industry-standards",
    "content": "iso27001"
  }, {
    "heading": "industry-standards",
    "content": "ISO/IEC"
  }, {
    "heading": "industry-standards",
    "content": "ISO 27001:2022"
  }, {
    "heading": "industry-standards",
    "content": "Information security management systems."
  }, {
    "heading": "industry-standards",
    "content": "cis"
  }, {
    "heading": "industry-standards",
    "content": "CIS"
  }, {
    "heading": "industry-standards",
    "content": "Critical Security Controls v8"
  }, {
    "heading": "industry-standards",
    "content": "Prioritized safeguards to mitigate cyber attacks."
  }],
  "headings": [{
    "id": "supported-frameworks",
    "content": "Supported Frameworks"
  }, {
    "id": "laws--regulations",
    "content": "Laws & Regulations"
  }, {
    "id": "industry-standards",
    "content": "Industry Standards"
  }]
};
const toc$1 = [{
  depth: 1,
  url: "#supported-frameworks",
  title: jsx(Fragment, {
    children: "Supported Frameworks"
  })
}, {
  depth: 2,
  url: "#laws--regulations",
  title: jsx(Fragment, {
    children: "Laws & Regulations"
  })
}, {
  depth: 2,
  url: "#industry-standards",
  title: jsx(Fragment, {
    children: "Industry Standards"
  })
}];
function _createMdxContent$1(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    p: "p",
    strong: "strong",
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "supported-frameworks",
      children: "Supported Frameworks"
    }), "\n", jsx(_components.p, {
      children: "AudisAI supports a growing list of regulations and standards."
    }), "\n", jsx(_components.h2, {
      id: "laws--regulations",
      children: "Laws & Regulations"
    }), "\n", jsxs(_components.table, {
      children: [jsx(_components.thead, {
        children: jsxs(_components.tr, {
          children: [jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Code"
          }), jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Region"
          }), jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Law / Act"
          }), jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Description"
          })]
        })
      }), jsxs(_components.tbody, {
        children: [jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "eu"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "European Union"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "EU AI Act"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Comprehensive risk-based regulation for AI systems."
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "tx"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Texas"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "HB 149"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Responsible AI Governance Act."
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "co"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Colorado"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "SB 205"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Consumer protections against AI discrimination."
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "ut"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Utah"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "SB 149"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Artificial Intelligence Policy Act (Disclosure)."
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "tn"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Tennessee"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "ELVIS Act"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Protection against unauthorized voice/likeness usage."
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "il"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Illinois"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "HB 3773"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "AI in employment and hiring."
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "nyc"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "New York City"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "Local Law 144"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Bias audits for automated employment decision tools."
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "ca"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "California"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "SB 243"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Bot transparency and disclosure requirements."
          })]
        })]
      })]
    }), "\n", jsx(_components.h2, {
      id: "industry-standards",
      children: "Industry Standards"
    }), "\n", jsxs(_components.table, {
      children: [jsx(_components.thead, {
        children: jsxs(_components.tr, {
          children: [jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Code"
          }), jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Framework"
          }), jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Description"
          })]
        })
      }), jsxs(_components.tbody, {
        children: [jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "nist-ai"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "NIST"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "AI Risk Management Framework (AI RMF 1.0)"
            })
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "nist-csf"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "NIST"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "Cybersecurity Framework 2.0"
            })
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "iso27001"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "ISO/IEC"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "ISO 27001:2022"
            })
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "cis"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "CIS"
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.strong, {
              children: "Critical Security Controls v8"
            })
          })]
        })]
      })]
    })]
  });
}
function MDXContent$1(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$1, {
      ...props
    })
  }) : _createMdxContent$1(props);
}
const __vite_glob_1_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MDXContent$1,
  frontmatter: frontmatter$1,
  structuredData: structuredData$1,
  toc: toc$1
}, Symbol.toStringTag, { value: "Module" }));
let frontmatter = {
  "title": "CLI Reference",
  "description": "Comprehensive reference for the AudisAI command-line interface."
};
let structuredData = {
  "contents": [{
    "heading": "audisai",
    "content": "Running the command without arguments launches the interactive wizard."
  }, {
    "heading": "scan",
    "content": "Scans a directory or repository."
  }, {
    "heading": "flags",
    "content": "Flag"
  }, {
    "heading": "flags",
    "content": "Shorthand"
  }, {
    "heading": "flags",
    "content": "Description"
  }, {
    "heading": "flags",
    "content": "Default"
  }, {
    "heading": "flags",
    "content": "--path"
  }, {
    "heading": "flags",
    "content": "-p"
  }, {
    "heading": "flags",
    "content": "Path to the directory to scan."
  }, {
    "heading": "flags",
    "content": "."
  }, {
    "heading": "flags",
    "content": "--state"
  }, {
    "heading": "flags",
    "content": "-s"
  }, {
    "heading": "flags",
    "content": "Comma-separated list of policy codes (e.g., tx,eu) or all."
  }, {
    "heading": "flags",
    "content": "all"
  }, {
    "heading": "flags",
    "content": "--repo"
  }, {
    "heading": "flags",
    "content": "-r"
  }, {
    "heading": "flags",
    "content": "URL of a remote git repository to clone and scan."
  }, {
    "heading": "flags",
    "content": "--format"
  }, {
    "heading": "flags",
    "content": "-f"
  }, {
    "heading": "flags",
    "content": "Output format: markdown, json, sarif, pdf."
  }, {
    "heading": "flags",
    "content": "markdown"
  }, {
    "heading": "flags",
    "content": "--output"
  }, {
    "heading": "flags",
    "content": "-o"
  }, {
    "heading": "flags",
    "content": "Output filename."
  }, {
    "heading": "flags",
    "content": "--output-dir"
  }, {
    "heading": "flags",
    "content": "-d"
  }, {
    "heading": "flags",
    "content": "Directory to save report artifacts."
  }, {
    "heading": "flags",
    "content": "--min-severity"
  }, {
    "heading": "flags",
    "content": "Minimum severity to report: low, medium, high, critical."
  }, {
    "heading": "flags",
    "content": "low"
  }, {
    "heading": "flags",
    "content": "--fail-on-violation"
  }, {
    "heading": "flags",
    "content": "Exit with code 1 if violations are found."
  }, {
    "heading": "flags",
    "content": "false"
  }, {
    "heading": "flags",
    "content": "--baseline"
  }, {
    "heading": "flags",
    "content": "-b"
  }, {
    "heading": "flags",
    "content": "Path to a previous scan result (JSON) to compare against."
  }, {
    "heading": "watch",
    "content": "Starts a file watcher that re-scans on change."
  }, {
    "heading": "init",
    "content": "Creates default configuration files (audisai.yaml and .audisaiignore)."
  }, {
    "heading": "update-db",
    "content": "Updates the local database of policy definitions and word lists."
  }, {
    "heading": "auth",
    "content": "Configures authentication for remote repositories."
  }, {
    "heading": "version",
    "content": "Displays version information."
  }],
  "headings": [{
    "id": "cli-reference",
    "content": "CLI Reference"
  }, {
    "id": "audisai",
    "content": "audisai"
  }, {
    "id": "scan",
    "content": "scan"
  }, {
    "id": "flags",
    "content": "Flags"
  }, {
    "id": "watch",
    "content": "watch"
  }, {
    "id": "init",
    "content": "init"
  }, {
    "id": "update-db",
    "content": "update-db"
  }, {
    "id": "auth",
    "content": "auth"
  }, {
    "id": "version",
    "content": "version"
  }]
};
const toc = [{
  depth: 1,
  url: "#cli-reference",
  title: jsx(Fragment, {
    children: "CLI Reference"
  })
}, {
  depth: 2,
  url: "#audisai",
  title: jsx(Fragment, {
    children: jsx("code", {
      children: "audisai"
    })
  })
}, {
  depth: 2,
  url: "#scan",
  title: jsx(Fragment, {
    children: jsx("code", {
      children: "scan"
    })
  })
}, {
  depth: 3,
  url: "#flags",
  title: jsx(Fragment, {
    children: "Flags"
  })
}, {
  depth: 2,
  url: "#watch",
  title: jsx(Fragment, {
    children: jsx("code", {
      children: "watch"
    })
  })
}, {
  depth: 2,
  url: "#init",
  title: jsx(Fragment, {
    children: jsx("code", {
      children: "init"
    })
  })
}, {
  depth: 2,
  url: "#update-db",
  title: jsx(Fragment, {
    children: jsx("code", {
      children: "update-db"
    })
  })
}, {
  depth: 2,
  url: "#auth",
  title: jsx(Fragment, {
    children: jsx("code", {
      children: "auth"
    })
  })
}, {
  depth: 2,
  url: "#version",
  title: jsx(Fragment, {
    children: jsx("code", {
      children: "version"
    })
  })
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    p: "p",
    pre: "pre",
    span: "span",
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h1, {
      id: "cli-reference",
      children: "CLI Reference"
    }), "\n", jsx(_components.h2, {
      id: "audisai",
      children: jsx(_components.code, {
        children: "audisai"
      })
    }), "\n", jsx(_components.p, {
      children: "Running the command without arguments launches the interactive wizard."
    }), "\n", jsx(_components.h2, {
      id: "scan",
      children: jsx(_components.code, {
        children: "scan"
      })
    }), "\n", jsx(_components.p, {
      children: "Scans a directory or repository."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " scan"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " [flags]"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "flags",
      children: "Flags"
    }), "\n", jsxs(_components.table, {
      children: [jsx(_components.thead, {
        children: jsxs(_components.tr, {
          children: [jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Flag"
          }), jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Shorthand"
          }), jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Description"
          }), jsx(_components.th, {
            style: {
              textAlign: "left"
            },
            children: "Default"
          })]
        })
      }), jsxs(_components.tbody, {
        children: [jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--path"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "-p"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Path to the directory to scan."
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "."
            })
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--state"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "-s"
            })
          }), jsxs(_components.td, {
            style: {
              textAlign: "left"
            },
            children: ["Comma-separated list of policy codes (e.g., ", jsx(_components.code, {
              children: "tx,eu"
            }), ") or ", jsx(_components.code, {
              children: "all"
            }), "."]
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "all"
            })
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--repo"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "-r"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "URL of a remote git repository to clone and scan."
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            }
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--format"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "-f"
            })
          }), jsxs(_components.td, {
            style: {
              textAlign: "left"
            },
            children: ["Output format: ", jsx(_components.code, {
              children: "markdown"
            }), ", ", jsx(_components.code, {
              children: "json"
            }), ", ", jsx(_components.code, {
              children: "sarif"
            }), ", ", jsx(_components.code, {
              children: "pdf"
            }), "."]
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "markdown"
            })
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--output"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "-o"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Output filename."
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            }
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--output-dir"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "-d"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Directory to save report artifacts."
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            }
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--min-severity"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            }
          }), jsxs(_components.td, {
            style: {
              textAlign: "left"
            },
            children: ["Minimum severity to report: ", jsx(_components.code, {
              children: "low"
            }), ", ", jsx(_components.code, {
              children: "medium"
            }), ", ", jsx(_components.code, {
              children: "high"
            }), ", ", jsx(_components.code, {
              children: "critical"
            }), "."]
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "low"
            })
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--fail-on-violation"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            }
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Exit with code 1 if violations are found."
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "false"
            })
          })]
        }), jsxs(_components.tr, {
          children: [jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "--baseline"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: jsx(_components.code, {
              children: "-b"
            })
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            },
            children: "Path to a previous scan result (JSON) to compare against."
          }), jsx(_components.td, {
            style: {
              textAlign: "left"
            }
          })]
        })]
      })]
    }), "\n", jsx(_components.h2, {
      id: "watch",
      children: jsx(_components.code, {
        children: "watch"
      })
    }), "\n", jsx(_components.p, {
      children: "Starts a file watcher that re-scans on change."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " watch"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " [flags]"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "init",
      children: jsx(_components.code, {
        children: "init"
      })
    }), "\n", jsxs(_components.p, {
      children: ["Creates default configuration files (", jsx(_components.code, {
        children: "audisai.yaml"
      }), " and ", jsx(_components.code, {
        children: ".audisaiignore"
      }), ")."]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " init"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "update-db",
      children: jsx(_components.code, {
        children: "update-db"
      })
    }), "\n", jsx(_components.p, {
      children: "Updates the local database of policy definitions and word lists."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " update-db"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "auth",
      children: jsx(_components.code, {
        children: "auth"
      })
    }), "\n", jsx(_components.p, {
      children: "Configures authentication for remote repositories."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " auth"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " github"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " auth"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " gitlab"
            })]
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "version",
      children: jsx(_components.code, {
        children: "version"
      })
    }), "\n", jsx(_components.p, {
      children: "Displays version information."
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "audisai"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " version"
            })]
          })
        })
      })
    })]
  });
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
const __vite_glob_1_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MDXContent,
  frontmatter,
  structuredData,
  toc
}, Symbol.toStringTag, { value: "Module" }));
const create = server({ "doc": { "passthroughs": ["extractedReferences"] } });
const docs = await create.docs("docs", "content", /* @__PURE__ */ Object.assign({}), /* @__PURE__ */ Object.assign({
  "./guide/configuration.mdx": __vite_glob_1_0,
  "./guide/installation.mdx": __vite_glob_1_1,
  "./guide/introduction.mdx": __vite_glob_1_2,
  "./guide/quick-start.mdx": __vite_glob_1_3,
  "./policies/overview.mdx": __vite_glob_1_4,
  "./policies/supported-frameworks.mdx": __vite_glob_1_5,
  "./reference/cli.mdx": __vite_glob_1_6
}));
function lucideIconsPlugin(options = {}) {
  const { defaultIcon } = options;
  return iconPlugin((icon = defaultIcon) => {
    if (icon === void 0) return;
    const Icon = icons[icon];
    if (!Icon) {
      console.warn(`[lucide-icons-plugin] Unknown icon detected: ${icon}.`);
      return;
    }
    return createElement(Icon);
  });
}
const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
  plugins: [lucideIconsPlugin()]
});
export {
  __vite_glob_1_0 as _,
  __vite_glob_1_1 as a,
  basename as b,
  __vite_glob_1_2 as c,
  __vite_glob_1_3 as d,
  extname as e,
  findPath as f,
  __vite_glob_1_4 as g,
  __vite_glob_1_5 as h,
  __vite_glob_1_6 as i,
  normalizeUrl as n,
  source as s,
  visit as v
};
