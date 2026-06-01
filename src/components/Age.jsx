import { useState, useEffect } from "react";

export default function Age({ paused = false }) {
    const BIRTHDAY = new Date(2004, 2, 5).getTime();
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setTime(Date.now()), 100);
        return () => clearInterval(id);
    }, [paused]);

    return <> {((time - BIRTHDAY) / 60 / 60 / 24 / 365 / 1000).toString().slice(0, 12)} </>;
}
