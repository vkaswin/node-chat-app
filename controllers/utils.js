const axios = require("axios");
const cheerio = require("cheerio");

const getMetaData = async (req, res) => {
  try {
    const {
      query: { url },
    } = req;
    let { data } = await axios({ method: "get", url });
    const $ = cheerio.load(data);
    const metaData = {};
    const metaTags = $("meta");
    metaTags.each((_, metaTag) => {
      const tag = $(metaTag);
      const key = tag.attr("name") || tag.attr("property");
      const value = tag.attr("content");
      if (!key || !value) return;
      metaData[key] = value;
    });
    if (!("title" in metaData)) {
      metaData.title = $("title").first().text();
    }
    metaData.favicon =
      $("[rel='icon']").attr("href") || $("[rel='shortcut icon']").attr("href");
    metaData.url = url;
    res.status(200).send({ data: metaData, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  getMetaData,
};