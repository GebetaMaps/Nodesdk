const { ValidationError } = require("../../lib/errors");
const Validator = require("../../lib/validator");

describe("Validator", () => {
	describe("validateLatLng", () => {
		it.each([
			["valid point", { latitude: 1, longitude: 1 }],
			["valid point with negative latitude", { latitude: -1, longitude: 1 }],
			["valid point with negative longitude", { latitude: 1, longitude: -1 }],
			["valid point with negative latitude and longitude", { latitude: -1, longitude: -1 }],
			["valid point with decimal latitude and longitude", { latitude: 1.1, longitude: 1.1 }],
			["valid point with negative decimal latitude and longitude", { latitude: -1.1, longitude: -1.1 }],
			["valid point at 0, 0", { latitude: 0, longitude: 0 }],
		])("should not throw an error if the point is a valid LatLng object", (_, value) => {
			// GIVEN a valid LatLng object
			const validator = new Validator();
			// WHEN the validateLatLng method is called
			// THEN it should not throw an error
			expect(() => validator.validateLatLng(value)).not.toThrow();
		});
		it.each([
			["point is a string", "not an object", "Invalid LatLng object"],
			["point is an array", [{ latitude: 1, longitude: 1 }], "Latitude and longitude must be numbers"], // technically arrays are objects :)
			["latitude not provided", { longitude: 1 }, "Latitude and longitude must be numbers"],
			["longitude not provided", { latitude: 1 }, "Latitude and longitude must be numbers"],
			["latitude not a number", { latitude: "not a number", longitude: 1 }, "Latitude and longitude must be numbers"],
			["longitude not a number", { latitude: 1, longitude: "not a number" }, "Latitude and longitude must be numbers"],
			["latitude out of range", { latitude: 91, longitude: 1 }, "Latitude must be between -90 and 90"],
			["longitude out of range", { latitude: 1, longitude: 181 }, "Longitude must be between -180 and 180"],
		])("should throw an error if the %s", (_, value, expectedError) => {
			// GIVEN a invalid LatLng object
			const validator = new Validator();
			// WHEN the validateLatLng method is called
			// THEN it should throw an error
			expect(() => validator.validateLatLng(value)).toThrow(new ValidationError(expectedError));
		});
	});
	describe("validateConfig", () => {
		// we're not testing what happens if the timeout is 0 or negative
		// if you pass 0, you disable the timeout and it will wait forever
		// if you pass negative, axios will probably throw an error (but thats on you)
		it("should not throw an error if the config is valid", () => {
			// GIVEN a valid config
			const validator = new Validator();
			// WHEN the validateConfig method is called
			// THEN it should not throw an error
			expect(() => validator.validateConfig({ apiKey: "foo-key", timeout: 10 })).not.toThrow();
		});
		it("should throw an error if the apiKey is not provided", () => {
			// GIVEN a config with no apiKey
			const validator = new Validator();
			// WHEN the validateConfig method is called
			// THEN it should throw an error
			expect(() => validator.validateConfig({})).toThrow(new ValidationError("API key is required"));
		});
		it("should throw an error if the timeout is not a number", () => {
			// GIVEN a config with a timeout that is not a number
			const validator = new Validator();
			// WHEN the validateConfig method is called
			// THEN it should throw an error
			expect(() =>
				validator.validateConfig({
					apiKey: "foo-key",
					timeout: "not a number",
				})
			).toThrow(new ValidationError("Timeout must be a number"));
		});
	});

	//TODO: (we dont seem to be using this anywhere)
	describe("validateOptions", () => {
		it("should not throw an error if the options are valid", () => {
			// GIVEN a valid options object and allowed options
			const validator = new Validator();
			const options = { foo: "bar", baz: "qux" };
			const allowedOptions = ["foo", "baz"];

			// WHEN the validateOptions method is called
			// THEN it should not throw an error
			expect(() => validator.validateOptions(options, allowedOptions)).not.toThrow();
		});

		it("should throw an error if the options contain invalid keys", () => {
			// GIVEN an options object with invalid keys and allowed options 
			const validator = new Validator();
			const options = { foo: "bar", invalid: "value" };
			const allowedOptions = ["foo", "baz"];

			// WHEN the validateOptions method is called
			// THEN it should throw a ValidationError with the invalid options
			expect(() => validator.validateOptions(options, allowedOptions))
				.toThrow(new ValidationError("Invalid options: invalid"));
		});
	});
});
