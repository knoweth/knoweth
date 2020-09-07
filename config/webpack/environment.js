const { environment } = require("@rails/webpacker");
const webpack = require("webpack");
const typescript = require("./loaders/typescript");

environment.loaders.prepend("typescript", typescript);

// Provide jquery and Popper as global objects for bootstrap
// See https://www.digitalocean.com/community/tutorials/how-to-add-bootstrap-to-a-ruby-on-rails-application
environment.plugins.append(
  "Provide",
  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery",
    Popper: ["popper.js", "default"],
  })
);

module.exports = environment;
module.exports = environment;
