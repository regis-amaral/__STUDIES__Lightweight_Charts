let mix = require("laravel-mix");

mix
  .copy("src/front/css/styles.css", "dist/front/css/styles.css")
  .copy("src/front/index.html", "dist/front/index.html")
  .ts("src/front/js/App.ts", "dist/front/js")
  .ts("src/front/js/ChartManager.ts", "dist/front/js")
  .setPublicPath("dist/front");
