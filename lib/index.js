#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var path_1 = require("path");
var shelljs_1 = require("shelljs");
var pkg = require(path_1.resolve('package.json'));
var CWD = path_1.resolve();
var DIST_PATH = path_1.resolve(process.env.DIST_PATH || 'dist');
var SYNC_PATH = path_1.resolve('node_modules/.sync');
var PKG_PATH = path_1.resolve(SYNC_PATH, pkg.name);
var PKG_PATH_WITH_VERSION = path_1.resolve(SYNC_PATH, pkg.name, pkg.version);
var PKG_TEMP_DIR = fs_1.mkdtempSync(SYNC_PATH);
var PKG_TEMP_PATH = path_1.resolve(PKG_TEMP_DIR, 'package.json');
fs_1.writeFileSync(PKG_TEMP_PATH, JSON.stringify(lodash_1.pick(pkg, 'name', 'version', 'description', 'repository', 'author', 'license', 'dependencies', 'devDependencies'), null, 2));
shelljs_1.exec("\n#!/usr/bin/env bash\n\nset -e\n\nrm -rf " + SYNC_PATH + "\n\nmain() {\n  git log -1 --pretty=%B | cat |\n  if read -r MESSAGE\n  then\n    echo \"last commit message:\"\n    echo \"$MESSAGE\"\n\n    local CREATED=1\n\n    {\n      git clone https://user:$GH_TOKEN@github.com/1stg/modules.git " + SYNC_PATH + " -b gh-pages\n    } || {\n      echo \"branch \\`gh-pages\\` has not been created\"\n      CREATED=0\n      mkdir " + SYNC_PATH + "\n      cd " + SYNC_PATH + "\n      git init\n      git checkout -b gh-pages\n      git remote add origin https://user:$GH_TOKEN@github.com/1stg/modules.git\n      cd ..\n    }\n\n    mkdir -p " + PKG_PATH_WITH_VERSION + "\n\n    cd " + PKG_PATH + "\n    find . -maxdepth 1 -type f -exec rm -iv {} \\;\n    cp -rf " + DIST_PATH + "/* .\n    cp " + CWD + "/*.md .\n    cp " + PKG_TEMP_PATH + " ./package.json\n\n    rm -rf " + PKG_PATH_WITH_VERSION + "/*\n    cd " + PKG_PATH_WITH_VERSION + "\n    cp -rf " + DIST_PATH + "/* .\n    cp " + CWD + "/*.md .\n    cp " + PKG_TEMP_PATH + " ./package.json\n\n    rm -rf " + PKG_TEMP_DIR + "\n\n    git add -A\n    git status -s |\n    if read\n    then\n      git commit -m \"$MESSAGE\"\n\n      if [ \"$CREATED\" == \"1\" ]\n      then\n        git push --quiet\n      else\n        echo \"first push, create \\`gh-pages\\` branch\"\n        git push --quiet --set-upstream origin gh-pages\n      fi\n    else\n      echo \"there is nothing changed to commit\"\n    fi\n\n    rm -rf " + SYNC_PATH + "\n  fi\n}\n\nmain\n");
