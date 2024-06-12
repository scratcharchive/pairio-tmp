/* eslint-disable @typescript-eslint/no-explicit-any */
import allowCors from "./allowCors";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getMongoClient } from "./getMongoClient";
import { AddAppResponse, AddUserResponse, CancelJobResponse, ComputeClient, CreateComputeClientResponse, DeleteAppResponse, DeleteComputeClientResponse, GetAppResponse, GetAppsResponse, GetComputeClientResponse, GetComputeClientsResponse, GetJobResponse, GetJobsResponse, GetSignedUploadUrlResponse, PairioApp, PairioJob, PairioUser, ResetUserApiKeyResponse, SetAppInfoResponse, SetUserInfoResponse, isAddAppRequest, isAddUserRequest, isCancelJobRequest, isComputeClient, isCreateComputeClientRequest, isCreateJobRequest, isDeleteAppRequest, isDeleteComputeClientRequest, isGetAppRequest, isGetAppsRequest, isGetComputeClientRequest, isGetComputeClientsRequest, isGetJobRequest, isGetJobsRequest, isGetSignedUploadUrlRequest, isPairioApp, isPairioJob, isPairioUser, isResetUserApiKeyRequest, isSetAppInfoRequest, isSetJobStatusRequest, isSetUserInfoRequest } from "./types";

// addApp handler
export const addAppHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isAddAppRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    const app = rr.app;
    const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!(await authenticateUser(app.userId, authorizationToken))) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        await insertApp(app);
        const resp: AddAppResponse = {
            type: 'addAppResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// addUser handler
export const addUserHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isAddUserRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    const githubAccessToken = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!githubAccessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const githubUserId = await getUserIdForGitHubAccessToken(githubAccessToken);
    if (rr.user.userId != `github|${githubUserId}`) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const user = await fetchUser(rr.user.userId);
    if (user !== null) {
        res.status(400).json({ error: "User already exists" });
        return;
    }
    try {
        await insertUser(rr.user);
        const resp: AddUserResponse = {
            type: 'addUserResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// resetUserApiKey handler
export const resetUserApiKeyHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isResetUserApiKeyRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    const githubAccessToken = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!githubAccessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const githubUserId = await getUserIdForGitHubAccessToken(githubAccessToken);
    if (rr.userId != `github|${githubUserId}`) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const user = await fetchUser(rr.userId);
    if (user === null) {
        res.status(400).json({ error: "User does not exist" });
        return;
    }
    try {
        const apiKey = generateUserApiKey();
        user.apiKey = apiKey;
        await updateUser(rr.userId, { apiKey });
        const resp: ResetUserApiKeyResponse = {
            type: 'resetUserApiKeyResponse',
            apiKey
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// setUserInfo handler
export const setUserInfoHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isSetUserInfoRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    const githubAccessToken = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!githubAccessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const githubUserId = await getUserIdForGitHubAccessToken(githubAccessToken);
    if (rr.userId != `github|${githubUserId}`) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const update: { [key: string]: any } = {};
        if (rr.name !== undefined) update['name'] = rr.name;
        if (rr.email !== undefined) update['email'] = rr.email;
        await updateUser(rr.userId, update);
        const resp: SetUserInfoResponse = {
            type: 'setUserInfoResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// createJob handler
export const createJobHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isCreateJobRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    const job = rr.job;
    const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!(await authenticateUser(job.userId, authorizationToken))) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        // todo
        throw Error('Not implemented');
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getJobs handler
export const getJobsHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetJobsRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        let okayToProceed = false;
        if (rr.userId) {
            okayToProceed = true;
        }
        else if (rr.computeClientId) {
            okayToProceed = true;
        }
        else if (rr.jobId) {
            okayToProceed = true;
        }
        else if (rr.processorName) {
            okayToProceed = true;
        }
        else if (rr.appName) {
            okayToProceed = true;
        }
        else if (rr.projectName) {
            okayToProceed = true;
        }
        else if (rr.inputFileUrl) {
            okayToProceed = true;
        }
        else if (rr.outputFileUrl) {
            okayToProceed = true;
        }
        else if (rr.batchId) {
            okayToProceed = true;
        }
        if (!okayToProceed) {
            res.status(400).json({ error: "Not enough info provided in request for query for jobs" });
            return;
        }
        const query: { [key: string]: any } = {};
        if (rr.userId) query['userId'] = rr.userId;
        if (rr.jobId) query['jobId'] = rr.jobId;
        if (rr.processorName) query['processorName'] = rr.processorName;
        if (rr.computeClientId) query['computeClientId'] = rr.computeClientId;
        if (rr.batchId) query['batchId'] = rr.batchId;
        if (rr.projectName) query['projectName'] = rr.projectName;
        if (rr.appName) query['appName'] = rr.appName;
        if (rr.inputFileUrl) query['inputFileUrls'] = rr.inputFileUrl;
        if (rr.outputFileUrl) query['outputFileUrls'] = rr.outputFileUrl;
        if (rr.status) query['status'] = rr.status;
        const jobs = await fetchJobs(query);
        // hide the private keys for the jobs
        for (const job of jobs) {
            job.jobPrivateKey = null;
        }
        const resp: GetJobsResponse = {
            type: 'getJobsResponse',
            jobs
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getJob handler
export const getJobHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetJobRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const jobs = await fetchJobs({ jobId: rr.jobId });
        if (jobs.length === 0) {
            res.status(404).json({ error: "Job not found" });
            return;
        }
        const job = jobs[0];
        if (rr.includePrivateKey) {
            if (!rr.computeClientId) {
                res.status(400).json({ error: "computeClientId must be provided if includePrivateKey is true" });
                return;
            }
            if (job.computeClientId !== rr.computeClientId) {
                res.status(401).json({ error: "Mismatch between computeClientId in request and job" });
                return;
            }
            const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
            if (!(await authenticateComputeClient(rr.computeClientId, authorizationToken))) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
        }
        else {
            job.jobPrivateKey = null;
        }
        const resp: GetJobResponse = {
            type: 'getJobResponse',
            job
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// cancelJob handler
export const cancelJobHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isCancelJobRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const jobs = await fetchJobs({ jobId: rr.jobId });
        if (jobs.length === 0) {
            res.status(404).json({ error: "Job not found" });
            return;
        }
        const job = jobs[0];
        const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateUser(job.userId, authorizationToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (job.status === 'completed' || job.status === 'failed') {
            res.status(400).json({ error: "Job is already completed or failed" });
            return;
        }
        await updateJob(rr.jobId, { canceled: true });
        const resp: CancelJobResponse = {
            type: 'cancelJobResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// setJobStatus handler
export const setJobStatusHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isSetJobStatusRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const jobs = await fetchJobs({ jobId: rr.jobId });
        if (jobs.length === 0) {
            res.status(404).json({ error: "Job not found" });
            return;
        }
        // const job = jobs[0];
        // const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        // todo
        throw Error('Not implemented');
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getSignedUploadUrl handler
export const getSignedUploadUrlHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetSignedUploadUrlRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const jobs = await fetchJobs({ jobId: rr.jobId });
        if (jobs.length === 0) {
            res.status(404).json({ error: "Job not found" });
            return;
        }
        const job = jobs[0];
        const computeClientId = job.computeClientId;
        if (!computeClientId) {
            res.status(400).json({ error: "Job does not have a compute client" });
            return;
        }
        const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateComputeClient(computeClientId, authorizationToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!uploadUrlValidForJob(job, rr.url)) {
            res.status(400).json({ error: "Job does not have the specified upload url" });
            return;
        }
        const signedUrl = await createSignedUploadUrl(rr.url);
        const resp: GetSignedUploadUrlResponse = {
            type: 'getSignedUploadUrlResponse',
            signedUrl
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// deleteComputeClient handler
export const deleteComputeClientHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isDeleteComputeClientRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const computeClient = await fetchComputeClient(rr.computeClientId);
        if (!computeClient) {
            res.status(404).json({ error: "Compute client not found" });
            return;
        }
        const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateUser(computeClient.userId, authorizationToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        await deleteComputeClient(rr.computeClientId);
        const resp: DeleteComputeClientResponse = {
            type: 'deleteComputeClientResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// createComputeClient handler
export const createComputeClientHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isCreateComputeClientRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    const computeClient = rr.computeClient;
    const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!(await authenticateUser(computeClient.userId, authorizationToken))) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const computeClientId = generateComputeClientId();
        const computeClientPrivateKey = generateComputeClientPrivateKey();
        computeClient.computeClientId = computeClientId;
        computeClient.computeClientPrivateKey = computeClientPrivateKey;
        await insertComputeClient(computeClient);
        const resp: CreateComputeClientResponse = {
            type: 'createComputeClientResponse',
            computeClientId,
            computeClientPrivateKey
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getComputeClient handler
export const getComputeClientHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetComputeClientRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const computeClient = await fetchComputeClient(rr.computeClientId);
        if (!computeClient) {
            res.status(404).json({ error: "Compute client not found" });
            return;
        }
        // hide the private key
        computeClient.computeClientPrivateKey = null;
        const resp: GetComputeClientResponse = {
            type: 'getComputeClientResponse',
            computeClient
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getComputeClients handler
export const getComputeClientsHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetComputeClientsRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        if (!rr.userId) {
            res.status(400).json({ error: "userId must be provided" });
            return;
        }
        const computeClients = await fetchComputeClientsForUser(rr.userId);
        // hide the private keys
        for (const computeClient of computeClients) {
            computeClient.computeClientPrivateKey = null;
        }
        const resp: GetComputeClientsResponse = {
            type: 'getComputeClientsResponse',
            computeClients
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// setAppInfo handler
export const setAppInfoHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isSetAppInfoRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const githubAccessToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!githubAccessToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const githubUserId = await getUserIdForGitHubAccessToken(githubAccessToken);
        const app = await fetchApp(rr.appName);
        if (!app) {
            res.status(404).json({ error: "App not found" });
            return;
        }
        if (app.userId !== `github|${githubUserId}`) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const update: { [key: string]: any } = {};
        if (rr.description !== undefined) update['description'] = rr.description;
        if (rr.jobCreateUsers !== undefined) update['jobCreateUsers'] = rr.jobCreateUsers;
        if (rr.jobProcessUsers !== undefined) update['jobProcessUsers'] = rr.jobProcessUsers;
        await updateApp(rr.appName, update);
        const resp: SetAppInfoResponse = {
            type: 'setAppInfoResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getApp handler
export const getAppHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetAppRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const app = await fetchApp(rr.appName);
        if (!app) {
            res.status(404).json({ error: "App not found" });
            return;
        }
        const resp: GetAppResponse = {
            type: 'getAppResponse',
            app
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// deleteApp handler
export const deleteAppHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isDeleteAppRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const app = await fetchApp(rr.appName);
        if (!app) {
            res.status(404).json({ error: "App not found" });
            return;
        }
        const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateUser(app.userId, authorizationToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        await deleteApp(rr.appName);
        const resp: DeleteAppResponse = {
            type: 'deleteAppResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getApps handler
export const getAppsHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetAppsRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        if (!rr.userId) {
            res.status(400).json({ error: "userId must be provided" });
            return;
        }
        const apps = await fetchAppsForUser(rr.userId);
        const resp: GetAppsResponse = {
            type: 'getAppsResponse',
            apps
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

////////////////////////////////////////

const authenticateUser = async (userId: string, authorizationToken: string | undefined): Promise<boolean> => {
    const user = await fetchUser(userId)
    if (!user) return false;
    if (user.apiKey !== authorizationToken) return false;
    return true;
}

const fetchUser = async (userId: string) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('users');
    const user = await collection.findOne({ userId });
    if (!user) return null;
    removeMongoId(user);
    if (!isPairioUser(user)) {
        throw Error('Invalid user in database');
    }
    return user;
}

const insertUser = async (user: PairioUser) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('users');
    await collection.insertOne(user);
}

const updateUser = async (userId: string, update: any) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('users');
    await collection
        .updateOne({ userId }, { $set: update });
}

const insertApp = async (app: PairioApp) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('apps');
    await collection.insertOne(app);
}

const fetchApp = async (appName: string) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('apps');
    const app = await collection.findOne({ appName });
    if (!app) return null;
    removeMongoId(app);
    if (!isPairioApp(app)) {
        throw Error('Invalid app in database');
    }
    return app;
}

const fetchAppsForUser = async (userId: string) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('apps');
    const apps = await collection.find({ userId }).toArray();
    for (const app of apps) {
        removeMongoId(app);
        if (!isPairioApp(app)) {
            throw Error('Invalid app in database');
        }
    }
    return apps.map((app: any) => app as PairioApp);
}

const updateApp = async (appName: string, update: any) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('apps');
    await collection
        .updateOne({ appName }, { $set: update });
}

const deleteApp = async (appName: string) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('apps');
    await collection.deleteOne({ appName });
}

const fetchJobs = async (query: { [key: string]: any }) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('jobs');
    const jobs = await collection
        .find(query)
        .toArray();
    for (const job of jobs) {
        removeMongoId(job);
        if (!isPairioJob(job)) {
            throw Error('Invalid job in database');
        }
    }
    return jobs.map((job: any) => job as PairioJob);
}

const updateJob = async (jobId: string, update: any) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('jobs');
    await collection.updateOne({
        jobId
    }, {
        $set: update
    });
}

const insertComputeClient = async (computeClient: ComputeClient) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('computeClients');
    await collection.insertOne(computeClient);
}

const fetchComputeClient = async (computeClientId: string) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('computeClients');
    const computeClient = await collection.findOne({ computeClientId });
    if (!computeClient) return null;
    removeMongoId(computeClient);
    if (!isComputeClient(computeClient)) {
        throw Error('Invalid compute client in database');
    }
    return computeClient;
}

const fetchComputeClientsForUser = async (userId: string) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('computeClients');
    const computeClients = await collection.find({ userId }).toArray();
    for (const computeClient of computeClients) {
        removeMongoId(computeClient);
        if (!isComputeClient(computeClient)) {
            throw Error('Invalid compute client in database');
        }
    }
    return computeClients.map((computeClient: any) => computeClient as ComputeClient);
}

const deleteComputeClient = async (computeClientId: string) => {
    const client = await getMongoClient();
    const collection = client.db('pairio').collection('computeClients');
    await collection.deleteOne({ computeClientId });
}

const authenticateComputeClient = async (computeClientId: string, authorizationToken: string | undefined): Promise<boolean> => {
    const computeClient = await fetchComputeClient(computeClientId);
    if (!computeClient) return false;
    if (computeClient.computeClientPrivateKey !== authorizationToken) return false;
    return true;
}

const removeMongoId = (x: any) => {
    if (x === null) return;
    if (typeof x !== 'object') return;
    if ('_id' in x) delete x['_id'];
}

const getUserIdForGitHubAccessToken = async (gitHubAccessToken: string): Promise<string> => {
    // todo
    throw Error(`Not implemented: getUserIdForGitHubAccessToken ${gitHubAccessToken}`);
}

const generateUserApiKey = () => {
    return generateRandomId(32);
}

const generateRandomId = (len: number) => {
    const choices = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const numChoices = choices.length;
    let ret = '';
    for (let i = 0; i < len; i++) {
        ret += choices[Math.floor(Math.random() * numChoices)];
    }
    return ret;
}

const uploadUrlValidForJob = (job: PairioJob, url: string) => {
    if (job.outputFileUrls.includes(url)) return true;
    if (job.consoleOutputUrl === url) return true;
    if (job.resourceUtilizationLogUrl === url) return true;
    return false;
}

const generateComputeClientId = () => {
    return generateRandomId(12);
}

const generateComputeClientPrivateKey = () => {
    return generateRandomId(32);
}

const createSignedUploadUrl = async (url: string) => {
    // todo
    throw Error(`Not implemented: createSignedUploadUrl ${url}`);
}