import { Row } from '../components/TreeBuilder'; // Replace with the actual relative path to your TreeBuilder component

export const SAMPLE_TREE_DATA: Row[] = [
  { content: 'Root/', isSelected: false, type: 'folder' },
  { content: '  Documents/', isSelected: false, type: 'folder' },
  { content: '    Reports/', isSelected: false, type: 'folder' },
  { content: '      Monthly_Report.txt', isSelected: false, type: 'file' },
  { content: '      Annual_Report.txt', isSelected: false, type: 'file' },
  { content: '    Invoices/', isSelected: false, type: 'folder' },
  { content: '  Media/', isSelected: false, type: 'folder' },
  { content: '    Images/', isSelected: false, type: 'folder' },
  { content: '      Profile_Picture.jpg', isSelected: false, type: 'file' },
  { content: '      Banner.jpg', isSelected: false, type: 'file' },
  { content: '    Videos/', isSelected: false, type: 'folder' },
  { content: '      Intro_Video.mp4', isSelected: false, type: 'file' },
  { content: '  Games/', isSelected: false, type: 'folder' },
  { content: '    Retro/', isSelected: false, type: 'folder' },
  { content: '      Doom', isSelected: false, type: 'file' },
  { content: '      Quake', isSelected: false, type: 'file' },
];
