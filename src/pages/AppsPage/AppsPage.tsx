/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hyperlink, SmallIconButton } from "@fi-sci/misc";
import { Add } from "@mui/icons-material";
import { FunctionComponent, useCallback } from "react";
import { useApps } from "../../hooks";
import { PairioApp } from "../../types";
import useGitHubAccessToken from "../../useGitHubAccessToken";
import AppsTable from "./AppsTable";
import useRoute from "../../useRoute";

type AppsPageProps = {
    // none
}

const AppsPage: FunctionComponent<AppsPageProps> = () => {
    const { userId } = useGitHubAccessToken();
    const { apps, addApp } = useApps()
    const { setRoute } = useRoute()

    const handleAddApp = useCallback(async () => {
        if (!userId) return
        const appName = prompt('Enter app name')
        if (!appName) return
        const app: PairioApp = {
            userId,
            appName,
            description: '',
            sourceUri: '',
            processors: [],
            jobCreateUsers: [userId],
            jobProcessUsers: [userId]
        }
        await addApp(app)
    }, [userId, addApp])

    if (!userId) return (
        <div style={{ padding: 20 }}>
            <h3>Not logged in</h3>
        </div>
    )
    if (!apps) return (
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
                    onClick={handleAddApp}
                    icon={<Add />}
                    label="Add app"
                />
            </div>
            <AppsTable
                apps={apps}
            />
        </div>
    );
}

export default AppsPage