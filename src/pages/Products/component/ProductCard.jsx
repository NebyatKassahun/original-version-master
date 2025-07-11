import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from "../../../Utils/baseApi";
import { getFullImageUrl, handleImageError, validateImageFile } from "../../../Utils/imageUtils";
import { uploadProductImage } from "../../../Utils/uploadUtils";
import { 
	Edit, 
	Trash2, 
	X, 
	Package, 
	Tag, 
	DollarSign, 
	Hash, 
	FileText,
	Image as ImageIcon,
	Save,
	RotateCcw
} from "lucide-react";

const CATEGORY_API = getBaseUrl() + "/api/categories";
const PRODUCT_API = getBaseUrl() + "/api/product";

const normalizeImageUrl = (url) => {
  if (!url) return "";
  // Remove any double slashes except after http(s):
  return url.replace(/([^:]\/)\/+/, "$1/");
};

const ProductCard = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Fetch categories
        const catRes = await fetch(CATEGORY_API, { headers });
        if (!catRes.ok) {
          // const errorText = await catRes.text();
          throw new Error(`Failed to fetch categories: ${catRes.status} ${catRes.statusText}`);
        }
        const catData = await catRes.json();
        if (!Array.isArray(catData) || catData.length === 0) {
          navigate("/category");
          return;
        }
        setCategories(catData);
        
        // Fetch product
        const prodRes = await fetch(`${PRODUCT_API}/${productId}`, { headers });
        if (!prodRes.ok) {
          // const errorText = await prodRes.text();
          throw new Error(`Failed to fetch product: ${prodRes.status} ${prodRes.statusText}`);
        }
        const prodData = await prodRes.json();
        setProduct(prodData);
        // Handle image URL properly and normalize
        setImagePreview(normalizeImageUrl(getFullImageUrl(prodData.imageUrl)));
        setForm({
          name: prodData.name || "",
          description: prodData.description || "",
          salePrice: prodData.salePrice || prodData.price || 0,
          purchasePrice: prodData.purchasePrice || 0,
          quantity: prodData.quantity || 0,
          categoryId: prodData.category?.categoryId || "",
        });
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Error loading data. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setSuccess("");
    setError("");
    setImageFile(null);
    // Handle image URL properly and normalize
    setImagePreview(normalizeImageUrl(getFullImageUrl(product?.imageUrl)));
    setForm({
      name: product.name || "",
      description: product.description || "",
      salePrice: product.salePrice || product.price || 0,
      purchasePrice: product.purchasePrice || 0,
      quantity: product.quantity || 0,
      categoryId: product.category?.categoryId || "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      
      // If there's an image to upload, handle it first
      let imageUrl = product?.imageUrl || "";
      if (imageFile) {
        try {
          imageUrl = await uploadProductImage(imageFile, productId);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
      }

      const res = await fetch(`${PRODUCT_API}/${productId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          salePrice: Number(form.salePrice),
          purchasePrice: Number(form.purchasePrice),
          quantity: Number(form.quantity),
          categoryId: form.categoryId,
          imageUrl,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to update product.");
        setUploading(false);
        return;
      }
      
      const updated = await res.json();
      setProduct(updated);
      setEditMode(false);
      setSuccess("Product updated successfully!");
      setImageFile(null);
    } catch (err) {
      console.error("Error saving product:", err);
      setError("An error occurred while saving. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${PRODUCT_API}/${productId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to delete product.");
        setLoading(false);
        return;
      }
      setLoading(false);
      if (onClose) onClose();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("An error occurred while deleting. Please try again.");
      setLoading(false);
    }
  };

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editMode ? "Edit Product" : "Product Details"}
                </h2>
                <p className="text-sm text-gray-600">
                  {editMode ? "Update product information" : "View and manage product"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                {success}
              </div>
            )}

            {editMode ? (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Product Image
                  </label>
                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-32 h-32 object-cover rounded-xl border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sale Price (ETB)
                    </label>
                    <input
                      name="salePrice"
                      type="number"
                      value={form.salePrice}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Purchase Price (ETB)
                    </label>
                    <input
                      name="purchasePrice"
                      type="number"
                      value={form.purchasePrice}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      value={form.quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Product Image */}
                {product.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={normalizeImageUrl(getBaseUrl().replace(/\/$/, '') + product.imageUrl)}
                      alt={product.name}
                      className="w-48 h-48 object-cover rounded-2xl border border-gray-200 shadow-lg"
                      onError={(e) => handleImageError(e, 'Image not available')}
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Product Name</p>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Tag className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-semibold text-gray-900">
                          {product.category?.name || "Uncategorized"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Hash className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-semibold text-gray-900">{product.quantity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sale Price</p>
                        <p className="font-semibold text-gray-900">
                          {product.salePrice || product.price} ETB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Purchase Price</p>
                        <p className="font-semibold text-gray-900">
                          {product.purchasePrice || 0} ETB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-semibold text-gray-900">
                          {product.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleEdit}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Product</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 