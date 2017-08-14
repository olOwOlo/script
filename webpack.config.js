module.exports = {
  /* taobao-search-plus */
  entry: ['./taobao-search-plus/taobao-search-plus.user.js'],
  output: {
    path: __dirname + '/taobao-search-plus',
    filename: 'taobao-search-plus.user.babel.js'
  },
  /* pixiv-search-sort */
  //entry: ['./pixiv-search-sort/pixiv.user.js'],
  //output: {
  //  path: __dirname + '/pixiv-search-sort',
  //  filename: 'pixiv.user.babel.js'
  //},

  module: {
    loaders: [
      {
        test:  /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
}
