#!/usr/bin/env node
import { mkdtempSync, writeFileSync } from 'fs'
import { pick } from 'lodash'
import { resolve } from 'path'

import { exec } from 'shelljs'

const pkg = require(resolve('package.json'))

const CWD = resolve()
const DIST_PATH = resolve(process.env.DIST_PATH || 'dist')

const SYNC_PATH = resolve('node_modules/.sync')
const PKG_PATH = resolve(SYNC_PATH, pkg.name)
const PKG_PATH_WITH_VERSION = resolve(SYNC_PATH, pkg.name, pkg.version)

const PKG_TEMP_DIR = mkdtempSync(SYNC_PATH)
const PKG_TEMP_PATH = resolve(PKG_TEMP_DIR, 'package.json')

writeFileSync(
  PKG_TEMP_PATH,
  JSON.stringify(
    pick(
      pkg,
      'name',
      'version',
      'description',
      'repository',
      'author',
      'license',
      'dependencies',
      'devDependencies',
    ),
    null,
    2,
  ),
)

exec(`
#!/usr/bin/env bash

set -e

rm -rf ${SYNC_PATH}

main() {
  git log -1 --pretty=%B | cat |
  if read -r MESSAGE
  then
    echo "last commit message:"
    echo "$MESSAGE"

    local CREATED=1

    {
      git clone https://user:$GH_TOKEN@github.com/1stg/modules.git ${SYNC_PATH} -b gh-pages
    } || {
      echo "branch \\\`gh-pages\\\` has not been created"
      CREATED=0
      mkdir ${SYNC_PATH}
      cd ${SYNC_PATH}
      git init
      git checkout -b gh-pages
      git remote add origin https://user:$GH_TOKEN@github.com/1stg/modules.git
      cd ..
    }

    mkdir -p ${PKG_PATH_WITH_VERSION}

    cd ${PKG_PATH}
    find . -maxdepth 1 -type f -exec rm -iv {} \\\;
    cp -rf ${DIST_PATH}/* .
    cp ${CWD}/*.md .
    cp ${PKG_TEMP_PATH} ./package.json

    rm -rf ${PKG_PATH_WITH_VERSION}/*
    cd ${PKG_PATH_WITH_VERSION}
    cp -rf ${DIST_PATH}/* .
    cp ${CWD}/*.md .
    cp ${PKG_TEMP_PATH} ./package.json

    rm -rf ${PKG_TEMP_DIR}

    git add -A
    git status -s |
    if read
    then
      git commit -m "$MESSAGE"

      if [ "$CREATED" == "1" ]
      then
        git push --quiet
      else
        echo "first push, create \\\`gh-pages\\\` branch"
        git push --quiet --set-upstream origin gh-pages
      fi
    else
      echo "there is nothing changed to commit"
    fi

    rm -rf ${SYNC_PATH}
  fi
}

main
`)
