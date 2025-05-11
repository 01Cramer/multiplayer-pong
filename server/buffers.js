const fastBuffer = new ArrayBuffer(2);
const fastBufferView = new DataView(fastBuffer);
const roomBuffer = new ArrayBuffer(6);
const roomBufferView = new DataView(roomBuffer);

const frameBuffer = new ArrayBuffer(13);
const frameBufferView = new DataView(frameBuffer);
const resultBuffer = new ArrayBuffer(5);
const resultBufferView = new DataView(resultBuffer);

const commandType = Object.freeze
({
    CREATE_ROOM : 0,
    JOIN_ROOM : 1,
    PAGE_RELOAD : 2,
    START_GAME : 3,
    RESTART_GAME : 4,
    MOVE_PADDLE : 5,
    LOG : 6,
    GO_TO_ROOM : 7,
    FRAME_DATA : 8,
    RESULT_UPDATE : 9,
    GAME_STARTED : 10
});

module.exports = { fastBuffer, fastBufferView, roomBuffer, roomBufferView, frameBuffer, frameBufferView, resultBuffer, resultBufferView, commandType };