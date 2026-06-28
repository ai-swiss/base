import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import starlight from "@astrojs/starlight";
import { buildSidebar } from "./src/lib/sidebar.mjs";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: process.env.BASE_DOCS_SITE || "https://base.a-i.swiss",
  outDir: process.env.BASE_DOCS_DIST ? path.resolve(process.env.BASE_DOCS_DIST) : undefined,
  // The Astro dev toolbar is a development-only overlay (absent from production builds). We disable
  // it so `docs serve` looks exactly like the deployed site, with no floating dev widget.
  devToolbar: { enabled: false },
  integrations: [
    starlight({
      title: "BASE Documentation",
      // The constant suffix reads "{page} · BASE Documentation" (matches Studio's tab titles).
      titleDelimiter: "·",
      // Dark by default: pre-seed the theme for a first-time visitor with no stored choice (forcing
      // dark even when the OS prefers light). The toggle still works and the visitor's choice persists.
      head: [
        {
          tag: "script",
          content:
            "try{if(!localStorage.getItem('starlight-theme')){localStorage.setItem('starlight-theme','dark');document.documentElement.dataset.theme='dark'}}catch(e){}",
        },
      ],
      // The header lockup is a custom SiteTitle (AI Swiss mark + «BASE Documentation»), matching Studio.
      components: { SiteTitle: "./src/components/SiteTitle.astro" },
      description:
        "Des assistants IA que votre équipe peut lire, vérifier et corriger. Documentation générée depuis le dépôt BASE.",
      defaultLocale: "root",
      locales: {
        root: { label: "Français", lang: "fr" },
        en: { label: "English", lang: "en" },
        de: { label: "Deutsch", lang: "de" },
        it: { label: "Italiano", lang: "it" },
      },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/ai-swiss/base" }],
      customCss: ["./src/styles/custom.css"],
      sidebar: buildSidebar(packageRoot),
    }),
  ],
});
