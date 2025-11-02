import {  useEffect,useState } from "react";
import HeaderBar from "../HeaderBar/HeaderBar";
import ProfilePhotoField from "./ProfilePhotoField";
import EditInfoSection from './EditInfoSection';
import axios from "axios";

export default function UserSettings() {
  const userId = localStorage.getItem('userId');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/userinfo/${userId}`);
      setUserInfo(response.data);
      setPreviewImage(response.data.profilePicture || '/images/default-profile.png'); 
    } catch (err) {
      console.error("Failed to fetch user info", err);
    }
  };


  useEffect(() => {
    fetchUserInfo();
  }, []);

 const handleSave = async (formFields) => {

  try {
    const updateResponse = await axios.put(
      `http://localhost:5000/api/userinfo/${userId}`,
      formFields
    );

    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("image", selectedImageFile);
      formData.append("userId", userId);

      const uploadResponse = await axios.post(
        "http://localhost:5000/api/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (uploadResponse.data.success) {
        alert("Profile updated successfully!");
      } else {
        alert("Image upload failed");
      }
    } else {
      alert("Profile updated successfully!");
    }
    await fetchUserInfo();

  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Failed to update profile");
  }
};



  return (
    <div>
      <HeaderBar profilePicture = {localStorage.getItem('userProfileImage')}/>
      <ProfilePhotoField
        previewImage={previewImage || userInfo?.profilePicture}
        setPreviewImage={setPreviewImage}
        setSelectedImageFile={setSelectedImageFile}
        userInfo={userInfo}
      />
      <EditInfoSection onSave={handleSave} userInfo={userInfo} onCancel={fetchUserInfo}/>
    </div>
  );
}
