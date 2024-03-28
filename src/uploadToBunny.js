const fs = require("fs");
const path = require("path");
const axios = require("axios");

const uploadVideo = async (title, FILE_PATH, filename) => {
	const file = fs.createReadStream(FILE_PATH);

	const FILENAME_TO_UPLOAD = title;

	const optionsToCreateVideo = {
		method: "POST",
		url: `${process.env.BUNNY_STREAM_BASE_URL}/library/${process.env.BUNNY_STREAM_LIBRARY_ID}/videos`,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			AccessKey: process.env.BUNNY_API_KEY,
		},
		data: JSON.stringify({ title: FILENAME_TO_UPLOAD }),
	};

	await axios
		.request(optionsToCreateVideo)
		.then((response) => {
			const video_id = response.data.guid;
			console.log({ video_id });
			let config = {
				method: "put",
				maxBodyLength: Infinity,
				url: `${process.env.BUNNY_STREAM_BASE_URL}/library/${process.env.BUNNY_STREAM_LIBRARY_ID}/videos/${video_id}`,
				headers: {
					AccessKey: process.env.BUNNY_API_KEY,
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				data: file,
			};

			axios
				.request(config)
				.then((response) => {
					console.log(JSON.stringify(response.data));

					//update video

					const optionsToUpdateVideo = {
						method: "POST",
						url: `${process.env.BUNNY_STREAM_BASE_URL}/library/${process.env.BUNNY_STREAM_LIBRARY_ID}/videos/${video_id}`,
						headers: {
							accept: "application/json",
							"content-type": "application/*+json",
							AccessKey: process.env.BUNNY_API_KEY,
						},
						// data: '{"metaTags":[{"property":"recording","value":}]}',
						data: JSON.stringify({
							metaTags: [{ property: "recording", value: title }],
						}),
					};

					axios
						.request(optionsToUpdateVideo)
						.then(async (response) => {
							fs.writeFileSync(
								`media/upload/${filename}.json`,
								JSON.stringify({
									response: response?.data,
									videoFilePath: FILE_PATH,
								})
							);

							const file = "./data/uploaded_videos.json";

							if (
								fs.existsSync(
									path.resolve(__dirname, "data", "uploaded_videos.json")
								)
							) {
								let data = fs.readFileSync(
									path.resolve(__dirname, "data", "uploaded_videos.json")
								);
								let results = JSON.parse(data);

								const getBunnyDetails = await axios.get(
									`${process.env.BUNNY_STREAM_BASE_URL}/library/${process.env.BUNNY_STREAM_LIBRARY_ID}/videos/${video_id}`,
									{
										headers: {
											AccessKey: process.env.BUNNY_API_KEY,
											Accept: "application/json",
										},
									}
								);

								results.push({
									title,
									filename,
									bunny_id: video_id,
									bunny_details: getBunnyDetails.data,
								});

								fs.writeFileSync(
									path.resolve(__dirname, "data", "uploaded_videos.json"),
									JSON.stringify(results)
								);
							}

							// get uploaded_videos json file

							fs.unlinkSync(FILE_PATH);
						})
						.catch((error) => {
							console.log("error in updating video", error);
						});
				})
				.catch((error) => {
					console.log("error in uploading video", error);
				});
		})
		.catch((error) => {
			console.log("error in creating video", error);
		});
};

module.exports = { uploadVideo };
