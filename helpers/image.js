const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const uploadToAwsS3 = async (base64String, bucketName, key) => {
    const fileContent = Buffer.from(base64String, "base64");

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error("Error uploading to S3:", err);
        } else {
            console.log(
                "File uploaded successfully. S3 Location:",
                data.Location
            );
        }
    });
};

// // Example usage
// const fileContent = 'Hello, this is the content of my file!';
// const bucketName = 'your-s3-bucket-name';
// const key = 'path/to/your/file.txt';

// uploadToAwsS3(fileContent, bucketName, key);

const compressImage = async (imageData) => {
    imageData = imageData.split(",")[1];

    const inputBuffer = Buffer.from(imageData, "base64");
    const outputBuffer = await sharp(inputBuffer)
        .resize({ width: 50 }) // or any other size you want
        .jpeg({ quality: 50 }) // or any other format and quality you want
        .toBuffer();
    return outputBuffer.toString("base64");
};
const uploadToImgur = async (image) => {
    let imageData = image;

    const IMGUR_CLIENT_ID = "869f294e59431cd";

    try {
        response = await axios({
            method: "post",
            url: "https://api.imgur.com/3/image",
            data: {
                image: imageData,
            },
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            },
        });
    } catch (error) {
        console.error("Error uploading image to Imgur:", error.message);
        throw error;
    }

    imgurUrl = response.data.data.link;

    console.log("Image URL:", imgurUrl);

    return imgurUrl;
};
cloudinary.config({
    cloud_name: "di0mvijee",
    api_key: "937372845829153",
    api_secret:
        "CLOUDINARY_URL=cloudinary://937372845829153:222sbPe3ZrkjVUbO7asNKfYd8ZI@di0mvijee",
});

// Function to upload image to Cloudinary
const uploadToCloudinary = async (image) => {
    try {
        const result = await cloudinary.uploader.upload(image);
        // You can customize the folder option based on your needs

        // Return the public URL of the uploaded image
        imageUrl = result.secure_url;

        console.log("Image URL:", imageUrl);

        return imageUrl;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);
        throw error;
    }
};

module.exports = {
    // uploadToCloudinary,
    uploadToImgur,
    compressImage,
};
