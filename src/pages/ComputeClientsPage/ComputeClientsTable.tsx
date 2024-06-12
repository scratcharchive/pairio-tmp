import { Hyperlink } from "@fi-sci/misc";
import { FunctionComponent } from "react";
import { ComputeClient } from "../../types";
import useRoute from "../../useRoute";

type ComputeClientsTableProps = {
    computeClients: ComputeClient[]
}

const ComputeClientsTable: FunctionComponent<ComputeClientsTableProps> = ({ computeClients }) => {
    const { setRoute } = useRoute()
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Compute client</th>
                    <th>ID</th>
                    <th>User</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {computeClients.map((computeClient) => (
                    <tr key={computeClient.computeClientId}>
                        <td>
                            <Hyperlink
                                onClick={() => {
                                    setRoute({page: 'compute_client', computeClientId: computeClient.computeClientId})
                                }}
                            >
                                {computeClient.label}
                            </Hyperlink>
                        </td>
                        <td>{computeClient.computeClientId}</td>
                        <td>{computeClient.userId}</td>
                        <td>{computeClient.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default ComputeClientsTable