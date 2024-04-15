let mix = require("laravel-mix");

mix
  .js("src/js/app.js", "js")
  .postCss("src/css/styles.css", "css")
  .copy("src/js/data.json", "public/js")
  .setPublicPath("public");
