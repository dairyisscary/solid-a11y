const { readFile, writeFile, mkdir } = require("fs/promises");
const { resolve } = require("path");

const { PAGES, render } = require("./dist/server/index.cjs");

const RE = /<script type="module" crossorigin src="([^"]+)"><\/script>/g;

async function main() {
  const pathToPublicClient = resolve(__dirname, "./dist/client");
  const rawTemplate = await readFile(resolve(pathToPublicClient, "./index.html"), "utf-8");
  const scripts = Array.from(rawTemplate.matchAll(RE))
    .map(([, src]) => `<script type="module" crossorigin async src="${src}"></script>`)
    .join("");
  const template = rawTemplate.replaceAll(RE, "").replace("</body>", `${scripts}</body>`);
  const renders = PAGES.map(async ({ path, isError }) => {
    const start = Date.now();
    const pathToPublicPage = resolve(pathToPublicClient, `.${path}`);
    const [appHtml] = await Promise.all([
      render(path),
      isError ? Promise.resolve() : mkdir(pathToPublicPage, { recursive: true }),
    ]);
    const html = template.replace(`<!--app-html-->`, appHtml);
    const filePath = isError
      ? resolve(pathToPublicClient, "./error.html")
      : resolve(pathToPublicPage, "./index.html");
    // eslint-disable-next-line no-console
    console.log(`Finished pre-rendering ${path} in ${Date.now() - start} milliseconds.`);
    return writeFile(filePath, html, "utf-8");
  });
  return Promise.all(renders);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  });
