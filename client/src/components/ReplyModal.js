import React, { useEffect } from "react";
import { useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const ReplyModal = ({ complaintId }) => {
  const [token, setToken] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleReplyComplaint = async (e) => {
    e.preventDefault();
    const requestBody = {
      replyText: replyText,
    };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/reply-complaint/${complaintId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (response.ok) {
        toast.success("Replied successfully");
        document.getElementById("my_modal_6").close();
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
        onClick={() => document.getElementById("my_modal_6").showModal()}
      >
        Reply Complaint
      </button>
      <dialog id="my_modal_6" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Reply Complaint</h3>
          <div className="form-control">
            <label className="label">
              Reply
              <input
                className="input input-bordered"
                placeholder="Reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></input>
            </label>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById("my_modal_6").close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                onClick={handleReplyComplaint}
              >
                Reply
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ReplyModal;
