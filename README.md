# Eleventy Plugin: Sass and LightningCSS

> Compile Sass in Eleventy (11ty) and process it with LightningCSS to minify, prefix, and add future CSS support.

Also respects either your package.json `browserslist` or a `.browserslistrc`, otherwise the default targets are `> 0.2% and not dead`.

Review [LightningCSS docs](https://lightningcss.dev/transpilation.html) to learn more about what future CSS features are supported via syntax lowering, including color functions, media query ranges, logical properties, and more.

> **Note**
> Requires Eleventy v2 - review [upgrade considerations](https://11ty.rocks/posts/new-features-upgrade-considerations-eleventy-version-2/) if applying to an existing project.

<small>Interested in using LightningCSS in 11ty without Sass? You'll want my [Eleventy LightningCSS plugin](https://github.com/5t3ph/eleventy-plugin-lightningcss) instead!</small>

## Usage

Install the plugin package:

```bash
npm install @11tyrocks/eleventy-plugin-sass-lightningcss
```

Then, include it in your `.eleventy.js` config file:

```js
const eleventySass = require("@11tyrocks/eleventy-plugin-sass-lightningcss");

module.exports = (eleventyConfig) => {
  // If you already have a config, add just the following line
  eleventyConfig.addPlugin(eleventySass);
};
```

⚠️ **Important**: The files will end up in `collections.all` and appear in places like RSS feeds where you may be using the "all" collection. To prevent that, [a temporary workaround](https://github.com/11ty/eleventy/discussions/2850#discussioncomment-5254892) is to create a directory data file to exclude your Sass files.

Place the following in the directory containing your Sass files. As an example, for a directory called `css` the file would be called `css/css.json`:

```js
{
  "eleventyExcludeFromCollections": true
}
```

Then, write your Sass using any organization pattern you like as long as it lives within your defined [Eleventy input directory](https://www.11ty.dev/docs/config/#input-directory).

> **Note**
> If you are already using PostCSS or Parcel, you will be doubling efforts with this plugin and should not add it.

## How does it work?

This plugin uses Eleventy's `addTemplateFormats` and `addExtension` features to essentiallly recognize Sass as a first-class templating language, and add custom processing. Since it makes Sass into a templating language, changes are applied during local development hot-reloading without a delay or requiring a manual browser refresh.

The docs actually show [the basics of including Sass](https://www.11ty.dev/docs/languages/custom/) but this plugin steps it up a notch by adding the processing using LightningCSS. This both minifies, prefixes, and enables transpiling based on your browserslist (or the included default) to gain future-CSS support today, with graceful upgrading as browser support improves.
