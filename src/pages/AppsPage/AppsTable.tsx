import { Hyperlink } from "@fi-sci/misc";
import { FunctionComponent } from "react";
import { PairioApp } from "../../types";
import useRoute from "../../useRoute";

type AppsTableProps = {
    apps: PairioApp[]
}

const AppsTable: FunctionComponent<AppsTableProps> = ({ apps }) => {
    const { setRoute } = useRoute()
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>App</th>
                    <th>User</th>
                    <th>Description</th>
                    <th>Source</th>
                    <th>Job create users</th>
                    <th>Job process users</th>
                    <th>Processors</th>
                </tr>
            </thead>
            <tbody>
                {apps.map((app) => (
                    <tr key={app.appName}>
                        <td>
                            <Hyperlink
                                onClick={() => {
                                    setRoute({page: 'app', appName: app.appName})
                                }}
                            >
                                {app.appName}
                            </Hyperlink>
                        </td>
                        <td>{app.userId}</td>
                        <td>{app.description}</td>
                        <td>{app.sourceUri}</td>
                        <td>{app.jobCreateUsers.join(', ')}</td>
                        <td>{app.jobProcessUsers.join(', ')}</td>
                        <td>{app.processors.map(p => (p.processorName)).join(', ')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default AppsTable