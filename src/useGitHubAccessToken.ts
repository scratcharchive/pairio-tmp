import { useCallback, useEffect, useMemo, useState } from "react"

const useGitHubAccessToken = () => {
    const [refresh, setRefresh] = useState(0)
    const clearAccessToken = useCallback(() => {
        localStorage.removeItem('pairio_github_access_token')
        setRefresh(n => n + 1)
    }, [])
    const accessToken = useMemo(() => {
        const accessToken = localStorage.getItem('pairio_github_access_token')
        if (!accessToken) {
            return undefined
        }
        try {
            return JSON.parse(accessToken).accessToken
        }
        catch {
            return undefined
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh])
    const [userId, setUserId] = useState<string | undefined>(undefined)
    useEffect(() => {
        let canceled = false;
        (async () => {
            setUserId(undefined)
            if (!accessToken) {
                return
            }
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${accessToken}`
                }
            })
            if (canceled) {
                return
            }
            if (!response.ok) {
                clearAccessToken()
                return
            }
            const data = await response.json()
            setUserId('github|' + data.login)
        })()
        return () => { canceled = true }
    }, [accessToken, clearAccessToken])
    return {accessToken, clearAccessToken, userId}
}

export default useGitHubAccessToken