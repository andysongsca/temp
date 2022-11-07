import React, { useState } from "react";

const LoadMoreButton = (props) => {
  const [loading, setLoading] = useState(false);
  const {onClick} = props
  const onClickLoadMore = () => {
    setLoading(true);
    onClick().finally(() => setLoading(false));
  };

  return (
    <>
      <div className="more-comments-wrapper">
        <div className="more-comments" onClick={onClickLoadMore}>
          {loading ? "···" : "More comments"}
        </div>
      </div>
      <style>{`
        .more-comments-wrapper {
          width: 100%;
          text-align: center;
        }
        .more-comments {
          cursor: pointer;
          color: #017ef9;
          border: 1px solid #017ef9;
          border-radius: 4px;
          font-size: 14px;
          line-height: 16px;
          width: 130px;
          padding: 6px 0;
          margin: auto auto 8px;
          margin-top: 12px;
        }
      `}</style>
    </>
  );
};

export default LoadMoreButton;