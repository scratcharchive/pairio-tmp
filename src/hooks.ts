/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddAppRequest, DeleteAppRequest, GetAppRequest, GetAppsRequest, PairioApp, SetAppInfoRequest, isAddAppResponse, isGetAppResponse, isGetAppsResponse, isSetAppInfoResponse } from "./types";
import useGitHubAccessToken from "./useGitHubAccessToken";

const apiUrl = 'https://pairio.vercel.app'
// const apiUrl = 'http://localhost:3000'

export const useApps = () => {
    const { userId, accessToken } = useGitHubAccessToken();
    const [apps, setApps] = useState<PairioApp[] | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    const refreshApps = useCallback(() => {
        setRefreshCode(c => c + 1)
    }, [])
    useEffect(() => {
        let canceled = false;
        setApps(undefined);
        if (!userId) return;
        (async () => {
            const req: GetAppsRequest = {
                type: 'getAppsRequest',
                userId
            }
            const resp = await apiPostRequest('getApps', req, undefined)
            if (canceled) return
            if (!isGetAppsResponse(resp)) {
                console.error('Invalid response', resp)
                return
            }
            setApps(resp.apps)
        })()
        return () => { canceled = true }
    }, [userId, refreshCode])

    const addApp = useCallback(async (app: PairioApp) => {
        if (!accessToken) return;
        const req: AddAppRequest = {
            type: 'addAppRequest',
            app
        }
        const resp = await apiPostRequest('addApp', req, accessToken)
        if (!isAddAppResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        refreshApps()
    }, [refreshApps, accessToken])

    return {
        apps,
        refreshApps,
        addApp
    }
}

export const useApp = (appName: string) => {
    const { accessToken } = useGitHubAccessToken()
    const [app, setApp] = useState<PairioApp | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    const refreshApp = useCallback(() => {
        setRefreshCode(c => c + 1)
    }, [])
    useEffect(() => {
        let canceled = false
        setApp(undefined)
        if (!accessToken) return
        (async () => {
            const req: GetAppRequest = {
                type: 'getAppRequest',
                appName
            }
            const resp = await apiPostRequest('getApp', req, accessToken)
            if (canceled) return
            if (!isGetAppResponse(resp)) {
                console.error('Invalid response', resp)
                return
            }
            setApp(resp.app)
        })()
        return () => { canceled = true }
    }, [appName, accessToken, refreshCode])

    const deleteApp = useCallback(async () => {
        if (!accessToken) return
        const req: DeleteAppRequest = {
            type: 'deleteAppRequest',
            appName
        }
        const resp = await apiPostRequest('deleteApp', req, accessToken)
        if (!isGetAppResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        setApp(undefined)
    }, [appName, accessToken])

    const setAppInfo = useMemo(() => (async (o: { description?: string, sourceUri?: string, jobCreateUsers?: string[], jobProcessUsers?: string[], processors?: any[] }) => {
        const { description, sourceUri, jobCreateUsers, jobProcessUsers, processors } = o
        const req: SetAppInfoRequest = {
            type: 'setAppInfoRequest',
            appName,
            description,
            sourceUri,
            jobCreateUsers,
            jobProcessUsers,
            processors
        }
        const resp = await apiPostRequest('setAppInfo', req, accessToken)
        if (!isSetAppInfoResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        refreshApp()
    }), [appName, accessToken, refreshApp])

    return { app, deleteApp, setAppInfo, refreshApp }
}

const apiPostRequest = async (path: string, req: any, accessToken?: string) => {
    const url = `${apiUrl}/api/${path}`
    const headers: { [key: string]: string } = {}
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
    }
    headers['Content-Type'] = 'application/json'
    console.log('---- headers', headers)
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(req)
    })
    if (!response.ok) {
        const responseText = await response.text()
        throw Error(`Error fetching ${path}: ${response.status} ${responseText}`)
    }
    const resp = await response.json()
    return resp
}