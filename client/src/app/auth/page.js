"use client";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const AuthForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");

  const walletAddress = useSelector((state) => state.wallet.wallet);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSwitchForm = () => {
    setIsLogin(!isLogin);
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Logging in with email:", email, "and password:", password);

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/login`;

    const requestBody = {
      email: email,
      password: password,
    };

    if(!walletAddress) {
      toast.error("Please connect your wallet to login", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      console.log("API Response:", data);

      const { user, token } = data;

      toast.success("Login successful!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      const now = new Date();
      const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      Cookies.set("token", token, { expires: expiryDate, path: "/" });
      Cookies.set("user", JSON.stringify(user), { expires: expiryDate, path: "/" });
      if(user.isAdmin) {
        router.push("/dashboard");
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error occurred during API request:", error);
      toast.error("Login failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    console.log(
      "Signing up with name:",
      name,
      "email:",
      email,
      "and password:",
      password
    );

    if (!walletAddress) {
      toast.error("Please connect your wallet to signup", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/register`;

    const requestBody = {
      name: name,
      email: email,
      password: password,
      isAdmin: userType === "admin",
      walletAddress: walletAddress,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      console.log("API Response:", data);

      toast.success("Signup successful!Login to Continue", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error occurred during API request:", error);
      toast.error("SignUp failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="flex flex-col bg-base-200 relative min-h-screen items-center justify-center">
      <div className="card min-w-[300px] lg:min-w-[600px] bg-base-100 p-8">
        {isLogin ? (
          <div className="card-body">
            <h2 className="card-title text-center text-base-800 mb-4">Login</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label-text">Email:</label>
                <input
                  className="input input-bordered w-full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label-text">Password:</label>
                <input
                  className="input input-bordered w-full"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-control flex items-center">
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mr-2"
                    checked={showPassword}
                    onChange={handleShowPassword}
                  />
                  Show Password
                </label>
              </div>
              <button className="btn btn-active btn-primary w-full">
                Login
              </button>
            </form>
            <div className="mt-4">
              <button
                className="btn btn-active btn-secondary w-full"
                onClick={handleSwitchForm}
              >
                Switch to Signup
              </button>
            </div>
          </div>
        ) : (
          <div className="card-body">
            <h2 className="card-title text-center text-base mb-4">Signup</h2>
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label-text">Name:</label>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label-text">Email:</label>
                <input
                  className="input input-bordered w-full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label-text">Password:</label>
                <input
                  className="input input-bordered w-full"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label-text">User Type:</label>
                <div className="flex items-center">
                  <div className="flex items-center gap-4 mr-6">
                    <input
                      type="radio"
                      value="user"
                      className="radio radio-primary"
                      checked={userType === "user"}
                      onChange={handleUserTypeChange}
                    />
                    User
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      value="admin"
                      className="radio radio-primary"
                      checked={userType === "admin"}
                      onChange={handleUserTypeChange}
                    />
                    Admin
                  </div>
                </div>
              </div>
              <div className="form-control flex items-center">
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mr-2"
                    checked={showPassword}
                    onChange={handleShowPassword}
                  />
                  Show Password
                </label>
              </div>
              <button className="btn btn-active btn-primary w-full">
                Signup
              </button>
            </form>
            <div className="mt-4">
              <button
                className="btn btn-active btn-secondary w-full"
                onClick={handleSwitchForm}
              >
                Switch to Login
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AuthForm;
