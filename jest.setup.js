import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for ReadableStream and MessagePort
const { ReadableStream } = require('stream/web');
global.ReadableStream = ReadableStream;

// Polyfill for MessagePort
const { MessageChannel } = require('worker_threads');
if (MessageChannel && MessageChannel.prototype.port1) {
  global.MessagePort = MessageChannel.prototype.port1.constructor;
} else {
  // 简单的MessagePort模拟
  global.MessagePort = class MessagePort {
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
    close() {}
  };
}