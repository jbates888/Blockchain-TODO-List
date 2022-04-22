import React from "react";

import '../index.css'

export function Header (props) {
    return (
        <div className="header-div">
            <h1 className="title-text">ETH TODO List</h1>
            <h1 className="info-text">Your wallet balance: {parseFloat(props.balance).toFixed(8)} ETH</h1>
        </div>
    )
}