// Upload one image to Cloudinary (same account and preset the admin
// ImageManager already uses) and return its secure https URL.
const CLOUDINARY_CLOUD_NAME = "njzlu0tu";
const CLOUDINARY_UPLOAD_PRESET = "omt_unsigned_upload";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadImage(file, folder) {
  if (!file || !ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG, WEBP or GIF image.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("The image must be 5 MB or smaller.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `one-more-take/${folder}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || "Image upload failed.");
  }

  return result.secure_url;
}
