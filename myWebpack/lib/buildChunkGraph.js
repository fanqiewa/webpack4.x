
// 提取模块信息
const extraceBlockInfoMap = compilation => {
	// 存储块信息的Map对象
  const blockInfoMap = new Map();

  // 迭代依赖
  const iteratorDependency = d => {
    // 获取依赖的引用
    const ref = compilation.getDependencyReference(currentModule, d);
    if (!ref) {
      return;
    }

    const refModule = ref.module;
    if (!refModule) {
      return;
    }
    if (ref.weak) {
      return;
    }

    blockInfoModules.add(refModule);
  }
  
	const iteratorBlockPrepare = b => {
		// TODO
	};
	let currentModule; // 当前模块
	let block; // 当前块
	let blockQueue; // 块队列
	let blockInfoModules; // 模块信息
	let blockInfoBlocks; // 块信息

  for (const module of compilation.module) {
    blockQueue = [module];
    currentModule = module;
    while (blockQueue.length > 0) {
      block = blockQueue.pop();
      blockInfoModules = new Set();
      blockInfoBlocks = [];

      if (block.variables) {
        // TODO
      }

      if (block.dependencies) {
        for (const dep of block.dependencies) iteratorDependency(dep);
      }

      if (block.blocks) {
        for (const b of block.blocks) iteratorBlockPrepare(b);
      }

      const blockInfo = {
        modules: blockInfoModules,
        blocks: blockInfoBlocks
      };
      blockInfoMap.set(block, blockInfo);
    }
  }
	return blockInfoMap;
}

// 访问（应用）modules
const visitModules = (
	compilation,
	inputChunkGroups,
	chunkGroupInfoMap,
	blockConnections,
	blocksWithNestedBlocks,
	allCreatedChunkGroups
) => {
	const logger = compilation.getLogger("webpack.buildChunkGraph.visitModules");
  const { namedChunkGroups } = compilation;

	// prepare准备开始时间
  logger.time("prepare");
	// block的信息map
	const blockInfoMap = extraceBlockInfoMap(compilation);

	const chunkGroupCounters = new Map();
  for (const chunkGroup of inputChunkGroups) {
    chunkGroupCounters.set(chunkGroup, {
      index: 0,
      index2: 0
    });
  }

	// 下一个释放出来的module的索引
  let nextFreeModuleIndex = 0;
  let nextFreeModuleIndex2 = 0;

  const blockChunkGroups = new Map();

  const ADD_AND_ENTER_MODULE = 0; // 添加入口模块类型
  const ENTER_MODULE = 1; // 入口类型
  const PROCESS_BLOCK = 2; // 处理块类型
  const LEAVE_MODULE = 3;

	// 累加chunk到队列中
  const reduceChunkGroupToQueueItem = (queue, chunkGroup) => {
    for (const chunk of chunkGroup.chunks) {
      const module = chunk.entryModule;
      queue.push({
        action: ENTER_MODULE,
        block: module,
        module,
        chunk,
        chunkGroup
      });
    } 
		chunkGroupInfoMap.set(chunkGroup, {
			chunkGroup,
			minAvailableModules: new Set(),
			minAvailableModulesOwned: true,
			availableModulesToBeMerged: [],
			skippedItems: [],
			resultingAvailableModules: undefined,
			children: undefined
		});
		return queue;
  }

  let queue = inputChunkGroups
    .reduce(reduceChunkGroupToQueueItem, [])
    .reverse();
  const queueConnect = new Map();
	const outdatedChunkGroupInfo = new Set();
	let queueDelayed = [];

	// prepare结束
	logger.timeEnd("prepare");

	let module;
	let chunk;
	let chunkGroup;
	let chunkGroupInfo;
	let block;
	let minAvailableModules;
	let skippedItems;
  const iteratorBlock = b => {
    // TODO
  }

  while (queue.length) {
		// visit访问开始
    logger.time("visiting");
    while (queue.length) {
      const queueItem = queue.pop();
      module = queueItem.module;
      block = queueItem.block;
      chunk = queueItem.chunk;
      if (chunkGroup !== queueItem.chunkGroup) {
        chunkGroup = queueItem.chunkGroup;
				chunkGroupInfo = chunkGroupInfoMap.get(chunkGroup);
				minAvailableModules = chunkGroupInfo.minAvailableModules;
				skippedItems = chunkGroupInfo.skippedItems;
      }
      
			// 模块操作类型
			switch (queueItem.action) {
				case ADD_AND_ENTER_MODULE: {
					if (minAvailableModules.has(module)) {
						skippedItems.push(queueItem);
						break;
					}
					if (chunk.addModule(module)) {
						module.addChunk(chunk);
					} else {
						break;
					}
        }
				// 入口类型
				case ENTER_MODULE: {
          if (chunkGroup !== undefined) {
            const index = chunkGroup.getModuleIndex(module);
						if (index === undefined) {
							chunkGroup.setModuleIndex(
								module,
								chunkGroupCounters.get(chunkGroup).index++
							);
						}
          }
					if (module.index === null) {
						module.index = nextFreeModuleIndex++;
					}
					queue.push({
						action: LEAVE_MODULE,
						block,
						module,
						chunk,
						chunkGroup
					});
        }
        case PROCESS_BLOCK: {
					// 获取预先准备好的块信息
					const blockInfo = blockInfoMap.get(block);
					// 跳过缓冲
					// 缓冲项目，因为顺序需要颠倒才能得到正确的指示
          const skipBuffer = [];
					const queueBuffer = [];

          for (const refModule of blockInfo.modules) {
						if (chunk.containsModule(refModule)) {
							continue;
						}
            if (minAvailableModules.has(refModule)) {
              // TODO
            }

            queueBuffer.push({
							action: ADD_AND_ENTER_MODULE,
							block: refModule,
							module: refModule,
							chunk,
							chunkGroup
            });
          }
					for (let i = skipBuffer.length - 1; i >= 0; i--) {
						skippedItems.push(skipBuffer[i]);
					}
					for (let i = queueBuffer.length - 1; i >= 0; i--) {
						queue.push(queueBuffer[i]);
					}

					for (const block of blockInfo.blocks) iteratorBlock(block);

					if (blockInfo.blocks.length > 0 && module !== block) {
						blocksWithNestedBlocks.add(block);
					}
					break;
        }
				case LEAVE_MODULE: {
					if (chunkGroup !== undefined) {
						const index = chunkGroup.getModuleIndex2(module);
						if (index === undefined) {
							chunkGroup.setModuleIndex2(
								module,
								chunkGroupCounters.get(chunkGroup).index2++
							);
						}
					}

					if (module.index2 === null) {
						module.index2 = nextFreeModuleIndex2++;
					}
					break;
				}
      }

    }
  }
	// visiting结束
  logger.timeEnd("visiting");

  
  while (queueConnect.size > 0) {
    // TODO
  }

  if (queue.length === 0) {
    const tempQueue = queue;
    queue = queueDelayed.reverse();
    queueDelayed = tempQueue;
  }
}

// 连接chunkGroups
const connectChunkGroups = (
	blocksWithNestedBlocks,
	blockConnections,
	chunkGroupInfoMap
) => {
  
	const areModulesAvailable = (chunkGroup, availableModules) => {
  }

  for (const [block, connections] of blockConnections) {
    // TODO
  }
}

// 清除未连接的Groups
const cleanupUnconnectedGroups = (compilation, allCreatedChunkGroups) => {
  for (const chunkGroup of allCreatedChunkGroups) {
    // TODO
  }
}

// 构建chunk图
const buildChunkGraph = (compilation, inputChunkGroups) => {
  const blockConnections = new Map();
	const allCreatedChunkGroups = new Set();
	const chunkGroupInfoMap = new Map();
	const blocksWithNestedBlocks = new Set();
	visitModules(
		compilation,
		inputChunkGroups,
		chunkGroupInfoMap,
		blockConnections,
		blocksWithNestedBlocks,
		allCreatedChunkGroups
	);

	connectChunkGroups(
		blocksWithNestedBlocks,
		blockConnections,
		chunkGroupInfoMap
	);

	cleanupUnconnectedGroups(compilation, allCreatedChunkGroups);
}
module.exports = buildChunkGraph;