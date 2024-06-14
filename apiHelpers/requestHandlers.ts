/* eslint-disable @typescript-eslint/no-explicit-any */
import { VercelRequest, VercelResponse } from "@vercel/node";
import allowCors from "./allowCors.js"; // remove .js for local dev
import { getMongoClient } from "./getMongoClient.js"; // remove .js for local dev
import { AddServiceAppResponse, AddUserResponse, CancelJobResponse, CreateJobResponse, CreateServiceComputeClientResponse, DeleteServiceAppResponse, DeleteServiceComputeClientResponse, GetJobResponse, GetJobsResponse, GetServiceAppResponse, GetServiceAppsResponse, GetServiceComputeClientResponse, GetServiceComputeClientsResponse, GetSignedUploadUrlResponse, PairioJob, PairioService, PairioServiceApp, PairioServiceComputeClient, PairioUser, ResetUserApiKeyResponse, SetServiceAppInfoResponse, SetUserInfoResponse, isAddServiceAppRequest, isAddUserRequest, isCancelJobRequest, isCreateJobRequest, isCreateServiceComputeClientRequest, isDeleteServiceAppRequest, isDeleteServiceComputeClientRequest, isGetJobRequest, isGetJobsRequest, isGetServiceAppRequest, isGetServiceAppsRequest, isGetServiceComputeClientRequest, isGetServiceComputeClientsRequest, isGetSignedUploadUrlRequest, isPairioJob, isPairioService, isPairioServiceApp, isPairioServiceComputeClient, isPairioUser, isResetUserApiKeyRequest, isSetJobStatusRequest, isSetServiceAppInfoRequest, isSetUserInfoRequest } from "./types.js"; // remove .js for local dev

const TEMPORY_ACCESS_TOKEN = process.env.TEMPORY_ACCESS_TOKEN;
if (!TEMPORY_ACCESS_TOKEN) {
    throw new Error("TEMPORY_ACCESS_TOKEN is not set");
}

const dbName = 'pairio';

const collectionNames = {
    users: 'users',
    services: 'services',
    serviceApps: 'serviceApps',
    serviceComputeClients: 'serviceComputeClients',
    jobs: 'jobs'
};

// addServiceApp handler
export const addServiceAppHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isAddServiceAppRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    const serviceName = rr.app.serviceName;
    const service = await fetchService(serviceName);
    if (!service) {
        res.status(404).json({ error: "Service not found" });
        return;
    }
    const app = rr.app;
    const gitHubAccessToken = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!(await authenticateGitHubUser(service.userId, gitHubAccessToken))) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        await insertServiceApp(app);
        const resp: AddServiceAppResponse = {
            type: 'addServiceAppResponse'
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
    if (!(await authenticateGitHubUser(rr.user.userId, githubAccessToken))) {
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
    if (!(await authenticateGitHubUser(rr.userId, githubAccessToken))) {
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
    if (!(await authenticateGitHubUser(rr.userId, githubAccessToken))) {
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
    try {
        const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateUser(rr.userId, authorizationToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const app = await fetchServiceApp(rr.serviceName, rr.jobDefinition.appName)
        if (!app) {
            res.status(404).json({ error: "Service app not found" });
            return;
        }
        // todo
        if ((!app.jobCreateUsers.includes(rr.userId)) && (!app.jobCreateUsers.includes('*'))) {
            res.status(401).json({ error: "This user is not allowed to create jobs for this app" });
            return;
        }

        const jobId = generateJobId();
        const jobPrivateKey = generateJobPrivateKey();

        for (const outputFile of rr.jobDefinition.outputFiles) {
            if (outputFile.url) {
                throw Error('Output file url should not be set');
            }
            outputFile.url = await createOutputFileUrl({ serviceName: rr.serviceName, appName: rr.jobDefinition.appName, processorName: rr.jobDefinition.processorName, jobId, outputName: outputFile.name, outputFileBaseName: outputFile.fileBaseName });
        }
        const consoleOutputUrl = await createOutputFileUrl({ serviceName: rr.serviceName, appName: rr.jobDefinition.appName, processorName: rr.jobDefinition.processorName, jobId, outputName: 'console_output', outputFileBaseName: 'output.txt' });
        const resourceUtilizationLogUrl = await createOutputFileUrl({ serviceName: rr.serviceName, appName: rr.jobDefinition.appName, processorName: rr.jobDefinition.processorName, jobId, outputName: 'resource_utilization_log', outputFileBaseName: 'log.jsonl' });

        const job: PairioJob = {
            jobId,
            jobPrivateKey,
            serviceName: rr.serviceName,
            userId: rr.userId,
            batchId: rr.batchId,
            projectName: rr.projectName,
            jobDefinition: rr.jobDefinition,
            jobDefinitionHash: JSONStringifyDeterministic(rr.jobDefinition),
            requiredResources: rr.requiredResources,
            secrets: rr.secrets,
            inputFileUrls: rr.jobDefinition.inputFiles.map(f => f.url),
            outputFileUrls: rr.jobDefinition.outputFiles.map(f => f.url),
            consoleOutputUrl,
            resourceUtilizationLogUrl,
            timestampCreatedSec: Date.now() / 1000,
            timestampStartedSec: null,
            timestampFinishedSec: null,
            canceled: false,
            status: 'pending',
            error: null,
            computeClientId: null,
            computeSlot: null,
            imageUri: null
        }
        await insertJob(job);
        const resp: CreateJobResponse = {
            type: 'createJobResponse',
            jobId
        };
        res.status(200).json(resp);
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
        else if ((rr.serviceName) && (rr.appName)) {
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
        if (rr.serviceName) query['serviceName'] = rr.serviceName;
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
        const computeClientId = rr.computeClientId;
        const authorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateComputeClient(computeClientId, authorizationToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const jobs = await fetchJobs({ jobId: rr.jobId });
        if (jobs.length === 0) {
            res.status(404).json({ error: "Job not found" });
            return;
        }
        const job = jobs[0]
        const computeClient = await fetchServiceComputeClient(computeClientId);
        if (!computeClient) {
            res.status(404).json({ error: "Compute client not found" });
            return;
        }
        const computeClientUserId = computeClient.userId;
        const app = await fetchServiceApp(job.serviceName, job.jobDefinition.appName);
        if (!app) {
            res.status(404).json({ error: "App not found" });
            return;
        }
        // todo
        if (!app.jobProcessUsers.includes(computeClientUserId)) {
            res.status(401).json({ error: "This compute client is not allowed to process jobs for this app" });
            return;
        }
        if (rr.status === 'running') {
            if (job.status !== 'pending') {
                res.status(400).json({ error: "Job is not in pending status" });
                return;
            }
            if (job.computeClientId) {
                res.status(400).json({ error: "Job already has a compute client" });
                return;
            }
            await atomicUpdateJob(rr.jobId, 'pending', { status: 'running', computeClientId, timestampStartedSec: Date.now() / 1000 });
        }
        else if (rr.status === 'completed' || rr.status === 'failed') {
            if (job.status !== 'running') {
                res.status(400).json({ error: "Job is not in running status" });
                return;
            }
            if (job.computeClientId !== computeClientId) {
                res.status(401).json({ error: "Mismatch between computeClientId in request and job" });
                return;
            }
            if (rr.status === 'completed') {
                if (rr.error) {
                    res.status(400).json({ error: "Error should not be set for completed job" });
                    return;
                }
            }
            else if (rr.status === 'failed') {
                if (!rr.error) {
                    res.status(400).json({ error: "Error must be set for failed job" });
                    return;
                }
            }
            await updateJob(rr.jobId, { status: rr.status, error: rr.error, timestampFinishedSec: Date.now() / 1000 })
        }
        else {
            res.status(400).json({ error: "Invalid status" });
            return;
        }
        const resp: CreateJobResponse = {
            type: 'createJobResponse',
            jobId: rr.jobId
        };
        res.status(200).json(resp);
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
        const signedUrl = await createSignedUploadUrl({ url: rr.url, size: rr.size, userId: job.userId });
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

// deleteServiceComputeClient handler
export const deleteServiceComputeClientHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isDeleteServiceComputeClientRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const computeClient = await fetchServiceComputeClient(rr.computeClientId);
        if (!computeClient) {
            res.status(404).json({ error: "Compute client not found" });
            return;
        }
        const gitHubAccessToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateGitHubUser(computeClient.userId, gitHubAccessToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        await deleteServiceComputeClient(rr.computeClientId);
        const resp: DeleteServiceComputeClientResponse = {
            type: 'deleteServiceComputeClientResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// createServiceComputeClient handler
export const createServiceComputeClientHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isCreateServiceComputeClientRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    const gitHubAccessToken = req.headers.authorization?.split(" ")[1]; // Extract the token
    if (!(await authenticateGitHubUser(rr.userId, gitHubAccessToken))) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const computeClient: PairioServiceComputeClient = {
        userId: rr.userId,
        serviceName: rr.serviceName,
        computeClientId: generateComputeClientId(),
        computeClientPrivateKey: generateComputeClientPrivateKey(),
        label: '',
        description: '',
        computeSlots: []
    };
    try {
        await insertServiceComputeClient(computeClient);
        const resp: CreateServiceComputeClientResponse = {
            type: 'createServiceComputeClientResponse',
            computeClientId: computeClient.computeClientId,
            computeClientPrivateKey: computeClient.computeClientPrivateKey || '' // should not be null
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getServiceComputeClient handler
export const getServiceComputeClientHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetServiceComputeClientRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const computeClient = await fetchServiceComputeClient(rr.computeClientId);
        if (!computeClient) {
            res.status(404).json({ error: "Compute client not found" });
            return;
        }
        // hide the private key
        computeClient.computeClientPrivateKey = null;
        const resp: GetServiceComputeClientResponse = {
            type: 'getServiceComputeClientResponse',
            computeClient
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getServiceComputeClients handler
export const getServiceComputeClientsHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetServiceComputeClientsRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        if (rr.userId) {
            if (rr.serviceName) {
                res.status(400).json({ error: "Cannot specify both userId and serviceName in request" });
                return;

            }
            const computeClients = await fetchServiceComputeClientsForUser(rr.userId);
            // hide the private keys
            for (const computeClient of computeClients) {
                computeClient.computeClientPrivateKey = null;
            }
            const resp: GetServiceComputeClientsResponse = {
                type: 'getServiceComputeClientsResponse',
                computeClients
            };
            res.status(200).json(resp);
        }
        else if (rr.serviceName) {
            const computeClients = await fetchServiceComputeClientsForService(rr.serviceName);
            // hide the private keys
            for (const computeClient of computeClients) {
                computeClient.computeClientPrivateKey = null;
            }
            const resp: GetServiceComputeClientsResponse = {
                type: 'getServiceComputeClientsResponse',
                computeClients
            };
            res.status(200).json(resp);
        }
        else {
            res.status(400).json({ error: "Must specify either userId or serviceName in request" });
            return;
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// setServiceAppInfo handler
export const setServiceAppInfoHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isSetServiceAppInfoRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const service = await fetchService(rr.serviceName);
        if (!service) {
            res.status(404).json({ error: "Service not found" });
            return;
        }
        const githubAccessToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateGitHubUser(service.userId, githubAccessToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const update: { [key: string]: any } = {};
        if (rr.description !== undefined) update['description'] = rr.description;
        if (rr.appSpecificationUri !== undefined) update['appSpecificationUri'] = rr.appSpecificationUri;
        if (rr.appSpecificationCommit !== undefined) update['appSpecificationCommit'] = rr.appSpecificationCommit;
        if (rr.processors !== undefined) update['processors'] = rr.processors;
        await updateServiceApp(rr.serviceName, rr.appName, update);
        const resp: SetServiceAppInfoResponse = {
            type: 'setServiceAppInfoResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getServiceApp handler
export const getServiceAppHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isGetServiceAppRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const app = await fetchServiceApp(rr.serviceName, rr.appName);
        if (!app) {
            res.status(404).json({ error: "App not found" });
            return;
        }
        const resp: GetServiceAppResponse = {
            type: 'getServiceAppResponse',
            app
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// deleteServiceApp handler
export const deleteServiceAppHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    if (!isDeleteServiceAppRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        const service = await fetchService(rr.serviceName);
        if (!service) {
            res.status(404).json({ error: "Service not found" });
            return;
        }
        const gitHubAuthorizationToken = req.headers.authorization?.split(" ")[1]; // Extract the token
        if (!(await authenticateGitHubUser(service.userId, gitHubAuthorizationToken))) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const app = await fetchServiceApp(rr.serviceName, rr.appName);
        if (!app) {
            res.status(404).json({ error: "Service app not found" });
            return;
        }
        await deleteServiceApp(rr.serviceName, rr.appName);
        const resp: DeleteServiceAppResponse = {
            type: 'deleteServiceAppResponse'
        };
        res.status(200).json(resp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// getServiceApps handler
export const getServiceAppsHandler = allowCors(async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const rr = req.body;
    console.log('---- rr', rr)
    if (!isGetServiceAppsRequest(rr)) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }
    try {
        if (rr.appName) {
            if (rr.serviceName) {
                res.status(400).json({ error: "Cannot specify both appName and serviceName in request" });
                return;
            }
            const apps = await fetchServiceAppsForAppName(rr.appName);
            const resp: GetServiceAppsResponse = {
                type: 'getServiceAppsResponse',
                apps
            };
            res.status(200).json(resp);
        }
        else if (rr.serviceName) {
            const apps = await fetchServiceAppsForServiceName(rr.serviceName);
            const resp: GetServiceAppsResponse = {
                type: 'getServiceAppsResponse',
                apps
            };
            res.status(200).json(resp);
        }
        else {
            res.status(400).json({ error: "Must specify either appName or serviceName in request" });
            return;

        }
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

const authenticateGitHubUser = async (userId: string, gitHubAccessToken: string | undefined): Promise<boolean> => {
    if (!gitHubAccessToken) return false;
    const githubUserId = await getUserIdForGitHubAccessToken(gitHubAccessToken);
    return userId === `github|${githubUserId}`;
}

const fetchService = async (serviceName: string): Promise<PairioService | null> => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.services);
    const service = await collection.findOne({ serviceName });
    if (!service) return null;
    removeMongoId(service);
    if (!isPairioService(service)) {
        throw Error('Invalid service in database');
    }
    return service;
}

const fetchUser = async (userId: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.users);
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
    const collection = client.db(dbName).collection(collectionNames.users);
    await collection.insertOne(user);
}

const updateUser = async (userId: string, update: any) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.users);
    await collection
        .updateOne({ userId }, { $set: update });
}

const insertServiceApp = async (app: PairioServiceApp) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceApps);
    await collection.insertOne(app);
}

const fetchServiceApp = async (serviceName: string, appName: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceApps);
    const app = await collection.findOne({ serviceName, appName });
    if (!app) return null;
    removeMongoId(app);
    if (!isPairioServiceApp(app)) {
        throw Error('Invalid service app in database');
    }
    return app;
}

const fetchServiceAppsForAppName = async (appName: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceApps);
    const apps = await collection.find({ appName }).toArray();
    for (const app of apps) {
        removeMongoId(app);
        if (!isPairioServiceApp(app)) {
            throw Error('Invalid service app in database');
        }
    }
    return apps.map((app: any) => app as PairioServiceApp);
}

const fetchServiceAppsForServiceName = async (serviceName: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceApps);
    const apps = await collection.find({ serviceName }).toArray();
    for (const app of apps) {
        removeMongoId(app);
        if (!isPairioServiceApp(app)) {
            throw Error('Invalid service app in database');
        }
    }
    return apps.map((app: any) => app as PairioServiceApp);
}

const updateServiceApp = async (serviceName: string, appName: string, update: any) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceApps);
    await collection
        .updateOne({ serviceName, appName }, { $set: update });
}

const deleteServiceApp = async (serviceName: string, appName: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceApps);
    await collection.deleteOne({ serviceName, appName });
}

const fetchJobs = async (query: { [key: string]: any }) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.jobs);
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
    const collection = client.db(dbName).collection(collectionNames.jobs);
    await collection.updateOne({
        jobId
    }, {
        $set: update
    });
}

const atomicUpdateJob = async (jobId: string, oldStatus: string, update: any) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.jobs);
    // QUESTION: is this going to be atomic?
    // Like if two requests come in at the same time, will one of them fail?
    const result = await collection.updateOne({
        jobId,
        status: oldStatus
    }, {
        $set: update
    });
    if (result.modifiedCount !== 1) {
        throw Error('Failed to update job');
    }
}

const insertJob = async (job: PairioJob) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.jobs);
    await collection.insertOne(job);
}

const insertServiceComputeClient = async (computeClient: PairioServiceComputeClient) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceComputeClients);
    await collection.insertOne(computeClient);
}

const fetchServiceComputeClient = async (computeClientId: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceComputeClients);
    const computeClient = await collection.findOne({ computeClientId });
    if (!computeClient) return null;
    removeMongoId(computeClient);
    if (!isPairioServiceComputeClient(computeClient)) {
        throw Error('Invalid compute client in database');
    }
    return computeClient;
}

const fetchServiceComputeClientsForUser = async (userId: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceComputeClients);
    const computeClients = await collection.find({ userId }).toArray();
    for (const computeClient of computeClients) {
        removeMongoId(computeClient);
        if (!isPairioServiceComputeClient(computeClient)) {
            throw Error('Invalid compute client in database');
        }
    }
    return computeClients.map((computeClient: any) => computeClient as PairioServiceComputeClient);
}

const fetchServiceComputeClientsForService = async (serviceName: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceComputeClients);
    const computeClients = await collection.find({ serviceName }).toArray();
    for (const computeClient of computeClients) {
        removeMongoId(computeClient);
        if (!isPairioServiceComputeClient(computeClient)) {
            throw Error('Invalid compute client in database');
        }
    }
    return computeClients.map((computeClient: any) => computeClient as PairioServiceComputeClient);
}

const deleteServiceComputeClient = async (computeClientId: string) => {
    const client = await getMongoClient();
    const collection = client.db(dbName).collection(collectionNames.serviceComputeClients);
    await collection.deleteOne({ computeClientId });
}

const authenticateComputeClient = async (computeClientId: string, authorizationToken: string | undefined): Promise<boolean> => {
    const computeClient = await fetchServiceComputeClient(computeClientId);
    if (!computeClient) return false;
    if (computeClient.computeClientPrivateKey !== authorizationToken) return false;
    return true;
}

const removeMongoId = (x: any) => {
    if (x === null) return;
    if (typeof x !== 'object') return;
    if ('_id' in x) delete x['_id'];
}

const gitHubUserIdCache: { [accessToken: string]: string } = {};
const getUserIdForGitHubAccessToken = async (gitHubAccessToken: string) => {
    if (gitHubUserIdCache[gitHubAccessToken]) {
        return gitHubUserIdCache[gitHubAccessToken];
    }

    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `token ${gitHubAccessToken}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to get user id');
    }

    const data = await response.json();
    const userId = data.login;
    gitHubUserIdCache[gitHubAccessToken] = userId;
    return userId;
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

const createSignedUploadUrl = async (o: { url: string, size: number, userId: string }) => {
    const { url, size, userId } = o;
    const prefix = `https://tempory.net/f/pairio/`;
    if (!url.startsWith(prefix)) {
        throw Error('Invalid url. Does not have proper prefix');
    }
    const filePath = url.slice(prefix.length);
    const temporyApiUrl = 'https://hub.tempory.net/api/uploadFile'
    const response = await fetch(temporyApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TEMPORY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            appName: "pairio",
            filePath,
            size,
            userId
        }),
    });
    if (!response.ok) {
        throw Error('Failed to get signed url');
    }
    const result = await response.json();
    const { uploadUrl, downloadUrl } = result;
    if (downloadUrl !== url) {
        throw Error('Mismatch between download url and url');
    }
    return uploadUrl;
}

const generateJobId = () => {
    return generateRandomId(20);
}

const generateJobPrivateKey = () => {
    return generateRandomId(32);
}

const createOutputFileUrl = async (a: { serviceName: string, appName: string, processorName: string, jobId: string, outputName: string, outputFileBaseName: string }) => {
    const { serviceName, appName, processorName, jobId, outputName, outputFileBaseName } = a;
    return `https://tempory.net/f/pairio/f/${serviceName}/${appName}/${processorName}/${jobId}/${outputName}/${outputFileBaseName}`;
}

// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: any, space: string | number | undefined =undefined ) => {
    const allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}