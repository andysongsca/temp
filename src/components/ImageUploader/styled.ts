import styled from "styled-components";

import { ActionsProps, CoverProps } from "./types";
import imgUploadDefault from "@/asset/img/upload-account-cover.png";
import imgUploadDefaultHover from "@/asset/img/upload-account-cover-hover.png";

export const StyledComponent = styled.label`
  display: flex;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 16px;
  line-height: 1.5;
  font-variant: tabular-nums;
  background: ${(props) => props.theme.colors.bgPrimary};
`;

export const StyledIllustrate = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 15px;
  color: ${(props) => props.theme.colors.primary};

  & > div {
    margin-bottom: 9px;
  }

  & > span {
    font-size: 12px;
  }
`;

export const StyledCover = styled.div<CoverProps>`
  position: relative;
  display: block;
  cursor: pointer;
  width: 84px;
  height: 84px;
  background-size: cover;
  border-radius: 50%;
  text-size-adjust: 100%;
  background-image: url(${(props) => (props.image ? props.image : imgUploadDefault)});
  background-repeat: no-repeat;
  z-index: 100;

  &.loading {
    background-image: none;
    background-color: #FEF6F6;
  }

  &:hover {
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(${imgUploadDefaultHover});
      background-size: cover;
      pointer-events: none;
      opacity: 0.8;
    }
  }

  & .ant-upload {
    background-position: center center;
    background-size: cover;
    display: block !important;
    width: 100%;
    height: 100%;
    -webkit-appearance: none;
    outline: none;
    font-size: 12px;
    text-align: center;
    span[role=button] span {
      display: inline-block;
      margin-top: 40%;
    }
  }
`;

export const StyledUpload = styled.div`
  display: flex;

  & > .cropper {
    float: left;
    width: 100%;
  }

  & .preview {
    height: 150px;
    float: left;
    margin-left: 10px;

    &.circle {
      border-radius: 200px;
    }
  }
`;

export const StyledActions = styled.div<ActionsProps>`
  clear: both;
  position: relative;
  display: flex;
  justify-content: flex-end;
  width: ${(props) => props.width + "px"};
  padding-bottom: 20px;
  background-color: #fff;
  z-index: 100;
`;
