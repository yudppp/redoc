import * as React from 'react';
import { render } from 'react-dom';
// tslint:disable-next-line
import { hot } from 'react-hot-loader/root';
// import DevTools from 'mobx-react-devtools';

import { Redoc, RedocProps } from '../../src/components/Redoc/Redoc';
import { AppStore } from '../../src/services/AppStore';
import { RedocRawOptions } from '../../src/services/RedocNormalizedOptions';
import { loadAndBundleSpec } from '../../src/utils/loadAndBundleSpec';

const RedocHot = hot(Redoc);

const renderRoot = (props: RedocProps) =>
  render(<RedocHot {...props} />, document.getElementById('example'));

const big = window.location.search.indexOf('big') > -1;
const swagger = window.location.search.indexOf('swagger') > -1;

const userUrl = window.location.search.match(/url=(.*)$/);

const specUrl =
  (userUrl && userUrl[1]) || (swagger ? 'swagger.yaml' : big ? 'big-openapi.json' : 'openapi.yaml');

let store;
const options: RedocRawOptions = { nativeScrollbars: false };

async function init() {
  const spec = await loadAndBundleSpec(specUrl);
  store = new AppStore(spec, specUrl, options);
  renderRoot({ store });
}

init();
