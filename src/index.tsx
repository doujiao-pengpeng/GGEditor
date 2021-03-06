import * as Util from '@/utils';

import Editor from '@/components/Editor';
import Flow from '@/components/Flow';
import Mind from '@/components/Mind';
import Command from '@/components/Command';
import ItemPanel, { Item } from '@/components/ItemPanel';
import DetailPanel from '@/components/DetailPanel';
import { RegisterNode, RegisterEdge, RegisterCommand, RegisterBehavior } from '@/components/Register';
import { withEditorContext } from '@/components/EditorContext';

import ItemPopover from '@/plugins/ItemPopover';
import ContextMenu from '@/plugins/ContextMenu';
import EditableLabel from '@/plugins/EditableLabel';

export {
  Util,
  Flow,
  Mind,
  Command,
  Item,
  ItemPanel,
  DetailPanel,
  RegisterNode,
  RegisterEdge,
  RegisterCommand,
  RegisterBehavior,
  withEditorContext,
  ItemPopover,
  ContextMenu,
  EditableLabel,
};

export default Editor;
