// @ts-check
import { defineConfig } from 'astro/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, extname } from 'node:path';
// Named import, not default: @babel/core is CJS, and Vite's ESM loader rejects
// a default import of it when it loads this config.
import { transformAsync } from '@babel/core';

const TARGETS = { chrome: '38', safari: '7.1' };

/**
 * Lower everything Astro emits to ES5, with Babel and nothing else.
 *
 * Vite cannot do this alone: it lowers with esbuild, and esbuild refuses to go
 * below ES2015. The usual answer is @vitejs/plugin-legacy, which is
 * disqualified here — it injects core-js polyfills into its legacy chunks by
 * default, and this site exists to compare two polyfill libraries. A third one
 * arriving uninvited would contaminate every number on the benchmark pages and
 * restore the natives those pages deliberately delete.
 *
 * So: Vite emits ES2017, and this Babels the build output the rest of the way
 * with `useBuiltIns: false` — syntax only, no polyfills, ever.
 *
 * Today the site emits no client JS at all (no components, no islands, every
 * payload is <script is:inline>), so this usually has nothing to do. It is a
 * guard: the moment someone adds a component, the output stops being ES5
 * silently, and nobody notices until a TV shows a blank page.
 */
function es5Output() {
  return {
    name: 'es5-output',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        // As low as esbuild will go. Babel does the rest below.
        updateConfig({ vite: { build: { target: 'es2017' } } });
      },

      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const entries = await readdir(root, { recursive: true, withFileTypes: true });

        /*
         * Only what Astro itself emitted — dist/_astro/.
         *
         * Everything else in dist/ is a verbatim copy of public/: the three
         * hand-written ES5 page scripts, and the vendor builds. Those must not
         * be touched. spackle's IIFE has already been proved ES5 by its own
         * build-time grep, and re-emitting it here would quietly replace the
         * verified artifact with an unverified one — the page would be running
         * something nobody checked. core-js is a megabyte, and Babelling it on
         * every build costs seconds for no gain.
         */
        let lowered = 0;
        for (const entry of entries) {
          if (!entry.isFile() || extname(entry.name) !== '.js') continue;
          const parent = entry.parentPath ?? entry.path;
          if (!parent.split(/[\\/]/).includes('_astro')) continue;
          const file = join(parent, entry.name);
          const source = await readFile(file, 'utf8');
          const result = await transformAsync(source, {
            configFile: false,
            babelrc: false,
            filename: file,
            compact: false,
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: TARGETS,
                  // Syntax only. The libraries under test provide the
                  // built-ins; injecting a polyfill here would be measuring
                  // Babel's core-js instead of them.
                  useBuiltIns: false,
                  exclude: ['transform-typeof-symbol'],
                },
              ],
            ],
          });
          if (result?.code && result.code !== source) {
            await writeFile(file, result.code);
            lowered++;
          }
        }

        /*
         * Babel lowers syntax; it cannot turn a module graph into classic
         * scripts. An engine without ESM silently skips <script type="module">
         * — the page loads and simply does nothing, which is the worst kind of
         * failure to debug on a device you cannot open devtools on. So fail the
         * build instead.
         */
        const modulePages = [];
        for (const entry of entries) {
          if (!entry.isFile() || extname(entry.name) !== '.html') continue;
          const file = join(entry.parentPath ?? entry.path, entry.name);
          if ((await readFile(file, 'utf8')).includes('type="module"')) modulePages.push(file);
        }

        if (modulePages.length) {
          throw new Error(
            'ES5 target: these pages emit <script type="module">, which the target ' +
              'engines cannot run:\n  ' +
              modulePages.join('\n  ') +
              '\nUse <script is:inline src="..."> with a pre-built ES5 file instead.'
          );
        }

        logger.info(
          lowered
            ? `lowered ${lowered} emitted file(s) to ES5, no module scripts`
            : 'nothing to lower — no client JS emitted, no module scripts'
        );
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://spackle.samseabourn.com',
  integrations: [es5Output()],
  redirects: {
    '/tv': '/device',
    '/tv/[test]': '/device/[test]',
  },
  vite: {
    server: {
      /*
       * Any Host header. Vite blocks unknown ones by default as DNS-rebinding
       * protection, which gets in the way here: these pages are opened from
       * other machines — a TV, a set-top box, a BrowserStack tunnel — and each
       * one arrives with a different host.
       *
       * Dev server only; `astro build` output is static files and never sees
       * this. Don't carry it into anything that serves untrusted traffic.
       */
      allowedHosts: true,
    },
    // `astro preview` serves through a separate Vite server with its own list.
    preview: {
      allowedHosts: true,
    },
  },
  /*
   * Off because it eats the space between a word and an inline element when
   * they sit on different source lines — "or open<a>Verify</a>" instead of
   * "or open <a>Verify</a>". These pages are a few KB of prose; the saving was
   * never worth proof-reading every paragraph for swallowed spaces.
   */
  compressHTML: false,
});
