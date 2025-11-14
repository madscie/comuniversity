  import { apiService } from "./apiService";

  class UploadService {
    async uploadImage(file) {
      return apiService.upload("/upload/image", file, "image");
    }

    async uploadFile(file) {
      return apiService.upload("/upload/file", file, "file");
    }
  }

  export const uploadService = new UploadService();
