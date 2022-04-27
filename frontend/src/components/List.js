import React from "react";

import '../index.css'

// list component that displays the users tasks
export function List(props) {
    //get the list of tasks passed in
    const items = props.list;
    // use map to display every task in the list with the button to finish it
    const listItems = items.map((item, index) => {
        // if the item has not been marked as finished
        if(item[1] === false) {
            return (
                <li className="todo-item" key={index}>
                    <span>{item}</span>
                    <button className="btn btn-outline-danger btn-sm btn-done" onClick={() => props.finishFunc(index)}>
                        Done
                    </button>
                </li>
            );
        // otherwise the task has already been marked as finished
        } else {
            return (
                <li className="finished-item" key={index}>
                    <span>{item}</span>
                    <button className="btn btn-outline-danger btn-sm btn-done" disabled>
                        Finished
                    </button>
                </li>
            );
        }
    });

    // return the list of tasks
    return (
        <ul className="list">{listItems}</ul>
    );
}
