const download = require("node-hls-downloader").download;

module.exports = {
	downloadSingleVideo: async ({ m3u8Url, filename, savedir = "media" }) => {
		await download({
			quality: "best",
			concurrency: 40,
			outputFile: `${savedir}/${filename}.mp4`,
			streamUrl: m3u8Url,
		});
	},
};
