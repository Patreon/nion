let counts, hooks;

function reset() {
  hooks = { dataKeys: [], declarations: [], totalCalls: 0 };
  counts = {};
}

reset();

function sortCallsDesc(a, b) {
  if (a.calls > b.calls) return -1;

  if (b.calls < a.calls) return 1;

  return 0;
}

function sortDataKeysAsc(a, b) {
  const aKey = typeof a === 'string' ? a : a.dataKey;
  const bKey = typeof b === 'string' ? b : b.dataKey;

  if (aKey > bKey) return 1;

  if (bKey < aKey) return -1;

  return 0;
}

function NionHookCall(dataKey) {
  this['Calls'] = counts[dataKey]?.calls;

  this['Decl (orig)'] = counts[dataKey]?.declOrig;
  this['Decl'] = counts[dataKey]?.decl;

  this['Object'] = counts[dataKey]?.obj;
  this['Actions'] = counts[dataKey]?.actions;
  this['Request'] = counts[dataKey]?.request;
  this['Extra'] = counts[dataKey]?.extra;
}

function stats(filter, columns) {
  const data = {};

  if (typeof filter === 'string') {
    data[filter] = new NionHookCall(filter);
  } else {
    const minCalls = typeof filter === 'number' ? filter : 2;

    const keyCounts = Object.values(counts)
      .filter((key) => key.calls >= minCalls)
      .sort(sortCallsDesc);

    keyCounts.forEach((stat) => {
      data[stat.dataKey] = new NionHookCall(stat.dataKey);
    });
  }

  console.table(data, columns);
}

export const nionHookStats = {
  calledBy: (dataKey) => counts[dataKey]?.calledBy,
  dataKeys: () => {
    hooks.dataKeys.sort(sortDataKeysAsc);

    console.log(hooks.dataKeys);
  },
  declarations: () => {
    hooks.declarations.sort(sortDataKeysAsc);

    console.log(hooks.declarations);
  },
  info: () => {
    console.table({
      Calls: hooks.totalCalls,
      Declarations: hooks.declarations.length,
      Keys: hooks.dataKeys.length,
    });
  },
  reset,
  stats,
};

export function withStats(calledBy, decl, declOrig, props) {
  // Collect dataKey statistics

  const dataKey = decl?.dataKey;

  if (!counts[dataKey]) {
    counts[dataKey] = {
      dataKey,

      _last: {
        decl: undefined,
        declOrig: undefined,
        props: [],
      },

      calls: 0,
      calledBy: [],

      decl: -1,
      declOrig: -1,

      obj: -1,
      actions: -1,
      request: -1,
      extra: -1,
    };
  }

  counts[dataKey].calls++;

  if (counts[dataKey].calledBy.indexOf(calledBy) === -1) {
    counts[dataKey].calledBy.push(calledBy);
  }

  if (!Object.is(counts[dataKey]._last.decl, decl)) {
    counts[dataKey]._last.decl = decl;
    counts[dataKey].decl++;
  }

  if (!Object.is(counts[dataKey]._last.declOrig, declOrig)) {
    counts[dataKey]._last.declOrig = declOrig;
    counts[dataKey].declOrig++;
  }

  const lastProps = counts[dataKey]._last.props;

  if (lastProps) {
    if (!Object.is(lastProps[0], props[0])) {
      counts[dataKey].obj++;
    }

    if (!Object.is(lastProps[1], props[1])) {
      counts[dataKey].actions++;
    }

    if (!Object.is(lastProps[2], props[2])) {
      counts[dataKey].request++;
    }

    if (!Object.is(lastProps[3], props[3])) {
      counts[dataKey].extra++;
    }
  }

  counts[dataKey]._last.props = props;

  // Collect Nion statistics

  hooks.totalCalls++;

  if (hooks.dataKeys.indexOf(dataKey) === -1) {
    hooks.dataKeys.push(dataKey);
  }

  if (hooks.declarations.indexOf(declOrig) === -1) {
    hooks.declarations.push(declOrig);
  }

  return props;
}

export const prepareStackTrace = (error, stack) => {
  stack.component = stack[1].getFunctionName();

  return stack;
};
