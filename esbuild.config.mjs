import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import copy from "esbuild-plugin-copy";

const isDev = process.argv.includes("--watch");

const commonConfig = {
    entryPoints: [
        "src/App.tsx",
        "node_modules/maplibre-gl/dist/maplibre-gl.css"
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
        ".ico": "file"
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
        })
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
