import React, { useEffect, useState } from "react";
import './NewAccount.scss'

export default function TimerCountDown({ seconds }) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    useEffect(() => {
        if (!timeLeft) return;

        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    return (
        <div>
            <span className="timer-msg">Please wait for {timeLeft} seconds to get the verification code again.</span>
        </div>
    );
}
