import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Login = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {axios, setToken} = useAppContext()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = state === "login" ? '/api/user/login' : '/api/user/register'

    try {
      const {data} = await axios.post(url, {name, email, password})
      if(data.success){
        setToken(data.token)
        localStorage.setItem('token', data.token)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }

  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 items-start p-8 py-12 w-80 sm:w-[360px] rounded-2xl shadow-2xl border
                 bg-white border-gray-200 text-gray-700
                 dark:bg-[#1e0f2e] dark:border-purple-800/50 dark:text-gray-200"
    >
      {/* Title */}
      <p className="text-2xl font-semibold w-full text-center">
        <span className="text-purple-600 dark:text-purple-400">Askio</span>GPT{" "}
        {state === "login" ? "Login" : "Sign Up"}
      </p>

      {/* Name field (register only) */}
      {state === "register" && (
        <div className="w-full">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Your full name"
            className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors
                       border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-purple-500
                       dark:border-purple-700/60 dark:bg-[#2a1a40] dark:text-white dark:placeholder:text-white/30 dark:focus:border-purple-400"
            type="text"
            required
          />
        </div>
      )}

      {/* Email field */}
      <div className="w-full">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors
                     border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-purple-500
                     dark:border-purple-700/60 dark:bg-[#2a1a40] dark:text-white dark:placeholder:text-white/30 dark:focus:border-purple-400"
          type="email"
          required
        />
      </div>

      {/* Password field */}
      <div className="w-full">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="••••••••"
          className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors
                     border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-purple-500
                     dark:border-purple-700/60 dark:bg-[#2a1a40] dark:text-white dark:placeholder:text-white/30 dark:focus:border-purple-400"
          type="password"
          required
        />
      </div>

      {/* Toggle login / register */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {state === "register" ? (
          <>Already have an account?{" "}
            <span onClick={() => setState("login")} className="text-purple-600 dark:text-purple-400 cursor-pointer hover:underline">
              Log in
            </span>
          </>
        ) : (
          <>Don't have an account?{" "}
            <span onClick={() => setState("register")} className="text-purple-600 dark:text-purple-400 cursor-pointer hover:underline">
              Sign up
            </span>
          </>
        )}
      </p>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full py-2.5 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors cursor-pointer"
      >
        {state === "register" ? "Create Account" : "Login"}
      </button>
    </form>
  );
};

export default Login;
