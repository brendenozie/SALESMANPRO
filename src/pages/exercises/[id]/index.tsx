import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EditExercise() {
  const router = useRouter();
  const { id } = router.query;

  const [exercise, setExercise] = useState(null);
  const [exName, setExName] = useState('');
  const [exDesc, setExDesc] = useState('');
  const [newPic, setNewPic] = useState<File | null>(null);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Uploading state
  const [uploadProgress, setUploadProgress] = useState<number>(0); // Progress state
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Handle image file selection and preview URL
  const handleImageChange = (e:any) => {
    const file = e.target.files[0];
    setNewPic(file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreviewUrl(imageUrl);
    }
  };

  // Handle video file selection and preview URL
  const handleVideoChange = (e:any) => {
    const file = e.target.files[0];
    setNewVideo(file);
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(videoUrl);
    }
  };

  // Cleanup object URLs on component unmount or file change
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [imagePreviewUrl, videoPreviewUrl]);

  useEffect(() => {
    if (id) {
      const fetchExercise = async () => {
        const res = await fetch(`/api/get-exercise/${id}`);
        const data = await res.json();
        setExercise(data);
        setExName(data.exName);
        setExDesc(data.exDesc);
        setImagePreviewUrl(data.exPic);
        setVideoPreviewUrl(data.exVideo);
      };
      fetchExercise();
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsUploading(true); // Start uploading indicator
    setUploadProgress(0); // Reset progress bar

    let newPicUrl = null;
    let newVideoUrl = null;

    // Upload image if selected
    if (newPic) {
      newPicUrl = await uploadFile(newPic, "image");
    }

    // Upload video if selected
    if (newVideo) {
      newVideoUrl = await uploadFile(newVideo, "video");
    }

    // Prepare form data for exercise update
    const formData = {
      exName,
      exDesc,
      exPic:newPicUrl,
      exVideo:newVideoUrl,
    };

    // Send the PUT request to update exercise
    const res = await fetch(`/api/get-exercise/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    setIsUploading(false); // Stop uploading indicator

    if (res.ok) {
      router.push('/exercises');
    }
  };

  // Function to upload files to the backend or external storage
  const uploadFile = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.url; // URL to the uploaded file
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-r from-gray-100 to-blue-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Edit Exercise</h1>

      <form
        onSubmit={handleUpdate}
        className="max-w-lg mx-auto bg-white shadow-2xl rounded-lg p-8 space-y-6 transition-all duration-500 transform hover:shadow-md"
      >
        <div>
          <label
            htmlFor="exerciseName"
            className="block mb-2 text-lg font-medium text-gray-800"
          >
            Exercise Name
          </label>
          <input
            id="exerciseName"
            type="text"
            value={exName}
            onChange={(e) => setExName(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-sm hover:shadow-lg"
            required
            aria-label="Exercise Name"
          />
        </div>

        <div>
          <label
            htmlFor="exerciseDescription"
            className="block mb-2 text-lg font-medium text-gray-800"
          >
            Exercise Description
          </label>
          <textarea
            id="exerciseDescription"
            value={exDesc}
            onChange={(e) => setExDesc(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-sm hover:shadow-lg"
            rows={4}
            required
            aria-label="Exercise Description"
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label
            htmlFor="imageUpload"
            className="block mb-2 text-lg font-medium text-gray-800"
          >
            Upload New Image
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-sm hover:shadow-lg"
            aria-label="Upload New Image"
          />
          {/* Display existing or newly uploaded image */}
          {imagePreviewUrl && (
            <img
              src={imagePreviewUrl}
              alt="Exercise Image"
              className="mt-4 w-full h-auto rounded-lg border border-gray-200 shadow-md"
            />
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label
            htmlFor="videoUpload"
            className="block mb-2 text-lg font-medium text-gray-800"
          >
            Upload New Video
          </label>
          <input
            id="videoUpload"
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-sm hover:shadow-lg"
            aria-label="Upload New Video"
          />
          {/* Display existing or newly uploaded video */}
          {videoPreviewUrl && (
            <video
              src={videoPreviewUrl}
              controls
              className="mt-4 w-full h-auto rounded-lg border border-gray-200 shadow-md"
            ></video>
          )}
        </div>

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="text-blue-500 text-center">
            <div className="relative w-full bg-gray-200 rounded-lg h-4 overflow-hidden">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-green-400"
              ></div>
            </div>
            <p className="mt-2 text-sm">Uploading... {uploadProgress}%</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-5 py-3 rounded-lg hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-md transition-all duration-300 transform hover:scale-105"
        >
          {isUploading ? "Updating..." : "Update Exercise"}
        </button>
      </form>
    </div>

  );
}
