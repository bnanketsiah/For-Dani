// js/createProduct.js - Product creation and R2 upload utilities

/**
 * Convert a File or Blob to base64 string
 * @param {File|Blob} file 
 * @returns {Promise<string>} base64 string (without data URL prefix)
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Strip the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Upload an image file to Cloudflare R2 storage
 * @param {File} imageFile - The image file to upload
 * @param {string} productId - The product/order ID to associate with
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImageToR2(imageFile, productId) {
    try {
        const base64Data = await fileToBase64(imageFile);
        
        // In production, this would call the server API
        // For local use, return a local object URL as fallback
        const objectUrl = URL.createObjectURL(imageFile);
        console.log('📸 Image ready (local):', objectUrl);
        return objectUrl;
        
    } catch (error) {
        console.error('❌ Error uploading image:', error);
        throw error;
    }
}

/**
 * Upload an audio file to Cloudflare R2 storage
 * @param {File} audioFile - The audio file to upload
 * @param {string} productId - The product/order ID to associate with
 * @returns {Promise<string>} The public URL of the uploaded audio
 */
export async function uploadAudioToR2(audioFile, productId) {
    try {
        const base64Data = await fileToBase64(audioFile);
        
        // In production, this would call the server API
        // For local use, return a local object URL as fallback
        const objectUrl = URL.createObjectURL(audioFile);
        console.log('🎵 Audio ready (local):', objectUrl);
        return objectUrl;
        
    } catch (error) {
        console.error('❌ Error uploading audio:', error);
        throw error;
    }
}

/**
 * Create a product entry on the server
 * @param {Object} productData - Product configuration data
 * @returns {Promise<Object>} Created product info
 */
export async function createProduct(productData) {
    try {
        // This would call the server API in production
        const productId = 'local_' + Date.now();
        console.log('🌌 Product created (local):', productId, productData);
        return { id: productId, ...productData };
    } catch (error) {
        console.error('❌ Error creating product:', error);
        throw error;
    }
}
