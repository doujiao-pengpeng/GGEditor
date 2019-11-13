import React from 'react';
import isArray from 'lodash/isArray';
import pick from 'lodash/pick';
import { addListener } from '@/utils';
import Global from '@/common/Global';
import { EditorEvent, GraphCommonEvent, GraphState } from '@/common/constants';
import { EventHandle, CommandEvent, GraphStateEvent } from '@/common/interfaces';
import commandManager from '@/common/commandManager';
import EditorContext from '@/common/context/EditorContext';
import EditorPrivateContext, { EditorPrivateContextProps } from '@/common/context/EditorPrivateContext';
import '@/components/Graph/shape/nodes/bizNode';

interface GGEditorProps {
  className?: string;
  style?: React.CSSProperties;
  [EditorEvent.onBeforeExecuteCommand]?: EventHandle<CommandEvent>;
  [EditorEvent.onAfterExecuteCommand]?: EventHandle<CommandEvent>;
}

interface GGEditorState extends EditorPrivateContextProps {}

class GGEditor extends React.Component<GGEditorProps, GGEditorState> {
  static setTrackable(trackable: boolean) {
    Global.setTrackable(trackable);
  }

  lastMousedownTarget: EventTarget | null;

  constructor(props: GGEditorProps) {
    super(props);

    this.state = {
      graph: null,
      graphState: GraphState.CanvasSelected,
      setGraph: this.setGraph,
      setGraphState: this.setGraphState,
      canExecuteCommand: this.canExecuteCommand,
      executeCommand: this.executeCommand,
    };

    this.lastMousedownTarget = null;
  }

  bindEvent(graph: G6.Graph) {
    const { props } = this;

    addListener<EventHandle<CommandEvent>>(
      graph,
      EditorEvent.onBeforeExecuteCommand,
      props[EditorEvent.onBeforeExecuteCommand],
    );

    addListener<EventHandle<CommandEvent>>(
      graph,
      EditorEvent.onAfterExecuteCommand,
      props[EditorEvent.onAfterExecuteCommand],
    );

    addListener<EventHandle<GraphStateEvent>>(graph, EditorEvent.onGraphStateChange, ({ graphState }) => {
      if (graphState === this.state.graphState) {
        return;
      }

      this.setState({
        graphState,
      });
    });
  }

  bindShortcut(graph: G6.Graph) {
    window.addEventListener(GraphCommonEvent.onMouseDown, e => {
      this.lastMousedownTarget = e.target;
    });

    graph.on(GraphCommonEvent.onKeyDown, (e: any) => {
      const canvasElement = graph.get('canvas').get('el');

      if (this.lastMousedownTarget !== canvasElement) {
        return;
      }

      Object.values(commandManager.command).some(command => {
        const { name, shortcuts } = command;

        const flag = shortcuts.some((shortcut: string | string[]) => {
          const { key } = e;

          if (!isArray(shortcut)) {
            return shortcut === key;
          }

          return shortcut.every((item, index) => {
            if (index === shortcut.length - 1) {
              return item === key;
            }

            return e[item];
          });
        });

        if (flag) {
          if (this.canExecuteCommand(name)) {
            // Prevent default
            e.preventDefault();

            // Execute command
            this.executeCommand(name);

            return true;
          }
        }

        return false;
      });
    });
  }

  setGraph = (graph: G6.Graph) => {
    this.setState({
      graph,
    });

    this.bindEvent(graph);
    this.bindShortcut(graph);
  };

  setGraphState = (graphState: GraphState) => {
    this.setState({
      graphState,
    });
  };

  canExecuteCommand = (name: string) => {
    const { graph } = this.state;

    if (graph) {
      return commandManager.canExecute(graph, name);
    }

    return false;
  };

  executeCommand = (name: string, params?: object) => {
    const { graph } = this.state;

    if (graph) {
      commandManager.execute(graph, name, params);
    }
  };

  render() {
    const { children } = this.props;
    const { graph, executeCommand } = this.state;

    return (
      <EditorContext.Provider
        value={{
          graph,
          executeCommand,
        }}
      >
        <EditorPrivateContext.Provider value={this.state}>
          <div {...pick(this.props, ['className', 'style'])}>{children}</div>
        </EditorPrivateContext.Provider>
      </EditorContext.Provider>
    );
  }
}

export default GGEditor;