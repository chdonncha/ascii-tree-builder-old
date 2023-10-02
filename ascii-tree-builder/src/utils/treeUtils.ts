export const getIndentation = (str: string): number => {
  const match = str.match(/^ */);
  return match ? match[0].length : 0;
};

export const isLastInBranch = (index: number, rows: any[]): boolean => {
  const currentIndentation = getIndentation(rows[index].content);
  for (let i = index + 1; i < rows.length; i++) {
    const nextIndentation = getIndentation(rows[i].content);
    if (nextIndentation === currentIndentation) {
      return false;
    }
    if (nextIndentation < currentIndentation) {
      return true;
    }
  }
  return true;
};

export const canNodeIndentFurther = (currentIndex: number, rows: any[]): boolean => {
  if (currentIndex === 0) return false;
  const currentIndentation = getIndentation(rows[currentIndex].content);
  const prevIndentation = getIndentation(rows[currentIndex - 1].content);
  return currentIndentation <= prevIndentation;
};

export const generateAsciiPrefixForNode = (index: number, rows: any[]): string => {
  const currentIndentation = getIndentation(rows[index].content);
  if (index === 0) {
    return '└── ';
  }
  let prefix = '';
  for (let i = 0; i < currentIndentation / 2; i++) {
    if (isLastInBranchAtLevel(index, i * 2, rows)) {
      prefix += '    '; // Four spaces
    } else {
      prefix += '│   ';
    }
  }
  const isLastAtThisLevel = isLastInBranch(index, rows);
  prefix += isLastAtThisLevel ? '└── ' : '├── ';
  return prefix;
};

export const isLastInBranchAtLevel = (index: number, level: number, rows: any[]): boolean => {
  const currentIndentation = getIndentation(rows[index].content);
  if (level >= currentIndentation) {
    return isLastInBranch(index, rows);
  }
  for (let i = index + 1; i < rows.length; i++) {
    const nextIndentation = getIndentation(rows[i].content);
    if (nextIndentation === level) {
      return false;
    }
    if (nextIndentation < level) {
      return true;
    }
  }
  return true;
};
