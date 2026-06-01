import SectionHeader from "./components/SectionHeader";
import LinkButton from "./components/LinkButton";
import { useEffect } from "react";
import Globe from "./Globe";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";

function Contact() {
    useEffect(() => {
        const cards = document.querySelectorAll(".card-cv, .card-instagram, .card-linkedin, .card-github, .card-gmail");

        const handleMouseMove = (e) => {
            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty("--x", `${e.clientX - rect.left}px`);
                card.style.setProperty("--y", `${e.clientY - rect.top}px`);
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
    return (
        <div className="contact">
            <div className="contact-content">
                <SectionHeader style={{ top: "0%" }}>
                    03 <span style={{ fontFamily: "KHInterferenceTRIAL", fontWeight: 400 }}>//</span>Contact
                </SectionHeader>

                <div className="contact-socials ">
                    <div
                        className="card-cv"
                        onClick={(event) => {
                            event.preventDefault();
                            window.location.href = "./cv.pdf";
                        }}
                    >
                        <div className="border-layer"></div>
                        <div className="content-wrapper">
                            <div className="content">
                                <p>Learn more</p>
                                <div className="hn-arrow-container">
                                    <div className="hn hn-arrow-up"></div>
                                </div>
                                <div className="footer">
                                    <i class="hn hn-paperclip"></i>
                                    <span>View CV</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="card-instagram"
                        onClick={(event) => {
                            event.preventDefault();
                            window.location.href = "https://www.instagram.com/thevin.silva/";
                        }}
                    >
                        <div className="border-layer"></div>
                        <div className="content-wrapper">
                            <div className="content">
                                <p>Follow</p>
                                <div className="hn-arrow-container">
                                    <div className="hn hn-arrow-up"></div>
                                </div>
                                <div className="footer">
                                    <i class="hn hn-instagram"></i>
                                    <span>Instagram</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="card-linkedin"
                        onClick={(event) => {
                            event.preventDefault();
                            window.location.href = "https://www.linkedin.com/in/thevinsilva/";
                        }}
                    >
                        <div className="border-layer"></div>
                        <div className="content-wrapper">
                            <div className="content">
                                <p>Connect</p>
                                <div className="hn-arrow-container">
                                    <div className="hn hn-arrow-up"></div>
                                </div>
                                <div className="footer">
                                    <i class="hn hn-linkedin"></i>
                                    <span>LinkedIn</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="break"></div>
                    <div
                        className="card-github"
                        onClick={(event) => {
                            event.preventDefault();
                            window.location.href = "https://github.com/ThevinSilva";
                        }}
                    >
                        <div className="border-layer"></div>
                        <div className="content-wrapper">
                            <div className="content">
                                <p>Contribute</p>
                                <div className="hn-arrow-container">
                                    <div className="hn hn-arrow-up"></div>
                                </div>
                                <div className="footer">
                                    <i class="hn hn-github"></i>
                                    <span>Github</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="card-gmail"
                        onClick={(event) => {
                            event.preventDefault();
                            window.location.href = "mailto:thevin.silva@gmail.com";
                        }}
                    >
                        <div className="border-layer"></div>
                        <div className="content-wrapper">
                            <div className="content">
                                <p>Say Hi</p>
                                <div className="hn-arrow-container">
                                    <div className="hn hn-arrow-up"></div>
                                </div>
                                <div className="footer">
                                    <i class="hn hn-google"></i>
                                    <span>thevin.silva@gmail.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="Globe">
                    <Globe />
                </div>
            </div>
        </div>
    );
}

export default Contact;
