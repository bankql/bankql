import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/start/server";

export default createStartHandler(defaultStreamHandler);
