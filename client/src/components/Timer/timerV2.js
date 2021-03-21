import React from "react";
import "./timerv2.scss";

export function TimerV2({
    fullWidthPercent = 100,
    fillToPercent = 100,
    percentToStartFrom = 0,
    time = 5,
    shouldBlink,
}) {
    const idle = fillToPercent === 0;
    const timeLeft = time - (percentToStartFrom / 100) * time;

    console.log(
        "fillToPercent - percentToStartFrom",
        fillToPercent - percentToStartFrom
    );

    return (
        <div
            className={`timer-container ${
                shouldBlink ? "blink-animation" : ""
            }`}
            style={{
                width: `${fullWidthPercent}%`,
                animationDuration: `${idle ? 0 : timeLeft}s`,
            }}
        >
            <div
                style={{
                    width: `${percentToStartFrom}%`,
                }}
                className={`progress-no-animation`}
            />
            <div
                style={{
                    width: `${fillToPercent - percentToStartFrom}%`,
                    animationDuration: `${idle ? 0 : timeLeft}s`,
                }}
                className={`timer-progress 
                        ${percentToStartFrom > 0 ? "timer-continuing" : ""} 
                        ${idle ? "progress-no-animation" : ""}
                        `}
            />
        </div>
    );
}
