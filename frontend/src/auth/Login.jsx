// src/Login.jsx
import { Link } from "react-router-dom";
// 1. Import React and useState from React library
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 2. Functional component definition
function Login() {
    // 3. State for email, password, selected role
    const [email, setEmail] = useState("");        // starts as empty string
    const [password, setPassword] = useState("");  // starts as empty string
    const [role, setRole] = useState("patient");   // default selected role
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // 4. Called when user clicks on Doctor / Receptionist / Patient button
    const handleRoleClick = (newRole) => {
        // newRole is a string: "doctor", "receptionist" or "patient"
        setRole(newRole); // update state, React will re-render with new selected role
    };

    // 5. Called when user clicks Login button or presses Enter
    const handleSubmit = (event) => {
        event.preventDefault(); // stop page refresh

        // simple check: all fields must be filled
        if (!email || !password) {
            setError("Please enter both email and password.");
            return; // stop here, don't continue
        }

        // clear any old error
        setError("");

        // send data to backend
        fetch("http://localhost:3001/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    // backend sent an error like 401
                    const errData = await res.json();
                    setError(errData.message || "Login failed");
                    return;
                }

                // success: get user data
                const data = await res.json();

                // IMPORTANT: check role match here
                if (data.role !== role) {
                    setError("Invalid Credentials");
                    return;
                }

                // REDIRECT BASED ON ROLE
                if (data.role === "admin") {
                    navigate("/admin-dashboard");
                } else if (data.role === "doctor") {
                    navigate("/doctor-dashboard");
                } else if (data.role === "receptionist") {
                    navigate("/reception-dashboard");
                } else if (data.role === "patient") {
                    navigate("/patient-dashboard");
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Network error: backend not responding");
            });
    };

    // 6. JSX: describes what UI should look like
    return (
        // Outer div: full-screen center alignment
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f7fb",
            }}
        >
            {/* White card in center */}
            <div
                style={{
                    width: "380px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    padding: "24px 28px",
                }}
            >
                {/* Title */}
                <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h3>

                {/* Form wrapper: so Enter key triggers submit */}
                <form onSubmit={handleSubmit}>
                    {/* Email field */}
                    <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>
                            Username or Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}                         // value comes from state
                            onChange={(e) => setEmail(e.target.value)} // update state on typing
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                            }}
                        />
                    </div>

                    {/* Password field */}
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                            }}
                        />
                    </div>

                    {/* Role buttons row */}
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "16px",
                            justifyContent: "space-between",
                        }}
                    >
                        {/* Doctor button */}
                        <button
                            type="button"
                            onClick={() => handleRoleClick("doctor")}
                            style={{
                                flex: 1,
                                padding: "6px 0",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "14px",
                                backgroundColor: role === "doctor" ? "#0d6efd" : "#6c757d",
                                color: "white",
                            }}
                        >
                            Doctor
                        </button>

                        {/* Receptionist button */}
                        <button
                            type="button"
                            onClick={() => handleRoleClick("receptionist")}
                            style={{
                                flex: 1,
                                padding: "6px 0",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "14px",
                                backgroundColor: role === "receptionist" ? "#0d6efd" : "#6c757d",
                                color: "white",
                            }}
                        >
                            Receptionist
                        </button>

                        {/* Patient button */}
                        <button
                            type="button"
                            onClick={() => handleRoleClick("patient")}
                            style={{
                                flex: 1,
                                padding: "6px 0",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "14px",
                                backgroundColor: role === "patient" ? "#0d6efd" : "#6c757d",
                                color: "white",
                            }}
                        >
                            Patient
                        </button>
                    </div>

                    {/* Admin login button (separate row) */}
                    <div
                        style={{
                            display: "flex",
                            marginBottom: "16px",
                            justifyContent: "center",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setRole("admin")}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "14px",
                                backgroundColor: role === "admin" ? "#0d6efd" : "#6c757d",
                                color: "white",
                            }}
                        >
                            Admin Login
                        </button>
                    </div>

                    {/* Login button */}
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "8px 0",
                            backgroundColor: "#0d6efd",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "15px",
                            cursor: "pointer",
                            marginBottom: "8px",
                        }}
                    >
                        Login
                    </button>

                    {/* Error text - only shown when error is not empty */}
                    {error && (
                        <div
                            style={{
                                color: "red",
                                fontSize: "13px",
                                textAlign: "center",
                                marginBottom: "8px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Small links under form (just UI for now) */}
                    <div style={{ textAlign: "center", fontSize: "12px", marginTop: "8px" }}>
                        <Link to="/signup" style={{ color: "blue" }}>
                            Don't have an account? Signup
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

// 7. Export component so App.jsx can use it
export default Login;
