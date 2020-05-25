import {observer} from "mobx-react";
import userStore from "../../stores/User";
import React, {useEffect} from "react";
import {Select} from "antd";

const {Option} = Select;

const GroupSelector = observer((props) => {
    let groups = [];

    let defaultOpen = userStore.currentUser.group[0].id;

    useEffect(() => {
        userStore.currentGroup = defaultOpen;
    }, []);

    const handleChange = value => {
        userStore.currentGroup = value;
        if (props.handleChange !== undefined)
            props.handleChange(value);
    }

    if (props.restoreEvent !== undefined)
        props.restoreEvent(defaultOpen);

    for (let i of userStore.currentUser.group) {
        groups.push(<Option value={i.id}>{i.name}</Option>)
    }

    groups.sort(userStore.sortComparator);

    return <Select
        style={{width: 120}}
        defaultValue={defaultOpen}
        onChange={handleChange}
        showSearch
        filterOption={userStore.filterComparator}
    >
        {groups}
    </Select>;

});

export default GroupSelector;