import { useState, useEffect } from "react";

export default function Age() {
    const BIRTHDAY = new Date(2004, 2, 5).getTime();
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        setInterval(() => setTime(Date.now()), 100);
    }, []);

    return <span> {((time - BIRTHDAY) / 60 / 60 / 24 / 365 / 1000).toString().slice(0, 12)} </span>;
}
