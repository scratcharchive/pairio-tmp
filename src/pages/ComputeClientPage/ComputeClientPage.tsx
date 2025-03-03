/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hyperlink } from "@fi-sci/misc"
import { FunctionComponent } from "react"
import { useComputeClient } from "../../hooks"
import useRoute from "../../useRoute"

type ComputeClientPageProps = {
    // none
}

const ComputeClientPage: FunctionComponent<ComputeClientPageProps> = () => {
    const { route, setRoute } = useRoute()
    // const [errorMessage, setErrorMessage] = useState<string | null>(null)
    if (route.page !== 'compute_client') {
        throw new Error('Invalid route')
    }
    const computeClientId = route.computeClientId
    const { computeClient, deleteComputeClient } = useComputeClient(computeClientId)
    if (!computeClient) {
        return (
            <div style={{padding: 20}}>
                <h3>Loading...</h3>
            </div>
        )
    }
    return (
        <div style={{padding: 20, maxWidth: 500}}>
            <div>
                <Hyperlink onClick={() => {
                    setRoute({page: 'compute_client', computeClientId: computeClient.computeClientId})
                }}>
                    Back to service
                </Hyperlink>
            </div>
            <hr />
            <table className="table">
                <tbody>
                    <tr>
                        <td>Compute client</td>
                        <td>{computeClient.label}</td>
                        <td />
                    </tr>
                    <tr>
                        <td>ID</td>
                        <td>{computeClient.computeClientId}</td>
                        <td />
                    </tr>
                    <tr>
                        <td>User</td>
                        <td>{computeClient.userId}</td>
                        <td />
                    </tr>
                    <tr>
                        <td>Description</td>
                        <td>{computeClient.description}</td>
                        <td />
                    </tr>
                </tbody>
            </table>
            <hr />
            {/* <div>
                {errorMessage && (
                    <div style={{color: 'red'}}>
                        {errorMessage}
                    </div>
                )}
            </div> */}
            <div>
                {/* Delete computeClient */}
                <button onClick={async () => {
                    if (!window.confirm('Delete computeClient?')) return
                    await deleteComputeClient()
                    setRoute({page: 'service', serviceName: computeClient.serviceName})
                }}>
                    Delete compute client
                </button>
            </div>
        </div>
    )
}

export default ComputeClientPage