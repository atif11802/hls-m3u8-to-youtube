require("dotenv").config();
const path = require("path");
const fs = require("fs");
const { downloadSingleVideo } = require("./download");
const {
	listVideos,
	getVideoByReferenceId,
	getVideoById,
} = require("./videoclient");
const videoIds = require("./data/video_ids.json");
const { uploadVideo } = require("./uploadToBunny");
const videoIdsDownloadData = fs.existsSync(
	"./data/video_ids_download_data.json"
)
	? require("./data/video_ids_download_data.json")
	: null;

const getVideoIdsData = async () => {
	if (videoIdsDownloadData?.length === videoIds.length) {
		console.log("Already downloaded all videos");
		return videoIdsDownloadData;
	}
	const arr = [];
	let i = 0;
	for (const id of videoIds) {
		console.log("Fetching", i++, "of", videoIds.length);
		const response = await getVideoById(id);
		if (!response) {
			console.log("[x] No response for id", id);
			continue;
		}
		const { result } = response;
		console.log();
		arr.push({
			id: result.id,
			url: result.manifest_url,
			reference_id: id,
			title: result.name,
			size: response.size,
			response,
		});
	}
	console.log(
		"Found",
		arr.length,
		"videos",
		"--- Total id was",
		videoIds.length
	);

	fs.writeFileSync(
		path.resolve(__dirname, "data", "video_ids_download_data.json"),
		JSON.stringify(arr)
	);

	return arr;
};

const execute = async () => {
	/**
	 * 1. fetch videos from existing video storage server
	 * 2. download each video to local storage & convert to mp4
	 * 3. upload each video to youtube
	 */

	const videos = await getVideoIdsData();
	for (const video of videos) {
		const { id, url, reference_id, title } = video;
		const filename = id;
		const m3u8Url = url;
		const abspath = path.resolve(
			__dirname,
			"..",
			"media",
			"upload",
			`${filename}.json`
		);

		const downloadFolder = path.resolve(
			__dirname,
			"..",
			"media",
			`${filename}.mp4`
		);

		console.log({ abspath });

		if (!fs.existsSync(abspath) && !fs.existsSync(downloadFolder)) {
			try {
				await downloadSingleVideo({ m3u8Url, filename });
			} catch (error) {
				console.log(error);
			}
		} else {
			console.log("Already downloaded ->", id, reference_id);
		}

		const isAlreadyUploaded = fs.existsSync(
			path.resolve(__dirname, "..", "media", "upload", `${filename}.json`)
		);

		if (isAlreadyUploaded) {
			console.log("Already uploaded ->", isAlreadyUploaded, id, reference_id);
			continue;
		}

		uploadVideo(title, downloadFolder, filename);
	}
};

execute();
