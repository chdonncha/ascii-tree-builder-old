import { Row } from '../components/TreeBuilder';

export const SAMPLE_TREE_DATA: Row[] = [
  { id: '1', parentId: null, level: 0, content: 'Root/', isSelected: false, type: 'folder' },
  { id: '2', parentId: '1', level: 1, content: 'Documents/', isSelected: false, type: 'folder' },
  { id: '3', parentId: '2', level: 2, content: 'Reports/', isSelected: false, type: 'folder' },
  { id: '4', parentId: '3', level: 3, content: 'Monthly_Report.txt', isSelected: false, type: 'file' },
  { id: '5', parentId: '3', level: 3, content: 'Annual_Report.txt', isSelected: false, type: 'file' },
  { id: '6', parentId: '2', level: 2, content: 'Invoices/', isSelected: false, type: 'folder' },
  { id: '7', parentId: '1', level: 1, content: 'Media/', isSelected: false, type: 'folder' },
  { id: '8', parentId: '7', level: 2, content: 'Images/', isSelected: false, type: 'folder' },
  { id: '9', parentId: '8', level: 3, content: 'Profile_Picture.jpg', isSelected: false, type: 'file' },
  { id: '10', parentId: '8', level: 3, content: 'Banner.jpg', isSelected: false, type: 'file' },
  { id: '11', parentId: '7', level: 2, content: 'Videos/', isSelected: false, type: 'folder' },
  { id: '12', parentId: '11', level: 3, content: 'Intro_Video.mp4', isSelected: false, type: 'file' },
  { id: '13', parentId: '1', level: 1, content: 'Games/', isSelected: false, type: 'folder' },
  { id: '14', parentId: '13', level: 2, content: 'Retro/', isSelected: false, type: 'folder' },
  { id: '15', parentId: '14', level: 3, content: 'Doom', isSelected: false, type: 'file' },
  { id: '16', parentId: '14', level: 3, content: 'Quake', isSelected: false, type: 'file' },
];
