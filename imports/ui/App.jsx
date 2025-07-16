import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { TasksCollection } from '/imports/api/TasksCollection';
import { Task } from './Task';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';


export const App = () => {
    const [hideCompleted, setHideCompleted] = useState(false);

    const hideCompletedFilter = { isChecked: { $ne: true } };

    const isLoading = useSubscribe("tasks");
    console.log(isLoading())

    const user = useTracker(() => Meteor.user());


    const pendingTasksCount = useTracker(() =>
        TasksCollection.find(hideCompletedFilter).count()
    );

    const pendingTasksTitle = `${
        pendingTasksCount ? ` (${pendingTasksCount})` : ''
    }`;

    const tasks = useTracker(() =>
        TasksCollection.find(hideCompleted ? hideCompletedFilter : {}, {
            sort: { createdAt: -1 },
        }).fetch()
    );
    // const tasks = useTracker(() => TasksCollection.find({}, {sort: {createdAt: -1}}).fetch());
    console.log(tasks);



    const handleToggleChecked = ({_id, isChecked}) => {
        Meteor.callAsync("tasks.toggleChecked", {_id, isChecked});
    }

    const handleDelete = ({ _id }) => {
        Meteor.callAsync("tasks.delete", { _id });
    }


    if (isLoading()) {
        return <div>Loading...</div>;
    }


    return (
        <div className="app">
            <header>
                <div className="app-bar">
                    <div className="app-header">
                        <h1>📝️ To Do List {pendingTasksTitle}</h1>
                    </div>
                </div>
            </header>
            <div className="main">
                {user ? (
                    <Fragment>
                        <TaskForm />

                        <div className="filter">
                            <button onClick={() => setHideCompleted(!hideCompleted)}>
                                {hideCompleted ? 'Show All' : 'Hide Completed'}
                            </button>
                        </div>

                        <ul className="tasks">
                            {tasks.map(task => (
                                <Task
                                    key={task._id}
                                    task={task}
                                    onCheckboxClick={handleToggleChecked}
                                    onDeleteClick={handleDelete}
                                />
                            ))}
                        </ul>
                    </Fragment>
                ) : (
                    <LoginForm />
                )}
            </div>
        </div>
    );
};