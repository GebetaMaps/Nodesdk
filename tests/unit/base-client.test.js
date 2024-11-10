const BaseClient = require("../../lib/base-client");
const constants = require("../../lib/constants");
const Logger = require("../../lib/logger");
const Validator = require("../../lib/validator");
const axios = require("axios");
const { NetworkError, AuthError, MapSDKError } = require("../../lib/errors");

// mock the logger class to instantiate successfully
jest.mock("../../lib/logger", () => {
	return jest.fn().mockImplementation((debug) => {
		return {
			info: jest.fn(),
			error: jest.fn(),
			debug: jest.fn(),
		};
	});
});

// mock the validator class to instantiate successfully
jest.mock("../../lib/validator", () => {
	return jest.fn().mockImplementation(() => {
		return {
			validateConfig: jest.fn(),
			validateOptions: jest.fn(),
		};
	});
});

//mock axios
jest.mock("axios");

describe("BaseClient", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
	describe("Constructor", () => {
		it("Should construct the base client successfully with an empty options object", () => {
			//GIVEN an empty options object
			const givenOptions = {};
			//WHEN the client is constructed with the given options object
			const client = new BaseClient(givenOptions);
			//THEN the client should be constructed successfully
			expect(client).toBeDefined();
			//AND the client should have the default options
			expect(client.config.timeout).toBe(constants.DEFAULT_TIMEOUT);
			expect(client.config.debug).toBe(undefined);
			// AND the logger should be instantiated successfully
			expect(Logger).toHaveBeenCalled();
			// AND the validator should be instantiated successfully
			expect(Validator).toHaveBeenCalled();
		});

		it("Should construct the base client successfully with custom options", () => {
			//GIVEN a custom api key, timeout and debug options
			const givenApiKey = "foo-key";
			const givenTimeout = 5000;
			const givenDebug = true;
			//WHEN the client is constructed with the given api key, timeout and debug
			const client = new BaseClient({
				timeout: givenTimeout,
				debug: givenDebug,
				apiKey: givenApiKey,
			});
			//THEN the client should be constructed successfully
			expect(client).toBeDefined();
			//AND the client should have the given options
			expect(client.config.timeout).toBe(givenTimeout);
			expect(client.config.debug).toBe(givenDebug);
			expect(client.config.apiKey).toBe(givenApiKey);
			// AND the logger should be instantiated successfully with the client's debug config
			expect(Logger).toHaveBeenCalledWith({ debug: givenDebug });
			// AND the validator should be instantiated successfully
			expect(Validator).toHaveBeenCalledWith();
		});
	});

	describe.each([
		["GET", undefined],
		["POST", { someData: "foo-post" }],
		["PUT", { someData: "foo-put" }],
		["PATCH", { someData: "foo-patch" }],
		["DELETE", undefined],
		["OPTIONS", undefined],
	])("API requests", (givenMethod, givenRequestData) => {
		it(`Should return the parsed response data when the ${givenMethod} request is successful with ${
			givenRequestData ? "data" : "no data"
		}`, async () => {
			// GIVEN a client constructed
			const givenClient = new BaseClient({ apiKey: "foo-key" });
			// AND axios is mocked to return a 200 status with a success result
			const givenMockResponse = {
				status: 200,
				data: { result: "success" },
			};
			axios.mockResolvedValueOnce(givenMockResponse);

			// WHEN the client makes a request to the given endpoint with the given method and data
			const givenEndpoint = "/foo-endpoint";
			const result = await givenClient.makeRequest(givenEndpoint, givenMethod, givenRequestData);

			// THEN the result should be the parsed response data
			expect(result).toEqual(givenMockResponse.data);
			// AND the axios request should have been made with the correct parameters
			expect(axios).toHaveBeenCalledWith(
				expect.objectContaining({
					method: givenMethod,
					url: constants.BASE_URL + givenEndpoint, // Should prepend the api base url to the endpoint
					data: givenRequestData ?? null, // Should add the request data to the request if it exists
				})
			);
			// AND a debug log should be made
			expect(givenClient.logger.debug).toHaveBeenCalledWith("Request successful", {
				endpoint: givenEndpoint,
				method: givenMethod,
				status: givenMockResponse.status,
			});
		});

		it("Should append the query parameters to the request", async () => {
			// GIVEN a client constructed
			const givenClient = new BaseClient({ apiKey: "foo-key" });
			// AND axios is mocked to return a 200 status with a success result
			const givenMockResponse = {
				status: 200,
				data: { result: "success" },
			};
			axios.mockResolvedValueOnce(givenMockResponse);

			// WHEN the client makes a request to the given endpoint with the given method and data
			const givenEndpoint = "/foo-endpoint";
			const givenQueryParams = { foo: "bar" };
			const result = await givenClient.makeRequest(givenEndpoint, givenMethod, givenRequestData, givenQueryParams);

			// THEN the result should be the parsed response data
			expect(result).toEqual(givenMockResponse.data);
			// AND the axios request should have been made with the correct parameters
			expect(axios).toHaveBeenCalledWith(
				expect.objectContaining({
					params: givenQueryParams,
				})
			);
		});

		it("Should include the correct headers in the request", async () => {
			// GIVEN a client constructed with an api key and custom headers
			const givenClient = new BaseClient({
				apiKey: "foo-key",
				headers: { "Custom-Header": "value" },
			});
			axios.mockResolvedValueOnce({ status: 200, data: {} });

			// WHEN the client makes a GET request to the given endpoint
			await givenClient.makeRequest("/test-endpoint", givenMethod, givenRequestData);

			// THEN the axios request should have the correct headers
			expect(axios).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						Authorization: `Bearer ${givenClient.config.apiKey}`, // Should add the api key to the headers as a bearer token
						"Content-Type": "application/json", // Should set the content type to json
						"X-SDK-Version": constants.SDK_VERSION, // Should add the sdk version to the headers
						"User-Agent": `MapSDK/${constants.SDK_VERSION} Node.js`, // Should add the user agent to the headers
						...givenClient.config.headers, // Should add any custom headers to the headers
					},
				})
			);
		});
	});

    describe("Error handling", () => {
        it("Should throw an error if the response code is not 200", async () => {
            // GIVEN a client is constructed
            const givenClient = new BaseClient({ apiKey: "foo-key" });
            // AND axios is mocked to return a 400 status with an error
            const givenErrorResponse = {
                status: 400,
                data: { error: { message: "foo-error" } },
            };
            axios.mockRejectedValueOnce(givenErrorResponse);

            // WHEN the client makes a GET request to the given endpoint
            // THEN the request should throw a NetworkError
            const givenEndpoint = "/test-endpoint";
            const givenMethod = "GET";
            await expect(givenClient.makeRequest(givenEndpoint, givenMethod)).rejects.toThrow();
        });

        describe.each([
            ["with some message",  "foo bar"],
            ["without any message", undefined],
        ])("Network Error handling", (_description, givenMessage) => {
            it(`Should throw NetworkError when no response is received ${_description}`, async () => {
                // GIVEN a client is constructed
                const givenClient = new BaseClient({ apiKey: "foo-key" });
                // AND axios is mocked to return a network error
                const networkError = {
                    request: {},
                    message: givenMessage ?? "Network Error",
                };
                axios.mockRejectedValueOnce(networkError);

                // WHEN the client makes a GET request to the given endpoint
                // THEN the request should throw a NetworkError
                const givenEndpoint = "/test-endpoint";
                const givenMethod = "GET";
                await expect(givenClient.makeRequest(givenEndpoint, givenMethod)).rejects.toThrow(
                    new NetworkError("Network request failed", {originalError: networkError.message})
                );
            });
            it(`Should throw a NetworkError when the request is not successful ${_description}`, async () => {
                // GIVEN a client is constructed
                const givenClient = new BaseClient({ apiKey: "foo-key" });
                // AND axios is mocked to return an error with a message
                const networkError = {
                    message: givenMessage ?? "Network Error",
                };
                axios.mockRejectedValueOnce(networkError);

                // WHEN the client makes a GET request to the given endpoint
                // THEN the request should throw a NetworkError
                const givenEndpoint = "/test-endpoint";
                const givenMethod = "GET";
                await expect(givenClient.makeRequest(givenEndpoint, givenMethod)).rejects.toThrow(
                    new NetworkError("Network request failed", {originalError: networkError.message})
                );
            });
        });
            

        describe.each([
            ["with some message",  "foo bar"],
            ["without any message", undefined],
        ])("Response Error handling", (_description, givenMessage) => {

            it(`Should throw Authentication Failed error for unauthorized requests (401) ${_description}`, async () => {
                // GIVEN a client is constructed with some key
                const givenClient = new BaseClient({ apiKey: "foo-key" });
                // AND axios is mocked to return a 401 status with an error
                const givenErrorResponse = {
                response: {
                    status: 401,
                    data: { error: {
                        message: givenMessage,
                        details: "foo-bar",
                    }}
                },
            };
            axios.mockRejectedValueOnce(givenErrorResponse);

            // WHEN the client makes a GET request to the given endpoint
            // THEN the request should throw an AuthError
            const givenEndpoint = "/test-endpoint";
            const givenMethod = "GET";
            await expect(givenClient.makeRequest(givenEndpoint, givenMethod)).rejects.toThrow(
                new AuthError(givenMessage ?? 'Authentication failed', givenErrorResponse.response.data.error.details)
            );
        });

            it(`Should throw Access forbidden error for requests that are forbidden (403) ${_description}`, async () => {
                // GIVEN a client is constructed with some key
                const givenClient = new BaseClient({ apiKey: "foo-key" });
                // AND axios is mocked to return a 403 status with an error
                const givenErrorResponse = {
                    response: {
                        status: 403,
                        data: { error: {
                            message: givenMessage,
                            details: "foo-bar",
                        }}
                    },
                };
                axios.mockRejectedValueOnce(givenErrorResponse);

                // WHEN the client makes a GET request to the given endpoint
                // THEN the request should throw an AuthError
                const givenEndpoint = "/test-endpoint";
                const givenMethod = "GET";
                await expect(givenClient.makeRequest(givenEndpoint, givenMethod)).rejects.toThrow(
                    new AuthError(givenMessage ?? 'Access forbidden', givenErrorResponse.response.data.error.details)
                );
            })

            it(`Should throw MapSDKError for rate limit exceeded (429) ${_description}`, async () => {
                // GIVEN a client is constructed with some key
                const givenClient = new BaseClient({ apiKey: "foo-key" });
                // AND axios is mocked to return a 429 status with an error
                const errorResponse = {
                    response: {
                        status: 429,
                        data: { error: {
                            message: givenMessage,
                            details: "foo-bar",
                        }}
                    },
                };
                axios.mockRejectedValueOnce(errorResponse);

                // WHEN the client makes a GET request to the given endpoint
                // THEN the request should throw a MapSDKError
                const givenEndpoint = "/test-endpoint";
                const givenMethod = "GET";
                await expect(givenClient.makeRequest(givenEndpoint, givenMethod)).rejects.toThrow(
                    new MapSDKError(
                        "RATE_LIMIT_EXCEEDED",
                        givenMessage ?? "Rate limit exceeded",
                        errorResponse.response.data.error.details
                    )
                );
            });

            it(`should throw a MapSDKError for unknown errors ${_description}`, async () => {
                // GIVEN a client is constructed
                const givenClient = new BaseClient({ apiKey: "foo-key" });
                // AND axios is mocked to return a 500 status with an error
                const errorResponse = {
                    response: {
                        status: 500,
                        data: { error: {
                            code: "foo-code",
                            message: givenMessage,
                            details: "foo-bar",
                        }}
                    },
                };
                axios.mockRejectedValueOnce(errorResponse);

                // WHEN the client makes a GET request to the given endpoint
                // THEN the request should throw a MapSDKError
                const givenEndpoint = "/test-endpoint";
                const givenMethod = "GET";
                await expect(givenClient.makeRequest(givenEndpoint, givenMethod)).rejects.toThrow(
                    new MapSDKError(errorResponse.response.data.code, givenMessage ?? "API request failed", errorResponse.status, errorResponse.response.data.error.details)
                );
            });
        });
    });

    it.each([
        ["default", undefined],
        ["custom", 5000],
    ])("Should respect the configured %s timeout", async (_description, givenTimeout) => {
        // Setup fake timers
        jest.useFakeTimers();

        // GIVEN a client is constructed with the given timeout
        const givenClient = new BaseClient({
        apiKey: "foo-key",
        timeout: givenTimeout,
        });

        // AND axios is mocked to return a resolved promise after the given timeout
        const givenMockResponse = { status: 200, data: {foo: "bar"} };
        axios.mockImplementationOnce(() => {
        return new Promise((resolve) => {
            // Use Jest's timer functions to resolve the promise after the timeout
            jest.advanceTimersByTime(givenTimeout ?? constants.DEFAULT_TIMEOUT);
            resolve(givenMockResponse);
        });
        });

        // WHEN the client makes a GET request to the given endpoint
        const givenEndpoint = "/test-endpoint";
        const actualPromise = givenClient.makeRequest(givenEndpoint, "GET");

        // THEN the axios request should have been made with the correct timeout
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
            timeout: givenTimeout ?? constants.DEFAULT_TIMEOUT,
            })
        );

        // AND after the timeout, the request should resolve
        await jest.runAllTimers(); // Run all pending timers
        await expect(actualPromise).resolves.toEqual(givenMockResponse.data);

        // Cleanup
        jest.useRealTimers();
    });
});
