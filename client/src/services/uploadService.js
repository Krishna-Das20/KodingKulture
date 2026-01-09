import api from './authService';

const uploadService = {
    // Upload image to server (which uploads to Cloudinary)
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Delete image from Cloudinary
    deleteImage: async (publicId) => {
        const response = await api.delete(`/upload/image/${encodeURIComponent(publicId)}`);
        return response.data;
    },

    // Check if upload is configured
    getUploadStatus: async () => {
        const response = await api.get('/upload/status');
        return response.data;
    }
};

export default uploadService;
