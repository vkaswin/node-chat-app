const { writeFile } = require("fs");

const logger = async (req, res, next) => {
  console.log(req, res.data);

  const log = "\npush log";

  writeFile(
    `./logs/index.txt`,
    log,
    {
      encoding: "utf8",
      flag: "a",
    },
    (err) => {
      if (err) return;
    }
  );

  next();
};

module.exports = logger;
