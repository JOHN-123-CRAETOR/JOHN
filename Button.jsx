
import React, { useState, useRef, useEffect } from "react";

const CLICK_ACHIEVEMENTS = [5, 10, 20];

function Button() {
    const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem("users")) || {});
    const [currentUser, setCurrentUser] = useState("");
    const [inputName, setInputName] = useState("");
    const [theme, setTheme] = useState("light");
    const [timer, setTimer] = useState(0);
    const [disabled, setDisabled] = useState(false);
    const [clock, setClock] = useState(new Date());
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const [achievement, setAchievement] = useState("");

    // Live clock
    useEffect(() => {
        const interval = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Timer for cooldown
    useEffect(() => {
        if (timer > 0) {
            timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
        } else if (timer === 0 && disabled) {
            setDisabled(false);
            updateUser(currentUser, { count: 0, clickTimes: [] });
        }
        return () => clearTimeout(timerRef.current);
    }, [timer, disabled]);

    // Save users to localStorage
    useEffect(() => {
        localStorage.setItem("users", JSON.stringify(users));
    }, [users]);

    // Theme switching
    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    function updateUser(name, updates) {
        setUsers(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                ...updates,
            }
        }));
    }

    const handleLogin = () => {
        if (!inputName) return;
        if (!users[inputName]) {
            setUsers(prev => ({
                ...prev,
                [inputName]: { count: 0, clickTimes: [] }
            }));
        }
        setCurrentUser(inputName);
        setInputName("");
        setAchievement("");
    };

    const handleClick = () => {
        if (!currentUser) {
            alert("Please log in first!");
            return;
        }
        const user = users[currentUser] || { count: 0, clickTimes: [] };
        const newCount = user.count + 1;
        const newClickTimes = [...user.clickTimes, new Date().toLocaleTimeString()];

        // Play sound
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }

        updateUser(currentUser, { count: newCount, clickTimes: newClickTimes });

        // Achievements
        if (CLICK_ACHIEVEMENTS.includes(newCount)) {
            setAchievement(`🎉 Achievement: ${newCount} clicks!`);
        } else {
            setAchievement("");
        }

        if (newCount >= 10) {
            setDisabled(true);
            setTimer(10);
            alert(`Button disabled for 10 seconds, ${currentUser}!`);
        }
    };

    const handleReset = () => {
        if (!currentUser) return;
        updateUser(currentUser, { count: 0, clickTimes: [] });
        setDisabled(false);
        setTimer(0);
        setAchievement("");
    };

    const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

    const user = users[currentUser] || { count: 0, clickTimes: [] };

    return (
        <div style={{
            background: theme === "light" ? "#fff" : "#222",
            color: theme === "light" ? "#222" : "#fff",
            minHeight: "100vh",
            padding: 24,
            transition: "background 0.3s, color 0.3s"
        }}>
            <audio ref={audioRef} src="https://www.soundjay.com/buttons/sounds/button-16.mp3" />
            <h2>Complex Button App</h2>
            <div>
                <button onClick={toggleTheme}>
                    Switch to {theme === "light" ? "Dark" : "Light"} Mode
                </button>
            </div>
            <div style={{ margin: "16px 0" }}>
                <strong>Current Time:</strong> {clock.toLocaleTimeString()}
            </div>
            {!currentUser ? (
                <div>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={inputName}
                        onChange={e => setInputName(e.target.value)}
                    />
                    <button onClick={handleLogin}>Login</button>
                </div>
            ) : (
                <div>
                    <div>
                        <strong>User:</strong> {currentUser}
                        <button style={{ marginLeft: 8 }} onClick={() => setCurrentUser("")}>
                            Logout
                        </button>
                    </div>
                    <button
                        onClick={handleClick}
                        disabled={disabled}
                        style={{
                            margin: "12px 0",
                            padding: "12px 24px",
                            fontSize: "1.2em",
                            background: disabled ? "#aaa" : "#4caf50",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: disabled ? "not-allowed" : "pointer",
                            boxShadow: disabled ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
                            transition: "background 0.2s, box-shadow 0.2s",
                            transform: disabled ? "scale(1)" : "scale(1.03)"
                        }}
                    >
                        {disabled ? (timer > 0 ? `Wait ${timer}s` : "Disabled") : "Click me"}
                    </button>
                    <button onClick={handleReset} style={{ marginLeft: 8 }}>
                        Reset
                    </button>
                    {achievement && (
                        <div style={{ color: "#ff9800", margin: "8px 0" }}>{achievement}</div>
                    )}
                    <div>
                        <strong>Click count:</strong> {user.count}
                    </div>
                    <div>
                        <strong>Click log:</strong>
                        <ul>
                            {user.clickTimes.map((entry, idx) => (
                                <li key={idx}>{entry}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Button;
