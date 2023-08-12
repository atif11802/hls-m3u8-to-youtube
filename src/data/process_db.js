const fs = require("fs");
const data = require("./v1_recordings_db.json");
const path = require("path");

const parseIdFromUri = (uri) => {
  return parseInt(uri.match(/\d+/)[0]);
};

const processDb = () => {
  const videoids = [];
  for (const item of data) {
    if (!item.videos) {
      console.log("No videos for item", item._id);
      continue;
    }
    for (const video of item.videos) {
      const id = parseIdFromUri(video.url);
      videoids.push(id);
    }
  }
  console.log("Found", videoids.length, "videos");

  const uniquevideoids = [...new Set(videoids)];
  console.log("Unique", uniquevideoids.length, "videos");

  fs.writeFileSync(
    path.resolve(__dirname, "video_ids.json"),
    JSON.stringify(uniquevideoids)
  );

  console.log("Wrote video_ids.json");
};

processDb();
