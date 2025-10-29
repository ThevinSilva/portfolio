import React from "react";
import SectionHeader from "./components/SectionHeader";
import Dither from "./components/Dither";

function Contact() {
    return (
        <div className={"contact"}>
            <SectionHeader>
                03 <span style={{ fontFamily: "KHInterferenceTRIAL", fontSize: "3rem", fontWeight: 400 }}>//</span>Contact
            </SectionHeader>
            <Dither />
        </div>
    );
}

export default Contact;
