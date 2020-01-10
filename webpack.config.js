const webpack = require('webpack');

module.exports = (production, browserlist, PATHS) => {

  const plugins = [];
  if (production) {
    const defPlug = new webpack.DefinePlugin({
      'process.env.NODE_ENV': 'production'
    });
    plugins.push(defPlug);
  }

  return {
    entry: ['@babel/polyfill', PATHS.jsEntry],
    
    output: {
      filename: 'app.bundle.js',
      path: __dirname+'/hs-cms-files',
    },
    
    mode: production ? 'production' : 'development',
   
    module: {
      rules: [{
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                "targets": {
                  "browsers": browserlist
                }
              }]
            ],
            plugins: ["@babel/plugin-transform-regenerator"]
          }
        }
      }]
    },
    
    plugins
  };
};