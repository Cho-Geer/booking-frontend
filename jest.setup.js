const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { ReadableStream } = require('stream/web');
global.ReadableStream = ReadableStream;

global.MessagePort = class MessagePort {
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  close() {}
};
