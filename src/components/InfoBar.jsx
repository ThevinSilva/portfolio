import Spinner from "./svgs/Spinner";
import CheckBoard from "./svgs/CheckBoard";
import BarCode from "./svgs/Barcode";
import Role from "./Role";
import { useState, useEffect } from "react";
import { DateTime } from "luxon";

function InfoBar() {
    const [time, setTime] = useState(DateTime.now().setZone("gmt").toISOTime().substring(0, 5));

    useEffect(() => {
        setInterval(() => setTime(DateTime.now().setZone("gmt").toISOTime().substring(0, 5)), 100);
    }, []);

    return (
        <div className="infoBar">
            <div>
                <span id={"clock"}>{time}</span>
            </div>
            <BarCode id={"barcode"} />
            <Spinner />
            <div>
                <Role />
            </div>
            <CheckBoard id={"checkboard"} />
        </div>
    );
}

export default InfoBar;
