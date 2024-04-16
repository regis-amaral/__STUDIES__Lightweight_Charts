let mix = require("laravel-mix");

mix
  .js("src/js/*.js", "public/js")
  .postCss("src/css/styles.css", "css")
  .copy("src/js/data.json", "public/js")
  .setPublicPath("public");
