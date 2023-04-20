const fs = require("node:fs");
const path = require("node:path");
const sass = require("sass");
const browserslist = require("browserslist");
const { transform, browserslistToTargets } = require("lightningcss");

// Set default transpiling targets
let browserslistTargets = "> 0.2% and not dead";

// Check for user's browserslist
try {
  const package = path.resolve(__dirname, fs.realpathSync("package.json"));
  const userPkgBrowserslist = require(package);

  if (userPkgBrowserslist.browserslist) {
    browserslistTargets = userPkgBrowserslist.browserslist;
  } else {
    try {
      const browserslistrc = path.resolve(
        __dirname,
        fs.realpathSync(".browserslistrc")
      );

      fs.readFile(browserslistrc, "utf8", (_err, data) => {
        if (data.length) {
          browserslistTargets = [];
        }

        data.split(/\r?\n/).forEach((line) => {
          if (line.length && !line.startsWith("#")) {
            browserslistTargets.push(line);
          }
        });
      });
    } catch (err) {
      // no .browserslistrc
    }
  }
} catch (err) {
  // no package browserslist
}

module.exports = (eleventyConfig, options) => {
  const defaults = {
    minify: true,
    sourceMap: true,
  };

  const { minify, sourceMap } = {
    ...defaults,
    ...options,
  };

  // Recognize Sass as a "template languages"
  eleventyConfig.addTemplateFormats("scss");

  // Compile Sass and process with LightningCSS
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        return;
      }

      let targets = browserslistToTargets(browserslist(browserslistTargets));

      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || "."],
        sourceMap,
      });

      this.addDependencies(inputPath, result.loadedUrls);

      return async () => {
        let { code, map } = await transform({
          code: Buffer.from(result.css),
          minify,
          targets,
          sourceMap,
          inputSourceMap: JSON.stringify(result.sourceMap),
        });

        let mapComment = "";

        if (sourceMap) {
          const fileLocation = path.resolve(
            __dirname,
            fs.realpathSync(inputPath)
          );

          const sourceMapName = `${parsed.name}.css.map`;
          const sourceMapFile = `${path.dirname(
            fileLocation
          )}/${sourceMapName}`;

          fs.writeFileSync(sourceMapFile, map);

          mapComment = `/*# sourceMappingURL=${sourceMapName} */ `;
        }

        return code + "\n" + mapComment;
      };
    },
  });
};
