"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userComplaints, setUserComplaints] = useState([]);
  const router = useRouter();

  const fetchUserComplaints = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please login to access this page");
      router.push("/auth");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/unresolved-complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserComplaints(data);
      } else {
        toast.error("Error fetching complaints");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Error fetching complaints");
    }
  }, []);

  useEffect(() => {
    const userInfo = Cookies.get("user");
    if (!userInfo) {
      toast.error("Please login to access this page");
      router.push("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      fetchUserComplaints();
    } catch (error) {
      console.error("Error parsing user info:", error);
      toast.error("Error parsing user information");
      router.push("/auth");
    }
  }, [fetchUserComplaints]);

  const handleComplaintCreated = () => {
    fetchUserComplaints();
  };

  return (
    <div className="flex flex-col min-w-screen min-h-screen gap-6 items-center py-16 overflow-hidden">
      {user && (
        <>
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {user.name}
                <div className="badge badge-primary">
                  {user.isAdmin ? `Admin` : `User`}
                </div>
              </h2>
              <p>{user.email}</p>
            </div>
          </div>
          <ToastContainer />
          {userComplaints.length > 0 ? (
            <>
              <h1 className="text-2xl">Unresolved Complaints</h1>
              <div className="overflow-x-auto min-w-screen px-10">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Complainant</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>File</th>
                      <th>Timestamp</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* map over the JSON array and create rows */}
                    {userComplaints.map((item, index) => (
                      <tr key={index}>
                        <td>{item.id}</td>
                        <td>{item.complainant}</td>
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.description}
                        </td>
                        <td>
                          {item.status === 0 ? (
                            <div className="badge badge-warning">pending</div>
                          ) : (
                            <div className="badge badge-success gap-2">
                              resolved
                            </div>
                          )}
                        </td>
                        <td>{item.file.name}</td>
                        <td>
                          {new Date(item.timestamp * 1000).toLocaleString()}
                        </td>{" "}
                        <td>
                          <Link href={`/complaint/` + item.id} className="btn">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <h1 className="text-2xl">No unresolved complaints</h1>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
