const Logger = require("../../lib/logger");

describe("Logger", () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleDebugSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe("info", () => {
    it("should log info with a message and a metadata object when debug mode is enabled", () => {
      // GIVEN a logger with debug mode enabled
      const logger = new Logger({ debug: true });
      // WHEN the info method is called
      logger.info("Test info message", { foo: "bar" });
      // THEN it should call console.log with the expected message
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"info"'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"Test info message"'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"foo":"bar"'));
    });
    it("should log info with only a message when debug mode is enabled", () => {
      // GIVEN a logger with debug mode enabled
      const logger = new Logger({ debug: true });
      // WHEN the info method is called
      logger.info("Test info message");
      // THEN it should call console.log with the expected message
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"info"'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"Test info message"'));
    });

    it("should not log info message when debug mode is disabled", () => {
      // GIVEN a logger with debug mode disabled
      const logger = new Logger();
      // WHEN the info method is called
      logger.info("Test info message", { foo: "bar" });
      // THEN it should not call console.log
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("error", () => {
    it("should log error with a message and a metadata object", () => {
      // GIVEN a logger
      const logger = new Logger();
      // WHEN the error method is called
      logger.error("Test error message", { foo: "bar" });
      // THEN it should call console.error with the expected message
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"error"'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"Test error message"'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"foo":"bar"'));
    });

    it("should log error with only a message when debug mode is disabled", () => {
      // GIVEN a logger
      const logger = new Logger();
      // WHEN the error method is called
      logger.error("Test error message");
      // THEN it should call console.error with the expected message
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"error"'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"Test error message"'));
    });
  });

  describe("debug", () => {
    it("should log debug with a message and a metadata object when debug mode is enabled", () => {
      // GIVEN a logger with debug mode enabled
      const logger = new Logger({ debug: true });
      // WHEN the debug method is called
      logger.debug("Test debug message", { foo: "bar" });
      // THEN it should call console.debug with the expected message
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"debug"'));
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"Test debug message"'));
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('"foo":"bar"'));
    });
    it("should log debug with only a message when debug mode is enabled", () => {
      // GIVEN a logger with debug mode enabled
      const logger = new Logger({ debug: true });
      // WHEN the debug method is called
      logger.debug("Test debug message");
      // THEN it should call console.debug with the expected message
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"debug"'));
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('"message":"Test debug message"'));
    });

    it("should not log debug message when debug mode is disabled", () => {
      // GIVEN a logger with debug mode disabled
      const logger = new Logger();
      // WHEN the debug method is called
      logger.debug("Test debug message", { foo: "bar" });
      // THEN it should not call console.debug
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });
});
