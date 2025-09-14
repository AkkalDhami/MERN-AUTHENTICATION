import cloudinary from "../config/cloudinary.js";

export const deleteCloudinaryImages = async (publicIds) => {
    if (!publicIds) return;

    if (Array.isArray(publicIds)) {
        const deletePromises = publicIds.map((id) => id && cloudinary.uploader.destroy(id));
        await Promise.all(deletePromises);
    } else {
        await cloudinary.uploader.destroy(publicIds);
    }
};