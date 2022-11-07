import React, { useState, useRef, useEffect } from "react";
import Cropper from "cropperjs";
import { default as Upload, RcFile } from "antd/lib/upload";
import "cropperjs/dist/cropper.min.css";

import {
  StyledCover,
  StyledIllustrate,
  StyledComponent,
  StyledUpload,
  StyledActions,
} from "./styled";
import { ImageUploaderProps } from "./types";
import Button from "../Button";
import Theme, { ThemeProps } from "../themes";

const statusMessages = {
  "0": { code: 0, message: "success" },
  "1": { code: 1, message: "Image dimensions are too small" },
  "2": { code: 2, message: "The image exceeds maximum allowed size" },
  "3": { code: 3, message: "Upload failed due to unknown error" },
}


const ImageUploader = ({
  className,
  children,
  coverText,
  image,
  previewType = "",
  previewWidth = 440,
  allowReselect = true,
  aspectRatio = NaN,
  outputWidth,
  outputHeight,
  maxWidth = 4096,
  maxHeight = 4096,
  minWidth = 100,
  minHeight = 100,
  sizeLimit = 5000000,
  theme = "default",
  onUpload,
  onPreview,
  onCancel,
  onError = (err) => { console.log(err.code, err.message); },
}: ImageUploaderProps & ThemeProps) => {
  const [croppedView, setCroppedView] = useState("");
  const [imgPreview, setImgPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const cropper = useRef<any>(null);
  const imageEl = useRef<HTMLImageElement | HTMLCanvasElement>(null);

  const getCropperPreview = () => {
    // @ts-ignore
    const canvas = cropper.current.getCroppedCanvas({ width: 400, height: 400 });
    setCroppedView(canvas.toDataURL("image/png"));
  };

  const onReady = () => {
    //  set the crop box the same as the image
    const canvas = cropper.current;
    const imgData = canvas.getImageData();
    setIsLoading(false);
    canvas.setCropBoxData({
      left: 0,
      top: 0,
      width: imgData.width,
      height: imgData.height,
    });
    if (imgData.naturalWidth < minWidth || imgData.naturalHeight < minHeight) {
      onError(statusMessages["1"]);
      canvas.disable();
    } else {
      onPreview && onPreview();
      getCropperPreview();
    }
  };

  const destroyPreview = () => {
    if (cropper.current) {
      // @ts-ignore
      window.URL.revokeObjectURL(imgPreview);
      // @ts-ignore
      cropper.current.destroy();
      cropper.current = null;
    }
  };

  useEffect(() => {
    if (imgPreview) {
      destroyPreview();
      // @ts-ignore
      cropper.current = new Cropper(imageEl.current, {
        zoomable: false,
        scalable: false,
        movable: false,
        minCropBoxWidth: minWidth,
        minCropBoxHeight: minHeight,
        aspectRatio: aspectRatio,
        ready: onReady,
        cropend: getCropperPreview,
      });
    }
  }, [imgPreview]);

  const handlePreview = ({ file }: any) => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      //  if the file is not an image, ignore
      if (!file.type.match("image.*")) {
        return;
      }
      const reader = new FileReader();
      setIsLoading(true);
      reader.onload = () => {
        // @ts-ignore
        setImgPreview(reader.result || "");
      };

      reader.readAsDataURL(file);
    } else {
      alert("The File APIs are not fully supported in this browser.");
    }
  };

  const clearPreview = () => {
    destroyPreview()
    setImgPreview("");
  };

  const handleCancel = () => {
    clearPreview();
    onCancel && onCancel();
  };

  const handleUpload = () => {
    const canvas = cropper.current;
    const imgData = canvas.getImageData();
    let imgMaxWidth = Math.min(imgData.naturalWidth, maxWidth);
    let imgMaxHeight = Math.min(imgData.naturalHeight, maxHeight);

    canvas.getCroppedCanvas({
      width: outputWidth,
      height: outputHeight,
      fillColor: "#ffffff",
      maxWidth: imgMaxWidth,
      maxHeight: imgMaxHeight,
      minWidth,
      minHeight,
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "high",
    }).toBlob((blob: any) => {
      clearPreview();
      onUpload(blob);
    }, "image/jpeg", 1);
  };

  const validateImage = (file: RcFile) => {
    if (file.size > sizeLimit) {
      onError(statusMessages[2]);
      return false;
    }
    return true;
  };

  return (
    <Theme themeName={theme}>
      {(allowReselect || !imgPreview) && <StyledComponent className={className}>
        <StyledCover image={image} className={`nb-uploader-cover ${isLoading ? "loading" : ""}`}>
          <Upload
            showUploadList={false}
            customRequest={handlePreview}
            beforeUpload={validateImage}
            openFileDialogOnClick={false}
          >
            {isLoading ? <span>Loading ...</span> : !image && <span>{coverText || ""}</span>}
          </Upload>
        </StyledCover>
        <StyledIllustrate className="nb-uploader-help-text">
          {children}
        </StyledIllustrate>
      </StyledComponent>}

      {imgPreview && (
        <StyledUpload>
          <div className="cropper" style={{ width: previewWidth, display: isLoading ? "hidden" : "block" }}>
            {/* @ts-ignore */}
            <img ref={imageEl} src={imgPreview} alt="source" style={{ display: 'block', width: previewWidth }} />
          </div>
          {previewType !== "" && <img src={croppedView} className={`preview ${previewType}`} alt="cropped preview" />}
        </StyledUpload>
      )}

      {imgPreview && (
        <StyledActions width={previewWidth} className="buttons">
          <Button type="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleUpload}>
            OK
          </Button>
        </StyledActions>
      )}
    </Theme>
  );
};

export default ImageUploader;
