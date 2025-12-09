import SectionHeader from "./components/SectionHeader";
import LinkButton from "./components/LinkButton";
import { useState } from "react";
import Globe from "./Globe";

function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");



    return (
        <div className="contact">
            <div className="contact-content">
                <SectionHeader style={{ top: "0%" }}>
                    03 <span style={{ fontFamily: "KHInterferenceTRIAL", fontWeight: 400 }}>//</span>Contact
                </SectionHeader>

                <form className="contact-form">
                    <div className="contact-socials ">
                        <LinkButton style={{ width: "100%", height: "10%" }}>Instagram</LinkButton>
                        <LinkButton style={{ width: "100%", height: "10%" }}>Youtube</LinkButton>
                        <LinkButton style={{ width: "100%", height: "10%" }}>Twitch</LinkButton>
                        <LinkButton style={{ width: "100%", height: "10%" }}>Github</LinkButton>
                    </div>

                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label>Message:</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
                    <LinkButton style={{ width: "100%", height: "10%" }}>Send</LinkButton>
                </form>
                <div className="Globe">
                    <Globe />
                </div>
            </div>
        </div>
    );
}

export default Contact;
