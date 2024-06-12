/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionComponent, useCallback, useState } from "react"
import useRoute from "../../useRoute"
import { useApp } from "../../hooks"
import { Hyperlink, SmallIconButton, isArrayOf } from "@fi-sci/misc"
import { isPairioAppProcessor } from "../../types"
import { Edit } from "@mui/icons-material"

type AppPageProps = {
    // none
}

const AppPage: FunctionComponent<AppPageProps> = () => {
    const { route, setRoute } = useRoute()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    if (route.page !== 'app') {
        throw new Error('Invalid route')
    }
    const appName = route.appName
    const { app, deleteApp, setAppInfo } = useApp(appName)
    const handleLoadFromSource = useCallback(async () => {
        if (!app) return
        if (!app.sourceUri) return
        setErrorMessage(null)
        try {
            const x = await loadJsonFromUri(app.sourceUri)
            if (x.name !== app.appName) {
                throw new Error('App name does not match')
            }
            const processors = x.processors
            if (!isArrayOf(isPairioAppProcessor)(processors)) {
                throw new Error('Invalid processors')
            }
            const description = x.description
            if (description === undefined) {
                throw new Error('Missing description')
            }
            setAppInfo({
                processors,
                description
            })
        }
        catch(err: any) {
            console.error(err)
            setErrorMessage('Error loading from source: ' + err.message)
        }
    }, [app, setAppInfo])
    if (!app) {
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
                    setRoute({page: 'apps'})
                }}>
                    Back to apps
                </Hyperlink>
            </div>
            <hr />
            <table className="table">
                <tbody>
                    <tr>
                        <td>App</td>
                        <td>{appName}</td>
                        <td />
                    </tr>
                    <tr>
                        <td>User</td>
                        <td>{app.userId}</td>
                        <td />
                    </tr>
                    <tr>
                        <td>Description</td>
                        <td>{app.description}</td>
                        <td />
                    </tr>
                    <tr>
                        <td>Source</td>
                        <td>
                            {app.sourceUri}
                        </td>
                        <td>
                            <SmallIconButton
                                icon={<Edit />}
                                onClick={() => {
                                    const sourceUri = prompt('Enter source URI', app.sourceUri || '')
                                    if (sourceUri === null) return
                                    setAppInfo({sourceUri})
                                }}
                            />
                            {app.sourceUri && (
                                <Hyperlink onClick={handleLoadFromSource}>
                                    Load from source
                                </Hyperlink>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>Job create users</td>
                        <td>{app.jobCreateUsers.join(', ')}</td>
                        <td />
                    </tr>
                    <tr>
                        <td>Job process users</td>
                        <td>{app.jobProcessUsers.join(', ')}</td>
                        <td />
                    </tr>
                    <tr>
                        <td>Processors</td>
                        <td>{app.processors.map(p => (p.processorName)).join(', ')}</td>
                        <td />
                    </tr>
                </tbody>
            </table>
            <hr />
            <div>
                {errorMessage && (
                    <div style={{color: 'red'}}>
                        {errorMessage}
                    </div>
                )}
            </div>
            <div>
                {/* Delete app */}
                <button onClick={async () => {
                    if (!window.confirm('Delete app?')) return
                    await deleteApp()
                    setRoute({page: 'apps'})
                }}>
                    Delete app
                </button>
            </div>
        </div>
    )
}

const loadJsonFromUri = async (uri: string) => {
    const url = getUrlFromUri(uri)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Error loading from source: ${response.statusText}`)
    }
    const json = await response.json()
    return json
}

const getUrlFromUri = (uri: string) => {
    if (uri.startsWith('https://github.com/')) {
        const raw_url = uri.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
        return raw_url
    }
    else {
        return uri
    }
}


export default AppPage