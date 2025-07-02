import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import copy from "esbuild-plugin-copy";
import fs from "fs";

const isDev = process.argv.includes("--watch");

const baseHref = isDev ? "/" : "/studio/";

const replaceBaseHrefPlugin = {
  name: "replace-base-href",
  setup(build) {
    build.onEnd(() => {
      const htmlPath = "build/index.html";
      let html = fs.readFileSync(htmlPath, "utf8");
      html = html.replace(/__BASE_HREF__/g, baseHref);
      fs.writeFileSync(htmlPath, html);
    });
  },
};

const commonConfig = {
    entryPoints: [
        "src/App.tsx",
        "node_modules/maplibre-gl/dist/maplibre-gl.css",
    ],
    outdir: "build",
    bundle: true,
    minify: !isDev,
    sourcemap: isDev ? "inline" : true,
    target: ["es2020"],
    splitting: true,
    format: "esm",
    entryNames: "[name]",
    assetNames: "assets/[name]",
    define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
        "process.env.INCORE_REMOTE_HOSTNAME": JSON.stringify(process.env.INCORE_REMOTE_HOSTNAME || ""),
        "__DEV__": JSON.stringify(isDev)
    },
    loader: {
        ".png": "file",
        ".jpg": "file",
        ".jpeg": "file",
        ".gif": "file",
        ".svg": "file",
        ".woff": "file",
        ".woff2": "file",
        ".ttf": "file",
        ".eot": "file",
        ".ico": "file",
        ".css": "css",
    },
    plugins: [
        sassPlugin({
            async transform(source) {
                const { css } = await postcss([autoprefixer]).process(source, { from: undefined });
                return css;
            }
        }),
        copy({
            assets: {
                from: ["public/**/*"],
                to: ["./"]
            }
        }),
        copy({
            assets: {
                from: ["src/index.html"],
                to: ["./index.html"]
            }
        }),
        replaceBaseHrefPlugin
    ],
    publicPath: isDev ?  "/": "/studio/",
    logLevel: "info",
    outExtension: { ".js": ".js" }
};

const run = async () => {
    const ctx = await esbuild.context(commonConfig);

    if (isDev) {
        await ctx.watch();
        await ctx.serve({
            servedir: "build",
            port: 3000
        });
        console.log("Serving at http://localhost:3000 (watch mode enabled)");
    } else {
        await ctx.rebuild();
        await ctx.dispose();
        console.log("esbuild build completed.");
    }
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
