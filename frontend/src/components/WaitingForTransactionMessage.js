import React from "react";

import '../index.css'

export function WaitingForTransactionMessage() {
  return (
    <div className="alert alert-info" role="alert">
      <h3>Mining your transaction</h3>
    </div>
  );
}
