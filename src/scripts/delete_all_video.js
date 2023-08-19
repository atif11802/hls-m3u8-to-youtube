/**
 * !! CAUTION !!
 * This script will delete all videos from your video storage server.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  listVideos,
  deleteVideoById,
  getVideoByCustomId,
  getVideoByReferenceId,
} = require("../videoclient");

const fetchAllVideos = async () => {
  console.log("Fetching all videos");
  const videos = await listVideos({ page_size: 20000 });
  fs.writeFileSync(
    path.join(__dirname, "..", "data", "all-videos.json"),
    JSON.stringify(videos, null, 2)
  );
  console.log("Wrote all-videos.json", videos.result.length);
};

const deleteMismatchVideos = async () => {
  const videos = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "data", "all-videos.json"))
  );

  const { result } = videos;
  console.log("Found", result.length, "videos");

  const arr = [];
  for (const video of result) {
    if (video.reference_id?.includes("duration_mismatch_")) {
      arr.push(video);
      console.log("Deleting", video.id, video.reference_id);
      await deleteVideoById(video.id);
      console.log("Deleted", video.id, video.reference_id);
      // break;
    }
  }

  console.log("Found", arr.length, "videos with duration mismatch");
};

const deleteVideoByReferenceId = async (reference_id) => {
  let video = await getVideoByReferenceId(reference_id);
  if (video) {
    video = video.result;
    await deleteVideoById(video.id);
  } else {
    console.log("Not found", reference_id);
  }
};

const deleteAllVideos = async () => {
  console.log("Deleting all videos");
  const videoIds = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "data", "video_ids.json"))
  );
  console.log("Found", videoIds.length, "videos");

  const p_arr = [];
  let c = 0;
  const total = videoIds.length;
  for (const id of videoIds) {
    c++;
    console.log("Deleting", c, "of", total, id);
    await deleteVideoByReferenceId(id);
  }

  console.log("Found", p_arr.length, "videos to delete");
  // await Promise.all(p_arr);
  console.log("Deleted", p_arr.length, "videos");
};

const func = async () => {
  // await fetchAllVideos();
  // await deleteMismatchVideos();
  await deleteAllVideos();
};

func();
