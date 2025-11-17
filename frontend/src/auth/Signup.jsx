import { Link } from "react-router-dom";
import React, { useState } from "react";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            setError("All fields are required.");
            return;
        }

        setError("");
        setSuccess("");

        // call backend signup API
        fetch("http://localhost:3001/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json();
                    setError(errData.message || "Signup failed");
                    return;
                }

                const data = await res.json();

                setSuccess("Signup successful! You can now login.");
                // optional: clear fields
                setName("");
                setEmail("");
                setPassword("");
            })
            .catch((err) => {
                console.error(err);
                setError("Network error: backend not responding");
            });
    };


    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f7fb",
        }}>
            <div style={{
                width: "380px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                padding: "24px 28px",
            }}>
                <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Patient Signup</h3>

                <form onSubmit={handleSignup}>

                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Enter full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                    />

                    {error && (
                        <p style={{ color: "red", fontSize: "13px" }}>{error}</p>
                    )}

                    {success && (
                        <p style={{ color: "green", fontSize: "13px" }}>{success}</p>
                    )}

                    <button type="submit" style={btnStyle}>
                        Signup
                    </button>

                    <div style={{ textAlign: "center", fontSize: "12px", marginTop: "10px" }}>
                        <Link to="/" style={{ color: "blue" }}>
                            Already have an account? Login
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
};

const btnStyle = {
    width: "100%",
    padding: "8px",
    backgroundColor: "#198754",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "8px",
};

export default Signup;
