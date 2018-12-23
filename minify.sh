#!/bin/bash

rollup main.js --file bundle.min.js --format iife
terser bundle.min.js -m -c -o bundle.min.js


