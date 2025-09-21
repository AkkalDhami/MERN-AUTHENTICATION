import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetuserProfileQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} from "../../features/auth/authApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheckIcon, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const navigate = useNavigate();

  const [logout] = useLogoutMutation();
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

  const {
    data,
    isLoading: isProfileLoading,
    error: profileError,
  } = useGetuserProfileQuery();

  if (profileError) {
    toast.error(profileError?.error || profileError?.data?.message);
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // States for editable fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || "");
      setRole(data.user.role || "");
      setBio(data.user.bio || "");
      setTwoFA(data.user.is2FAEnabled || false);
      setPreviewImage(data.user.avatar?.url || "");
    }
  }, [data]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    logout();
    navigate("/login");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("bio", bio);
    formData.append("is2FAEnabled", twoFA);
    console.log(selectedImage);
    if (selectedImage) formData.append("avatar", selectedImage);

    try {
      const res = await updateProfile(formData).unwrap();
      console.log(res);
      if (!res?.success) return toast.error(res?.message);
      toast.success(res?.message || "Profile updated successfully!");

      // Reset form fields
      setName("");
      setRole("");
      setBio("");
      setTwoFA(false);
      setSelectedImage(null);
      setPreviewImage("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin" /> Loading....
      </div>
    );
  }

  if (error) {
    toast.error(error?.error || error?.data?.message);
  }

  return (
    <div className="w-full max-w-3xl rounded-2xl p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome {data?.user?.name}</h1>
      </div>

      {data?.user ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center flex-col gap-3">
              <Avatar className="w-20 h-20 ring-4 ring-green-400 shadow-md">
                <AvatarImage src={previewImage || ""} alt="User Avatar" />
                <AvatarFallback className="bg-gray-800 text-white text-2xl">
                  {name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {data?.user?.isEmailVerified ? (
                <Badge variant="default" className={"bg-green-500"}>
                  <BadgeCheckIcon /> Verified
                </Badge>
              ) : (
                <Badge variant="destructive" className={""}>
                  Not Verified
                </Badge>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="text-gray-500 mt-1">{bio || "No bio available"}</p>
              <span className="inline-block mt-2 px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full capitalize">
                {role}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl shadow-inner">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Email</span>
              <span className="text-gray-900 font-semibold">
                {data.user.email}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Last Login</span>
              <span className="text-gray-900 font-semibold">
                {data?.user?.lastLogin &&
                  new Date(data.user?.lastLogin).toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Bio</span>
              <span className="text-gray-900 font-semibold">{bio || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Role</span>
              <span className="text-gray-900 font-semibold capitalize">
                {role}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div className="flex gap-4">
              <Button onClick={() => navigate("/change-password")}>
                Change Password
              </Button>
              {!data?.user?.isEmailVerified && (
                <Button
                  className={"bg-green-500 hover:bg-green-600"}
                  onClick={() => navigate("/email-verify")}
                >
                  Verify Your Email
                </Button>
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg">
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid mt-3 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Bio"
                          name="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="resize-none"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="avatar">Avatar</Label>
                        <Input
                          id="avatar"
                          name="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <Avatar className="rounded-md w-16 h-16">
                          <AvatarImage alt="avatar" src={previewImage || ""} />
                          <AvatarFallback>
                            {name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="twoFA"
                          checked={twoFA}
                          onCheckedChange={(checked) => setTwoFA(!!checked)}
                        />
                        <Label htmlFor="twoFA">Is 2FA enabled</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save changes"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xl font-semibold">No user data found.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Profile;
