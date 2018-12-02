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
  moment: isDev ? 'moment' : 'min/moment.min',
}

const DIST_PATH = resolve('dist')

mkdirSync(DIST_PATH, { recursive: true })

writeFileSync(
  resolve(DIST_PATH, 'requirejs-paths.json'),
  JSON.stringify(MODULES_MAP, null, 2),
)

writeFileSync(
  resolve(DIST_PATH, 'systemjs-packages.json'),
  JSON.stringify(
    Object.entries(MODULES_MAP).reduce(
      (packages, [key, value]) =>
        Object.assign(packages, { [key]: value + '.js' }),
      {},
    ),
    null,
    2,
  ),
)
