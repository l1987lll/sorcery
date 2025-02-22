/**
 * Encodes a string as base64
 * @param {string} str - the string to encode
 * @returns {string}
 */
export default function btoa(str) {
	return new Buffer.from(str).toString('base64');
}