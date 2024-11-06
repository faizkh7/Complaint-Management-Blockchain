"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import { setWallet } from "@/app/slices/walletSlice";
import { Web3 } from "web3";
import { toast } from "react-toastify";

const Navbar = () => {
  const wallet = useSelector((state) => state.wallet.wallet);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  const handleWalletConnect = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      console.log(accounts[0]);
      dispatch(setWallet(accounts[0]));
      toast.success("Wallet connected successfully");
    } else {
      toast.error("Please download metamask");
    }
  };

  const copyToKeyboard = () => {
    navigator.clipboard.writeText(wallet);
    toast.success("Wallet address copied to clipboard");
  };

  useEffect(() => {
    console.log("Updated wallet:", wallet);
    setUser(Cookies.get("user"));
  }, [wallet]);

  const handleLogout = () => {
    Cookies.remove("user");
    toast.success("Logged out successfully");
    window.location.reload();
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {user ? (
              user.isAdmin ? (
                <li>
                  <Link href="/dashboard">Dashboard</Link>
                </li>
              ) : (
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
              )
            ) : (
              <li>
                <Link href="/auth">Login</Link>
              </li>
            )}

            {user && (
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Resolvio
        </Link>
      </div>
      <div className="navbar-end">
        {wallet ? (
          <div
            className="btn btn-primary max-w-[150px]"
            onClick={copyToKeyboard}
          >
            <p className="text-lg overflow-hidden text-ellipsis">{wallet}</p>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleWalletConnect}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
