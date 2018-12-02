const { mkdirSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const DEV = 'development'

const NODE_ENV = process.env.NODE_ENV || DEV

const isDev = NODE_ENV === DEV

const ENV_PATH = isDev ? DEV : 'production.min'
const SUFFIX_PATH = isDev ? '' : '.min'

const MODULES_MAP = {
  react: `umd/react.${ENV_PATH}`,
  'react-dom': `umd/react-dom.${ENV_PATH}`,
  antd: `dist/antd${SUFFIX_PATH}`,
  classnames: 'index',
  moment: isDev ? 'moment' : 'min/moment.min',
  '@1stg/jedi': '//1stg.github.io/jedi/index',
}

const MODULES_MAP_ENTRIES = Object.entries(MODULES_MAP)

const DIST_PATH = resolve('dist')

const UNPKG_PREFIX = '//unpkg.com/'

const getPath = (module, path) =>
  path.startsWith('//') ? path : `${UNPKG_PREFIX}${module}/${path}`

mkdirSync(DIST_PATH, { recursive: true })

writeFileSync(
  resolve(DIST_PATH, 'requirejs-paths.json'),
  JSON.stringify(
    MODULES_MAP_ENTRIES.reduce(
      (packages, [key, value]) =>
        Object.assign(packages, { [key]: getPath(key, value) }),
      {},
    ),
    null,
    2,
  ),
)

writeFileSync(
  resolve(DIST_PATH, 'systemjs-packages.json'),
  JSON.stringify(
    {
      packages: MODULES_MAP_ENTRIES.reduce(
        (packages, [key, value]) =>
          Object.assign(packages, { [key]: getPath(key, value) + '.js' }),
        {},
      ),
    },
    null,
    2,
  ),
)
