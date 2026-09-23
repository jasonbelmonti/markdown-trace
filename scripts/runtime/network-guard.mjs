// Test-only preload. Runtime candidates do not contain or depend on this guard.
import net from "node:net";
import tls from "node:tls";
import http from "node:http";
import https from "node:https";
import dgram from "node:dgram";
import dns from "node:dns";
import { syncBuiltinESMExports } from "node:module";
const denied = () => { throw new Error("Artifact proof forbids network access"); };
net.connect = net.createConnection = net.Socket.prototype.connect = denied;
net.Server.prototype.listen = denied;
tls.connect = http.request = http.get = https.request = https.get = denied;
dgram.createSocket = denied;
dns.lookup = dns.resolve = denied;
globalThis.fetch = globalThis.WebSocket = denied;
syncBuiltinESMExports();
