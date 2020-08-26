const path = require("path");
const express = require("express");
const nunjucks = require("nunjucks");
const mongoose = require("mongoose");
const app = express();
const { setIntervalLog } = require('./helpers/request-logger.js');
require('./helpers/constants');

nunjucks.configure(path.join(__dirname, "templates"), {
    autoescape: true,
    express: app,
    watch: true,
});

mongoose.connect(
    "mongodb+srv://leusovd:qwerty123@mynode.ftonf.mongodb.net/hillel-node",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }
);

mongoose.set("debug", true);

mongoose.connection.on("error", (e) => {
    console.error("MongoDB error:", e);
    process.exit(1);
});

app.use('/', require('./routes/index.js'));

app.use((err, req, res, next) => {
    res.status(err.code || 400).send({ status: "error", message: err.message });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on ${process.env.PORT || 3000}`);
    
    if (process.env.NODE_ENV === 'dev') {
        setIntervalLog();
    }
});
