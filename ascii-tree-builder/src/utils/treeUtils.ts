export const getIndentation = (content: string): number => {
  const match = content.match(/^ */);
  return match ? match[0].length : 0;
};

export const isLastInBranch = (index: number, rows: any[]): boolean => {
  const currentLevel = rows[index].level;
  for (let i = index + 1; i < rows.length; i++) {
    if (rows[i].level === currentLevel) {
      return false;
    }
    if (rows[i].level < currentLevel) {
      return true;
    }
  }
  return true;
};

export const canNodeIndentFurther = (currentIndex: number, rows: any[]): boolean => {
  // Can't indent the first item further.
  if (currentIndex === 0) return false;

  const currentLevel = rows[currentIndex].level;
  const prevLevel = rows[currentIndex - 1].level;

  // Ensure we don't indent under a file
  if (rows[currentIndex - 1].type === 'file' && currentLevel === prevLevel) return false;

  return currentLevel <= prevLevel;
};

export const generateAsciiPrefixForNode = (index: number, rows: any[]): string => {
  const level = rows[index].level;
  let prefix = '';
  for (let i = 0; i < level; i++) {
    // Add the appropriate prefix based on whether it's the last node in the branch at this level
    if (isLastInBranchAtLevel(index, i, rows)) {
      prefix += '    '; // Four spaces for last in branch at this level
    } else {
      prefix += '│   '; // Pipe and three spaces otherwise
    }
  }

  // Add the last branch prefix based on whether it is the last node at this level
  prefix += isLastInBranch(index, rows) ? '└── ' : '├── ';
  return prefix;
};

export const isLastInBranchAtLevel = (index: number, level: number, rows: any[]): boolean => {
  for (let i = index + 1; i < rows.length; i++) {
    if (rows[i].level === level) {
      return false;
    }
    if (rows[i].level < level) {
      return true;
    }
  }
  return true;
};
