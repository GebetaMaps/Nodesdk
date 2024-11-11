const MapService = require("../../lib/map-service");
const BaseClient = require("../../lib/base-client");
const Validator = require("../../lib/validator");
const { ValidationError } = require("../../lib/errors");

jest.mock("../../lib/validator");

describe("MapService", () => {
	let mapService;
	let makeRequestMock;

	beforeEach(() => {
		// Create a new instance of MapService for each test
		mapService = new MapService({ apiKey: "foo-key" });
	});

	afterEach(() => {
		// Restore the original implementation of makeRequest after each test
		makeRequestMock.mockRestore();
        jest.clearAllMocks();
	});

	describe("getDirections", () => {
		it.each([
			["only required parameters", undefined, undefined],
			["with one waypoint", [{ latitude: 1, longitude: 1 }], undefined],
			[
				"with multiple waypoints",
				[
					{ latitude: 1, longitude: 1 },
					{ latitude: 2, longitude: 2 },
				],
				undefined,
			],
			["with an empty array of waypoints", [], undefined],
			["with instruction", undefined, true],
			["with instruction (explicitly false)", undefined, false],
			[
				"with waypoints and instruction",
				[
					{ latitude: 1, longitude: 1 },
					{ latitude: 2, longitude: 2 },
				],
				true,
			],
		])(
			"Should successfully return a DirectionsResponse when called with %s",
			async (_, givenWaypoints, givenInstruction) => {
				// GIVEN the request origin and destination are valid
				jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
				// AND the base client's makeRequest method is mocked to return a response
				makeRequestMock = jest.spyOn(BaseClient.prototype, "makeRequest").mockResolvedValue({
					status: 200,
					data: {
						directions: [],
					},
				});

				// WHEN the getDirections method is called with required parameters
				const givenOrigin = {
					latitude: 1,
					longitude: 1,
				};
				const givenDestination = {
					latitude: 2,
					longitude: 2,
				};

				const result = await mapService.getDirections(givenOrigin, givenDestination, givenWaypoints, givenInstruction);

				// THEN the method calls the base client's makeRequest method with the correct parameters
				const expectedEndpoint = "/api/route/direction";
				const expectedParams = {
					// origin and destination are put into a stringified, comma separated object
					origin: `{${givenOrigin.latitude},${givenOrigin.longitude}}`,
					destination: `{${givenDestination.latitude},${givenDestination.longitude}}`,
					apiKey: "foo-key",
					// waypoints are transformed to the expected format
					waypoints: givenWaypoints
						? givenWaypoints.map((waypoint) => `{${waypoint.latitude},${waypoint.longitude}}`).join(",")
						: "",
					// instruction is transformed to either 1 (true) or 0 (false)
					instruction: givenInstruction ? 1 : 0,
				};
				const expectedMethod = "GET";
				// THEN the method calls the base client's makeRequest method with the correct parameters
				expect(makeRequestMock).toHaveBeenCalledWith(
					`${expectedEndpoint}/?${new URLSearchParams(expectedParams).toString()}`,
					expectedMethod
				);

				// AND the method returns a DirectionsResponse
				expect(result).toBeDefined();
			}
		);
		it.each([
			["origin", { latitude: 1, longitude: 1 }, { latitude: 2, longitude: 2 }],
			["destination", { latitude: 2, longitude: 2 }, { latitude: 1, longitude: 1 }],
		])(
			"Should throw the same error as the validator when the %s is invalid",
			async (_invalidParam, givenOrigin, givenDestination) => {
				// GIVEN the origin is invalid
				const givenError = new Error("Invalid latitude or longitude");
				jest.spyOn(Validator.prototype, "validateLatLng").mockImplementation((latLng) => {
					const failingParam = _invalidParam === "origin" ? givenOrigin : givenDestination;
					if (latLng === failingParam) {
						throw givenError;
					}
					return true;
				});
				// WHEN the getDirections method is called with the invalid origin or destination
				// THEN the method throws the same error as the validator
				await expect(mapService.getDirections(givenOrigin, givenDestination, undefined, undefined)).rejects.toThrow(
					givenError
				);
			}
		);
		it("Should throw an error when the base client's makeRequest method throws an error", async () => {
			// GIVEN the validator's validateLatLng method is mocked to succeed
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// AND the base client's makeRequest method throws an error
			const givenError = new Error("Request failed");
			jest.spyOn(BaseClient.prototype, "makeRequest").mockRejectedValue(givenError);
			// WHEN the getDirections method is called
			// THEN the method throws the same error as the base client's makeRequest method
			expect(
				mapService.getDirections({ latitude: 1, longitude: 1 }, { latitude: 2, longitude: 2 }, undefined, undefined)
			).rejects.toThrow(givenError);
		});
	});
	describe("getRouteMatrix", () => {
		it.each([
			["locations array with one location", [{ latitude: 1, longitude: 1 }]],
			[
				"locations array with multiple locations",
				[
					{ latitude: 1, longitude: 1 },
					{ latitude: 2, longitude: 2 },
				],
			],
		])("Should successfully return a RouteMatrixResponse when called with %s", async (_, givenLocations) => {
			// GIVEN the locations array is valid
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// AND the base client's makeRequest method is mocked to return a response
			makeRequestMock = jest.spyOn(BaseClient.prototype, "makeRequest").mockResolvedValue({
				status: 200,
				data: {
					routeMatrix: [],
				},
			});
			// WHEN the getRouteMatrix method is called with the given locations
			const result = await mapService.getRouteMatrix(givenLocations);
			// THEN the method calls the base client's makeRequest method with the correct parameters
			const expectedEndpoint = "/api/route/matrix";
			const expectedParams = {
				json: givenLocations.map((location) => `{${location.latitude},${location.longitude}}`).join(","),
				apiKey: "foo-key",
			};
			const expectedMethod = "GET";
			expect(makeRequestMock).toHaveBeenCalledWith(
				`${expectedEndpoint}/?${new URLSearchParams(expectedParams).toString()}`,
				expectedMethod
			);
			// AND the method returns a RouteMatrixResponse
			expect(result).toBeDefined();
		});
		it.each([
			["empty locations array", []],
			["not provided", undefined],
			["not an array", "not an array"],
		])("Should throw an error when %s is provided", async (_, givenLocations) => {
			// GIVEN the validator's validateLatLng method is mocked to succeed
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// WHEN the getRouteMatrix method is called with the given locations
			// THEN the method throws an error
			expect(mapService.getRouteMatrix(givenLocations)).rejects.toThrow(
				new ValidationError("getRouteMatrix: Invalid locations provided.", givenLocations)
			);
		});
		it("Should throw an error if one or more of the locations are invalid", async () => {
			// GIVEN the validator's validateLatLng method is mocked to fail
			const givenError = new Error("Invalid latitude or longitude");
			jest.spyOn(Validator.prototype, "validateLatLng").mockImplementationOnce(() => {
				throw givenError;
			});
			// WHEN the getRouteMatrix method is called
			// THEN the method throws an error
			expect(mapService.getRouteMatrix([{ latitude: 1, longitude: 1 }])).rejects.toThrow(givenError);
		});
		it("Should throw an error when the base client's makeRequest method throws an error", async () => {
			// GIVEN the validator's validateLatLng method is mocked to succeed
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// AND the base client's makeRequest method throws an error
			const givenError = new Error("Request failed");
			jest.spyOn(BaseClient.prototype, "makeRequest").mockRejectedValue(givenError);
			// WHEN the getRouteMatrix method is called
			// THEN the method throws the same error as the base client's makeRequest method
			expect(mapService.getRouteMatrix([{ latitude: 1, longitude: 1 }])).rejects.toThrow(givenError);
		});
	});
	describe("getRouteONM", () => {
		it.each([
			["origin and one location", { latitude: 1, longitude: 1 }, [{ latitude: 2, longitude: 2 }]],
			[
				"origin and multiple locations",
				{ latitude: 1, longitude: 1 },
				[
					{ latitude: 2, longitude: 2 },
					{ latitude: 3, longitude: 3 },
				],
			],
		])(
			"Should successfully return a RouteOnMatrixResponse when called with %s",
			async (_, givenOrigin, givenLocations) => {
				// GIVEN the request origin and locations are valid
				jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
				// AND the base client's makeRequest method is mocked to return a response
				makeRequestMock = jest.spyOn(BaseClient.prototype, "makeRequest").mockResolvedValue({
					status: 200,
					data: {
						routeOnMatrix: [],
					},
				});
				// WHEN the getRouteOnMatrix method is called with the given parameters
				const result = await mapService.getRouteONM(givenOrigin, givenLocations);
				// THEN the method calls the base client's makeRequest method with the correct parameters
				const expectedEndpoint = "/api/route/onm";
				const expectedParams = {
					origin: `{${givenOrigin.latitude},${givenOrigin.longitude}}`,
					json: givenLocations.map((location) => `{${location.latitude},${location.longitude}}`).join(","),
					apiKey: "foo-key",
				};
				const expectedMethod = "GET";
				expect(makeRequestMock).toHaveBeenCalledWith(
					`${expectedEndpoint}/?${new URLSearchParams(expectedParams).toString()}`,
					expectedMethod
				);
				// AND the method returns a RouteOnMatrixResponse
				expect(result).toBeDefined();
			}
		);
		it.each([
			["an empty locations array", []],
			["no locations provided", undefined],
			["not an array", "not an array"],
		])("Should throw an error when the locations array is %s", async (_, givenLocations) => {
			// GIVEN the validator's validateLatLng method is mocked to succeed
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// WHEN the getRouteONM method is called with the given parameters
			// THEN the method throws an error
			const givenOrigin = { latitude: 1, longitude: 1 };
			expect(mapService.getRouteONM(givenOrigin, givenLocations)).rejects.toThrow(
				new ValidationError("getRouteONM: Invalid locations provided.", {
					origin: givenOrigin,
					locations: givenLocations,
				})
			);
		});
		it("Should throw an error when the origin is invalid", async () => {
			// GIVEN the validator's validateLatLng method is mocked to fail
			const givenError = new Error("Invalid latitude or longitude");
			jest.spyOn(Validator.prototype, "validateLatLng").mockImplementationOnce(() => {
				throw givenError;
			});
			// WHEN the getRouteONM method is called
			// THEN the method throws an error
			expect(mapService.getRouteONM({ latitude: 1, longitude: 1 }, [{ latitude: 2, longitude: 2 }])).rejects.toThrow(
				givenError
			);
		});
		it("Should throw an error when one or more of the locations are invalid", async () => {
			// GIVEN the validator's validateLatLng method is mocked to fail
			const givenError = new Error("Invalid latitude or longitude");
			jest.spyOn(Validator.prototype, "validateLatLng").mockImplementationOnce(() => {
				throw givenError;
			});
			// WHEN the getRouteONM method is called
			// THEN the method throws an error
			expect(mapService.getRouteONM({ latitude: 1, longitude: 1 }, [{ latitude: 2, longitude: 2 }])).rejects.toThrow(
				givenError
			);
		});
		it("Should throw an error when the base client's makeRequest method throws an error", async () => {
			// GIVEN the validator's validateLatLng method is mocked to succeed
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// AND the base client's makeRequest method throws an error
			const givenError = new Error("Request failed");
			jest.spyOn(BaseClient.prototype, "makeRequest").mockRejectedValue(givenError);
			// WHEN the getRouteONM method is called
			// THEN the method throws the same error as the base client's makeRequest method
			expect(mapService.getRouteONM({ latitude: 1, longitude: 1 }, [{ latitude: 2, longitude: 2 }])).rejects.toThrow(
				givenError
			);
		});
	});
	describe("getRouteOptimization", () => {
		it.each([
			["one location", [{ latitude: 1, longitude: 1 }]],
			[
				"multiple locations",
				[
					{ latitude: 1, longitude: 1 },
					{ latitude: 2, longitude: 2 },
				],
			],
		])("Should successfully return a RouteOptimizationResponse when called with %s", async (_, givenLocations) => {
			// GIVEN the validator's validateLatLng method is mocked to succeed
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// AND the base client's makeRequest method is mocked to return a response
			makeRequestMock = jest.spyOn(BaseClient.prototype, "makeRequest").mockResolvedValue({
				status: 200,
				data: {
					routeOptimization: [],
				},
			});
			// WHEN the getRouteOptimization method is called with the given parameters
			const result = await mapService.getRouteOptimization(givenLocations);
			// THEN the method calls the base client's makeRequest method with the correct parameters
			const expectedEndpoint = "/api/route/tss";
			const expectedParams = {
				json: givenLocations.map((location) => `{${location.latitude},${location.longitude}}`).join(","),
				apiKey: "foo-key",
			};
			const expectedMethod = "GET";
			expect(makeRequestMock).toHaveBeenCalledWith(
				`${expectedEndpoint}/?${new URLSearchParams(expectedParams).toString()}`,
				expectedMethod
			);
			// AND the method returns a RouteOptimizationResponse
			expect(result).toBeDefined();
		});
		it.each([
			["an empty locations array", []],
			["not provided", undefined],
			["not an array", "not an array"],
		])("Should throw an error when the locations array is %s", async (_, givenLocations) => {
			// GIVEN the validator's validateLatLng method is mocked to succeed
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// WHEN the getRouteOptimization method is called with the given parameters
			// THEN the method throws an error
			expect(mapService.getRouteOptimization(givenLocations)).rejects.toThrow(
				new ValidationError("getRouteOptimization: Invalid locations provided.", givenLocations)
			);
		});
		it("Should throw an error when one or more of the locations are invalid", async () => {
			// GIVEN the validator's validateLatLng method is mocked to fail
			const givenError = new Error("Invalid latitude or longitude");
			jest.spyOn(Validator.prototype, "validateLatLng").mockImplementationOnce(() => {
				throw givenError;
			});
			// WHEN the getRouteOptimization method is called
			// THEN the method throws an error
			expect(mapService.getRouteOptimization([{ latitude: 1, longitude: 1 }])).rejects.toThrow(givenError);
		});
		it("Should throw an error when the base client's makeRequest method throws an error", async () => {
			// GIVEN the validator's validateLatLng method is mocked to succeed
			jest.spyOn(Validator.prototype, "validateLatLng").mockReturnValue(true);
			// AND the base client's makeRequest method throws an error
			const givenError = new Error("Request failed");
			jest.spyOn(BaseClient.prototype, "makeRequest").mockRejectedValue(givenError);
			// WHEN the getRouteOptimization method is called
			// THEN the method throws the same error as the base client's makeRequest method
			expect(mapService.getRouteOptimization([{ latitude: 1, longitude: 1 }])).rejects.toThrow(givenError);
		});
	});
});
