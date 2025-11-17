import BorderAnimatedBox from "./BorderAnimation";
import getLanguageDistribution from "../api/getLanguageDistribution";
import { useEffect } from "react";

export default function LangDistribution() {
    useEffect(() => {
        getLanguageDistribution("ThevinSilva").then((data) => console.log(data));
    }, []);

    return (
        <BorderAnimatedBox borders={{ top: true, right: false, bottom: false, left: false }} className="lang">
            LangDistribution
        </BorderAnimatedBox>
    );
}
