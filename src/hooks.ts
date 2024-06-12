/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddAppRequest, ComputeClient, ComputeClientComputeSlot, CreateComputeClientRequest, DeleteAppRequest, DeleteComputeClientRequest, GetAppRequest, GetAppsRequest, GetComputeClientRequest, GetComputeClientsRequest, PairioApp, SetAppInfoRequest, isAddAppResponse, isCreateComputeClientResponse, isGetAppResponse, isGetAppsResponse, isGetComputeClientResponse, isGetComputeClientsResponse, isSetAppInfoResponse } from "./types";
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

export const useComputeClients = () => {
    const { accessToken, userId } = useGitHubAccessToken()
    const [computeClients, setComputeClients] = useState<ComputeClient[] | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    const refreshComputeClients = useCallback(() => {
        setRefreshCode(c => c + 1)
    }, [])
    useEffect(() => {
        let canceled = false
        setComputeClients(undefined);
        (async () => {
            const req: GetComputeClientsRequest = {
                type: 'getComputeClientsRequest',
                userId
            }
            const resp = await apiPostRequest('getComputeClients', req, accessToken)
            if (canceled) return
            if (!isGetComputeClientsResponse(resp)) {
                console.error('Invalid response', resp)
                return
            }
            setComputeClients(resp.computeClients)
        })()
        return () => { canceled = true }
    }, [accessToken, refreshCode, userId])

    const createComputeClient = useMemo(() => (async (label: string) => {
        if (!userId) return
        const computeSlot: ComputeClientComputeSlot = {
            computeSlotId: '', // will be generated
            numCpus: 4,
            numGpus: 0,
            memoryGb: 8,
            timeSec: 3600,
            minNumCpus: 0,
            minNumGpus: 0,
            minMemoryGb: 0,
            minTimeSec: 0,
            multiplicity: 1
        }
        const computeClient: ComputeClient = {
            computeClientId: '', // will be generated
            computeClientPrivateKey: null, // will be generated
            userId,
            label,
            description: '',
            appsToProcess: [],
            computeSlots: [computeSlot]
        }
        const req: CreateComputeClientRequest = {
            type: 'createComputeClientRequest',
            computeClient
        }
        const resp = await apiPostRequest('createComputeClient', req, accessToken)
        if (!isCreateComputeClientResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        refreshComputeClients()
        return { computeClientId: resp.computeClientId, computeClientPrivateKey: resp.computeClientPrivateKey }
    }), [userId, accessToken, refreshComputeClients])

    return {
        computeClients,
        createComputeClient,
        refreshComputeClients
    }
}

export const useComputeClient = (computeClientId: string) => {
    const { accessToken } = useGitHubAccessToken()
    const [computeClient, setComputeClient] = useState<ComputeClient | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    const refreshComputeClient = useCallback(() => {
        setRefreshCode(c => c + 1)
    }, [])
    useEffect(() => {
        let canceled = false
        setComputeClient(undefined)
        if (!accessToken) return
        (async () => {
            const req: GetComputeClientRequest = {
                type: 'getComputeClientRequest',
                computeClientId
            }
            const resp = await apiPostRequest('getComputeClient', req, accessToken)
            if (canceled) return
            if (!isGetComputeClientResponse(resp)) {
                console.error('Invalid response', resp)
                return
            }
            setComputeClient(resp.computeClient)
        })()
        return () => { canceled = true }
    }, [computeClientId, accessToken, refreshCode])

    const deleteComputeClient = useCallback(async () => {
        if (!accessToken) return
        const req: DeleteComputeClientRequest = {
            type: 'deleteComputeClientRequest',
            computeClientId
        }
        const resp = await apiPostRequest('deleteComputeClient', req, accessToken)
        if (!isGetComputeClientResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        setComputeClient(undefined)
    }, [computeClientId, accessToken])

    return { computeClient, deleteComputeClient, refreshComputeClient }
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