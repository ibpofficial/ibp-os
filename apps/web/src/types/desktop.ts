export type AppId =
  | 'studio'
  | 'terminal'
  | 'explorer'
  | 'monitor'
  | 'handbook'
  | 'settings'
  | 'playground';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  params?: Record<string, any>;
}

export interface AppDefinition {
  id: AppId;
  title: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
}
