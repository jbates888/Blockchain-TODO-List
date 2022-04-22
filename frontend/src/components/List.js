import React from "react";

import '../index.css'

export function List(props) {

    const items = props.list;

    const listItems = items.map((item, index) =>
        <li className="todo-item" key={index}>
             <span>{item}</span>
             <button className="btn btn-danger" onClick={() => props.finishFunc(index)}>Done</button>
        </li>
    );

    return (
        <ul>{listItems}</ul>
    );
}
