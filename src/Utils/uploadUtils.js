import { getBaseUrl } from './baseApi';

/**
 * Upload utility functions for handling file uploads
 */

/**
 * Upload image for an existing product
 * @param {File} imageFile - The image file to upload
 * @param {string} productId - The product ID
 * @returns {Promise<string>} The uploaded image URL
 */
export const uploadProductImage = async (imageFile, productId) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`${getBaseUrl()}/api/upload/product/${productId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload error:', errorText);
    throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data.success) {
    console.log('Upload successful, imageUrl:', data.imageUrl);
    return data.imageUrl;
  } else {
    throw new Error(data.message || 'Upload failed');
  }
};

/**
 * Upload image for a new product (creates product first, then uploads image)
 * @param {File} imageFile - The image file to upload
 * @param {Object} productData - The product data
 * @returns {Promise<Object>} The created product with image URL
 */
export const createProductWithImage = async (imageFile, productData) => {
  const token = localStorage.getItem("token");
  
  // First, create the product without image
  const createResponse = await fetch(`${getBaseUrl()}/api/product`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  
  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    throw new Error(errorData.message || 'Failed to create product');
  }
  
  const createdProduct = await createResponse.json();
  
  // Then upload the image for the created product
  if (imageFile) {
    try {
      const imageUrl = await uploadProductImage(imageFile, createdProduct.productId);
      return { ...createdProduct, imageUrl };
    } catch (uploadError) {
      console.error('Image upload failed after product creation:', uploadError);
      // Return the product without image - user can upload later
      return createdProduct;
    }
  }
  
  return createdProduct;
};

/**
 * Upload image for a new product using a generic upload endpoint
 * This assumes you have a generic upload endpoint that returns just the image URL
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} The uploaded image URL
 */
export const uploadImageGeneric = async (imageFile) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`${getBaseUrl()}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload error:', errorText);
    throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data.success) {
    console.log('Upload successful, imageUrl:', data.imageUrl);
    return data.imageUrl;
  } else {
    throw new Error(data.message || 'Upload failed');
  }
}; 