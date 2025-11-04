import Spinner from "./svgs/Spinner";
import CheckBoard from "./svgs/CheckBoard";
import BarCode from "./svgs/Barcode";
import Role from "./Role";
import { useState, useEffect } from "react";
import { DateTime } from "luxon";

function InfoBar(props) {
    const [time, setTime] = useState(DateTime.now().setZone("gmt").toISOTime().substring(0, 5));

    useEffect(() => {
        setInterval(() => setTime(DateTime.now().setZone("gmt").toISOTime().substring(0, 5)), 100);
    }, []);

    return (
        <div className="info-bar" {...props}>
            <div className="info-bar-item">
                <span className="clock">{time}</span>
            </div>
            <BarCode id={"barcode"} />
            <Spinner className="spinner" />
            <div className="info-bar-item">
                <Role />
            </div>
            <CheckBoard id={"checkboard"} />
        </div>
    );
}

export default InfoBar;
