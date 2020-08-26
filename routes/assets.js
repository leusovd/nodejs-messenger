const path = require('path');
const express = require('express');
const { Router } = require('express');
const router = new Router();

const ROOT_PATH = process.env.ROOT_PATH;
const ASSETS_PATH = process.env.ASSETS_PATH;

router.use("/", express.static(ASSETS_PATH));

// Jquery and Bootstrap libs are including here.
// Is it a right way to handle front-end libs?
router.use(
    "/jquery",
    express.static(path.join(ROOT_PATH, "node_modules", "jquery", "dist"))
);
router.use(
    "/bootstrap",
    express.static(path.join(ROOT_PATH, "node_modules", "bootstrap", "dist"))
);

module.exports = router;