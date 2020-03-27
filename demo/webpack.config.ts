import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { compact } from 'lodash';
import { resolve } from 'path';
import * as webpack from 'webpack';

// import * as SpeedMeasurePlugin from 'speed-measure-webpack-plugin';
// const smp = new SpeedMeasurePlugin();

const VERSION = JSON.stringify(require('../package.json').version);
const REVISION = JSON.stringify(
  require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim(),
);

function root(filename) {
  return resolve(__dirname + '/' + filename);
}

const babelLoader = mode => ({
  loader: 'babel-loader',
  options: {
    sourceType: 'unambiguous',
    generatorOpts: {
      decoratorsBeforeExport: true,
    },
    presets: [['@babel/env', { modules: false }], '@babel/react', '@babel/typescript'],
    plugins: compact([
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      'babel-plugin-transform-class-properties',
      '@babel/plugin-transform-runtime',
      [
        'babel-plugin-styled-components',
        {
          minify: true,
          displayName: mode !== 'production',
        },
      ],
      mode !== 'production' ? 'react-hot-loader/babel' : undefined,
    ]),
  },
});

export default (env: { playground?: boolean; bench?: boolean } = {}, { mode }) => ({
  entry: [
    'react-hot-loader/patch',
    root('../src/polyfills.ts'),
    root(
      env.playground
        ? 'playground/hmr-playground.tsx'
        : env.bench
        ? '../benchmark/index.tsx'
        : 'index.tsx',
    ),
  ],
  output: {
    filename: 'redoc-demo.bundle.js',
    path: root('dist'),
    globalObject: 'this',
  },

  devServer: {
    contentBase: __dirname,
    watchContentBase: true,
    port: 9090,
    disableHostCheck: true,
    stats: 'minimal',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias:
      mode !== 'production'
        ? {
            'react-dom': '@hot-loader/react-dom',
          }
        : {},
  },

  node: {
    fs: 'empty',
  },

  performance: false,

  externals: {
    esprima: 'esprima',
    'node-fetch': 'null',
    'node-fetch-h2': 'null',
    yaml: 'null',
    'safe-json-stringify': 'null',
  },

  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      { test: [/\.eot$/, /\.gif$/, /\.woff$/, /\.svg$/, /\.ttf$/], use: 'null-loader' },
      {
        test: /\.tsx?$/,
        use: babelLoader(mode),
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
      },
      {
        test: /node_modules\/(swagger2openapi|reftools|oas-resolver|oas-kit-common|oas-schema-walker)\/.*\.js$/,
        use: babelLoader(mode),
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __REDOC_VERSION__: VERSION,
      __REDOC_REVISION__: REVISION,
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: env.playground
        ? 'demo/playground/index.html'
        : env.bench
        ? 'benchmark/index.html'
        : 'demo/index.html',
    }),
    new ForkTsCheckerWebpackPlugin(),
    ignore(/js-yaml\/dumper\.js$/),
    ignore(/json-schema-ref-parser\/lib\/dereference\.js/),
    ignore(/^\.\/SearchWorker\.worker$/),
    new CopyWebpackPlugin(['demo/openapi.yaml']),
  ],
});

function ignore(regexp) {
  return new webpack.NormalModuleReplacementPlugin(regexp, require.resolve('lodash/noop.js'));
}
