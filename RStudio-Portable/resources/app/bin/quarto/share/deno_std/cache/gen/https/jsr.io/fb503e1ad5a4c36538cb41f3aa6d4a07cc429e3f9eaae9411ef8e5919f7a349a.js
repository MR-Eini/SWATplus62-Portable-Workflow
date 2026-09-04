// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * **UNSTABLE**: New API, yet to be vetted.
 *
 * Gets the IPv4 or IPv6 network address of the machine.
 *
 * This is inspired by the util of the same name in
 * {@linkcode https://www.npmjs.com/package/serve | npm:serve}.
 *
 * For more advanced use, use {@linkcode Deno.networkInterfaces} directly.
 *
 * @see {@link https://github.com/vercel/serve/blob/1ea55b1b5004f468159b54775e4fb3090fedbb2b/source/utilities/http.ts#L33}
 *
 * @param family The IP protocol version of the interface to get the address of.
 * @returns The IPv4 network address of the machine.
 *
 * @example Get the IPv4 network address (default)
 * ```ts no-assert no-eval
 * import { getNetworkAddress } from "@std/net/get-network-address";
 *
 * const hostname = getNetworkAddress();
 *
 * Deno.serve({ port: 0, hostname }, () => new Response("Hello, world!"));
 * ```
 *
 * @example Get the IPv6 network address
 * ```ts no-assert no-eval
 * import { getNetworkAddress } from "@std/net/get-network-address";
 *
 * const hostname = getNetworkAddress("IPv6");
 *
 * Deno.serve({ port: 0, hostname }, () => new Response("Hello, world!"));
 * ```
 *
 * @experimental
 */ export function getNetworkAddress(family = "IPv4") {
  return Deno.networkInterfaces().find((i)=>i.family === family && (family === "IPv4" ? !i.address.startsWith("127") : !(i.address === "::1" || i.address === "fe80::1") && i.scopeid === 0))?.address;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvbmV0LzAuMjI0LjUvZ2V0X25ldHdvcmtfYWRkcmVzcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLyoqXG4gKiAqKlVOU1RBQkxFKio6IE5ldyBBUEksIHlldCB0byBiZSB2ZXR0ZWQuXG4gKlxuICogR2V0cyB0aGUgSVB2NCBvciBJUHY2IG5ldHdvcmsgYWRkcmVzcyBvZiB0aGUgbWFjaGluZS5cbiAqXG4gKiBUaGlzIGlzIGluc3BpcmVkIGJ5IHRoZSB1dGlsIG9mIHRoZSBzYW1lIG5hbWUgaW5cbiAqIHtAbGlua2NvZGUgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvc2VydmUgfCBucG06c2VydmV9LlxuICpcbiAqIEZvciBtb3JlIGFkdmFuY2VkIHVzZSwgdXNlIHtAbGlua2NvZGUgRGVuby5uZXR3b3JrSW50ZXJmYWNlc30gZGlyZWN0bHkuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3ZlcmNlbC9zZXJ2ZS9ibG9iLzFlYTU1YjFiNTAwNGY0NjgxNTliNTQ3NzVlNGZiMzA5MGZlZGJiMmIvc291cmNlL3V0aWxpdGllcy9odHRwLnRzI0wzM31cbiAqXG4gKiBAcGFyYW0gZmFtaWx5IFRoZSBJUCBwcm90b2NvbCB2ZXJzaW9uIG9mIHRoZSBpbnRlcmZhY2UgdG8gZ2V0IHRoZSBhZGRyZXNzIG9mLlxuICogQHJldHVybnMgVGhlIElQdjQgbmV0d29yayBhZGRyZXNzIG9mIHRoZSBtYWNoaW5lLlxuICpcbiAqIEBleGFtcGxlIEdldCB0aGUgSVB2NCBuZXR3b3JrIGFkZHJlc3MgKGRlZmF1bHQpXG4gKiBgYGB0cyBuby1hc3NlcnQgbm8tZXZhbFxuICogaW1wb3J0IHsgZ2V0TmV0d29ya0FkZHJlc3MgfSBmcm9tIFwiQHN0ZC9uZXQvZ2V0LW5ldHdvcmstYWRkcmVzc1wiO1xuICpcbiAqIGNvbnN0IGhvc3RuYW1lID0gZ2V0TmV0d29ya0FkZHJlc3MoKTtcbiAqXG4gKiBEZW5vLnNlcnZlKHsgcG9ydDogMCwgaG9zdG5hbWUgfSwgKCkgPT4gbmV3IFJlc3BvbnNlKFwiSGVsbG8sIHdvcmxkIVwiKSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZSBHZXQgdGhlIElQdjYgbmV0d29yayBhZGRyZXNzXG4gKiBgYGB0cyBuby1hc3NlcnQgbm8tZXZhbFxuICogaW1wb3J0IHsgZ2V0TmV0d29ya0FkZHJlc3MgfSBmcm9tIFwiQHN0ZC9uZXQvZ2V0LW5ldHdvcmstYWRkcmVzc1wiO1xuICpcbiAqIGNvbnN0IGhvc3RuYW1lID0gZ2V0TmV0d29ya0FkZHJlc3MoXCJJUHY2XCIpO1xuICpcbiAqIERlbm8uc2VydmUoeyBwb3J0OiAwLCBob3N0bmFtZSB9LCAoKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGQhXCIpKTtcbiAqIGBgYFxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5ldHdvcmtBZGRyZXNzKFxuICBmYW1pbHk6IERlbm8uTmV0d29ya0ludGVyZmFjZUluZm9bXCJmYW1pbHlcIl0gPSBcIklQdjRcIixcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBEZW5vLm5ldHdvcmtJbnRlcmZhY2VzKClcbiAgICAuZmluZCgoaSkgPT5cbiAgICAgIGkuZmFtaWx5ID09PSBmYW1pbHkgJiZcbiAgICAgIChmYW1pbHkgPT09IFwiSVB2NFwiXG4gICAgICAgIC8vIENhbm5vdCBsaWUgd2l0aGluIDEyNy4wLjAuMC84XG4gICAgICAgID8gIWkuYWRkcmVzcy5zdGFydHNXaXRoKFwiMTI3XCIpXG4gICAgICAgIC8vIENhbm5vdCBiZSBsb29wYmFjayBvciBsaW5rLWxvY2FsIGFkZHJlc3Nlc1xuICAgICAgICA6ICEoaS5hZGRyZXNzID09PSBcIjo6MVwiIHx8IGkuYWRkcmVzcyA9PT0gXCJmZTgwOjoxXCIpICYmIGkuc2NvcGVpZCA9PT0gMClcbiAgICApXG4gICAgPy5hZGRyZXNzO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtDQyxHQUNELE9BQU8sU0FBUyxrQkFDZCxTQUE4QyxNQUFNO0VBRXBELE9BQU8sS0FBSyxpQkFBaUIsR0FDMUIsSUFBSSxDQUFDLENBQUMsSUFDTCxFQUFFLE1BQU0sS0FBSyxVQUNiLENBQUMsV0FBVyxTQUVSLENBQUMsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLFNBRXRCLENBQUMsQ0FBQyxFQUFFLE9BQU8sS0FBSyxTQUFTLEVBQUUsT0FBTyxLQUFLLFNBQVMsS0FBSyxFQUFFLE9BQU8sS0FBSyxDQUFDLElBRXhFO0FBQ04ifQ==
// denoCacheMetadata=12408403069575466062,12321463488226826329