import React from "react";

import '../index.css'

export function NoTokensMessage() {
  return (
    <div className="alert alert-danger" role="alert">
      <h3>You dont have any ETH in your wallet, use a faucet to get some for free!</h3>
    </div>
  );
}
