

// 连接chunk
const connectChunkGroupAndChunk = (chunkGroup, chunk) => {
	if (chunkGroup.pushChunk(chunk)) {
		chunk.addGroup(chunkGroup);
	}
};
// 连接Module
const connectChunkAndModule = (chunk, module) => {
	if (module.addChunk(chunk)) {
		chunk.addModule(module);
	}
};



exports.connectChunkGroupAndChunk = connectChunkGroupAndChunk;
exports.connectChunkAndModule = connectChunkAndModule;