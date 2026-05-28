import BorderAnimatedBox from "./BorderAnimation";
import getLanguageDistribution from "../api/getLanguageDistribution";
import { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";

export default function LangDistribution() {
    const [languages, setLanguages] = useState([]);

    useEffect(() => {
        getLanguageDistribution("thevinsilva").then((data) =>
            setLanguages(
                Object.keys(data)
                    .map((x) => {
                        return {
                            name: x,
                            value: data[x],
                        };
                    })
                    .sort((a, b) => b.value - a.value),
            ),
        );

        console.log(languages);
    }, []);

    return (
        <BorderAnimatedBox borders={{ top: true, right: false, bottom: false, left: false }} className="languageDistribution">
            {languages.length > 0 ? languages.map((lang) => <ProgressBar fillPercentage={lang.value / 100} name={lang.name} />) : <div> loading</div>}

            {/* <ProgressBar /> */}
        </BorderAnimatedBox>
    );
} 
