//log req in terminal
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 23);
    const status = res.statusCode;
    const color = status >= 500 ? "\x1b[31m" : status >= 400 ? "\x1b[33m" : "\x1b[32m";
    const reset = "\x1b[0m";

    console.log(`[${timestamp}] ${color}${status}${reset} ${req.method} ${req.originalUrl} - ${duration}ms`);
  });

  next();
};

export default requestLogger;
