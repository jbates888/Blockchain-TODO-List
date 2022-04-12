function List(props) {

    const items = props.list;

    const listItems = items.map((item) =>
        <li>
             <span>{item}</span>
            <button onClick= { () => props.deleteFunc()}>Done</button>
        </li>
    );

    return (
        <ul>{listItems}</ul>
    );
}

export default List;