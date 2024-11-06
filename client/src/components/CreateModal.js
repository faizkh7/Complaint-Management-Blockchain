import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const CreateModal = ({onComplaintCreated}) => {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(null);

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("description", description);
    formData.append("fileName", file.name);
    formData.append("file", file);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/complaint`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          contentType: "multipart/form-data",
          body: formData,
        }
      );
      if (response.ok) {
        toast.success("Complaint raised successfully");
        document.getElementById("my_modal_5").close();
        onComplaintCreated();
      } else {
        toast.error("Error raising complaint");
      }
    } catch (error) {
      console.error("Error creating complaint:", error);
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
        Raise Complaint
      </button>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Raise Complaint</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <input
              type="text"
              placeholder="Description"
              className="input input-bordered"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Support Documents</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn" onClick={handleCreateComplaint}>
                Submit
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CreateModal;
