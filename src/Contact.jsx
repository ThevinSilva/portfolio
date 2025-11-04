import React from "react";
import SectionHeader from "./components/SectionHeader";
import { useState } from "react";
import Globe from "./Globe";

function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log({ name, email, message });
    };

    return (
        <div className="contact">
            <div className="contact-content">
                <SectionHeader style={{ top: "0%" }}>
                    03 <span style={{ fontFamily: "KHInterferenceTRIAL", fontSize: "3rem", fontWeight: 400 }}>//</span>Contact
                </SectionHeader>
                <div className="Globe">
                    <Globe />
                </div>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label>Message:</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
}

export default Contact;
