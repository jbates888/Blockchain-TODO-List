function List(props) {

    const items = props.list;

    const listItems = items.map((item) =>
        <li>
            <input value={item} type="checkbox" onClick= { () => props.deleteFunc()}/>
            <span>{item}</span>
        </li>
    );

    return (
        <ul>{listItems}</ul>
    );
}

export default List;