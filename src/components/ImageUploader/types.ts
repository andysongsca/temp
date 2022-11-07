import { ReactNode } from "react";

export interface CoverProps {
  image?: string;
}

export interface ActionsProps {
  width: number;
}

export interface ImageUploaderProps {
  className?: string;
  children?: ReactNode;
  coverText?: string;
  image?: string;
  previewType?: "circle" | "square" | "";
  previewWidth?: number;
  allowReselect?: boolean;
  aspectRatio?: number;
  outputWidth?: number;
  outputHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  sizeLimit?: number;
  theme?: "default" | "dark" | "";
  onUpload: (blob: any) => void;
  onCancel?: () => void;
  onPreview?: () => void;
  onError?: (err: { code: number, message: string }) => void;
}

export interface CanvasOpt {
  width: number;
  height: number;
}
