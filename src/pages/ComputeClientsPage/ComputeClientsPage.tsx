/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hyperlink, SmallIconButton } from "@fi-sci/misc";
import { Add } from "@mui/icons-material";
import { FunctionComponent, useCallback, useState } from "react";
import { useComputeClients } from "../../hooks";
import useGitHubAccessToken from "../../useGitHubAccessToken";
import useRoute from "../../useRoute";
import ComputeClientsTable from "./ComputeClientsTable";

type ComputeClientsPageProps = {
    // none
}

const ComputeClientsPage: FunctionComponent<ComputeClientsPageProps> = () => {
    const { userId } = useGitHubAccessToken();
    const { computeClients, createComputeClient } = useComputeClients()
    const { setRoute } = useRoute()
    const [registerComputeClientCommand, setRegisterComputeClientCommand] = useState('')

    const handleCreateComputeClient = useCallback(async () => {
        const label = prompt('Enter label for new compute client')
        if (!label) return
        const ret = await createComputeClient(label)
        if (!ret) return
        const { computeClientId, computeClientPrivateKey } = ret
        setRegisterComputeClientCommand(
            `pairio register-compute-client --compute-client-id ${computeClientId} --compute-client-private-key ${computeClientPrivateKey}`
        )
    }, [createComputeClient])

    if (!userId) return (
        <div style={{ padding: 20 }}>
            <h3>Not logged in</h3>
        </div>
    )
    if (!computeClients) return (
        <div style={{ padding: 20 }}>
            <h3>Loading...</h3>
        </div>
    )
    return (
        <div style={{ padding: 20 }}>
            <div>
                <Hyperlink onClick={() => {
                    setRoute({page: 'home'})
                }}>
                    Back home
                </Hyperlink>
            </div>
            <hr />
            <div>
                <SmallIconButton
                    icon={<Add />}
                    label="Create compute client"
                    onClick={handleCreateComputeClient}
                />
            </div>
            <div>
                {registerComputeClientCommand && <>
                    <h3>Register local compute client with the following commands</h3>
                    <pre>
                        mkdir pairio_compute_client<br />
                        cd pairio_compute_client<br />
                        {registerComputeClientCommand}
                    </pre>
                </>}
            </div>
            <ComputeClientsTable
                computeClients={computeClients}
            />
        </div>
    );
}

export default ComputeClientsPage