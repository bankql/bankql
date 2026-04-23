import { app } from "@azure/functions";

app.setup({ enableHttpStream: true });

import "./functions/hello.js";
import "./functions/chat.js";
