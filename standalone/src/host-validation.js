import {BlockList, isIP} from "node:net";
import dns from "node:dns/promises";

const blocked = new BlockList();

for (const [net, prefix] of [
    ["0.0.0.0", 8],        // "this" network
    ["10.0.0.0", 8],       // RFC1918
    ["100.64.0.0", 10],    // CGNAT (often internal in cloud setups)
    ["127.0.0.0", 8],      // loopback
    ["169.254.0.0", 16],   // link-local (incl. cloud metadata 169.254.169.254)
    ["172.16.0.0", 12],    // RFC1918
    ["192.0.0.0", 24],     // IETF protocol assignments
    ["192.168.0.0", 16],   // RFC1918
    ["198.18.0.0", 15],    // benchmarking
    ["224.0.0.0", 4],      // multicast
    ["240.0.0.0", 4],      // reserved + broadcast
]) blocked.addSubnet(net, prefix, "ipv4");

for (const [net, prefix] of [
    ["::", 128],           // unspecified
    ["::1", 128],          // loopback
    ["fc00::", 7],         // unique local (IPv6 "RFC1918")
    ["fe80::", 10],        // link-local
    ["ff00::", 8],         // multicast
]) blocked.addSubnet(net, prefix, "ipv6");

function isBlockedIp(address) {
    const family = isIP(address);
    return blocked.check(address, family === 6 ? "ipv6" : "ipv4");
}

export async function isPublicHost(hostname) {
    const ipv6BracketsRegex = /^\[|\]$/g;
    const host = hostname.replace(ipv6BracketsRegex, "");
    if (isIP(host)) {
        return !isBlockedIp(host);
    } else {
        const host_addresses = await dns.lookup(host, {all: true});
        for (const {address} of host_addresses) {
            if (isBlockedIp(address)) {
                return false;
            }
        }
        return true;
    }
}