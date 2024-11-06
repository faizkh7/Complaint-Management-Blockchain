import React, { useEffect } from "react";
import { useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const ResolveModal = ({ complaintId }) => {
  const [token, setToken] = useState(null);

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/resolve-complaint/${complaintId}`,
        {
          method: "POST",
          contentType: "application/json",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        toast.success("Complaint resolved successfully");
        document.getElementById("my_modal_5").close();
        onComplaintCreated();
      } else {
        toast.error("Error resolving complaint");
      }
    } catch (error) {
      console.error("Error resolving complaint:", error);
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    setToken(token);
  }, []);

  return (
    <div className="flex flex-row relative w-screen px-10 py-5">
      <button
        className="btn absolute right-10 top-0 btn-secondary"
        onClick={() => document.getElementById("my_modal_5").showModal()}
      >
        Resolve Complaint
      </button>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Resolve Complaint</h3>
          <p className="text-sm">
            Do you want to finally close this complaint?
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn" onClick={handleResolveComplaint}>
                Yes
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ResolveModal;
