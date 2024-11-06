"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import ResolveModal from "@/components/ResolveModal";
import ReplyModal from "@/components/ReplyModal";

const Complaint = () => {
  const [user, setUser] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const wallet = useSelector((state) => state.wallet.wallet);
  const router = useRouter();
  const params = useParams();
  const fetchComplaintById = async () => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please login to access this page");
      router.push("/auth");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/complaint/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComplaint(data);
        toast.success("Complaint fetched successfully");
      } else {
        toast.error("Error fetching complaint");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Error fetching complaint");
    }
  };

  const accessComplaint = async () => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please login to access this page");
      router.push("/auth");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/access-complaint/${params.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        toast.success("Complaint accessed successfully");
        fetchComplaintById();
      } else {
        toast.error("Error accessing complaint");
      }
    } catch (error) {
      console.error("Error accessing complaints:", error);
      toast.error("Error accessing complaint");
    }
  };

  useEffect(() => {
    const userInfo = Cookies.get("user");
    if (!userInfo) {
      toast.error("Please login to access this page");
      router.push("/auth");
      return;
    }

    if (!wallet) {
      toast.error("Please connect wallet to access this page");
      return;
    }

    try {
      const parsedUser = JSON.parse(userInfo);
      accessComplaint();
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user info:", error);
      toast.error("Error parsing user information");
      router.push("/auth");
    }
  }, [wallet]);

  return (
    <div className="flex flex-col min-w-screen min-h-screen gap-6 items-center py-16 overflow-hidden">
      {complaint && (
        <>
          <div className="card mb-5 bg-base-100 shadow-xl">
            <div className="card-body">
              <p>Complainant: {complaint.complainant}</p>
              <p>Description: {complaint.description}</p>
              <p>
                Status:{" "}
                {complaint.status == 0 ? (
                  <div className="badge badge-warning">pending</div>
                ) : (
                  <div className="badge badge-success gap-2">resolved</div>
                )}
              </p>
            </div>
          </div>
          {complaint.status == 0 && user.isAdmin && (
            <ResolveModal complaintId={params.id} />
          )}
          <div className="flex flex-col my-4 items-center justify-center">
            <h2>Files Attached</h2>
            <p>File Name: {complaint.file.name}</p>
            {/* <Viewer fileUrl={`${process.env.PINATA_GATEWAY}/ipfs/${complaint.ipfsHash}`} /> */}
            <div className="min-w-screen min-h-screen lg:min-w-[700px] lg:min-h-[600px] flex items-center justify-center">
              <embed
                src={`${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${complaint.file.ipfsHash}?pinataGatewayToken=${process.env.NEXT_PUBLIC_PINATA_TOKEN}`}
                type="application/pdf"
                width="100%"
                height="600px"
              />
            </div>
          </div>
          <div className="flex flex-col my-4 items-center justify-center">
            <h2>Actions</h2>
            {complaint.transactions.length > 0 ? (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Accessor</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {complaint.transactions.map((transaction) => (
                    <tr>
                      <td>{transaction.accessor}</td>
                      <td>{new Date(transaction.timestamp * 1000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No transactions found</p>
            )}
          </div>
          <ReplyModal complaintId={params.id} />
          <div className="flex flex-col my-4 items-center justify-center">
            <h2>Replies</h2>
            {complaint.replies.length > 0 ? (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Reply</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {complaint.replies.map((transaction) => (
                    <tr>
                      <td>{transaction.senderAddress}</td>
                      <td>{transaction.reply}</td>
                      <td>{new Date(transaction.timestamp * 1000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No replies found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Complaint;
